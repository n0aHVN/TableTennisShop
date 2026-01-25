# Production Deployment Guide

**Document Version:** 1.0  
**Last Updated:** January 25, 2026  
**Owner:** DevOps Team  
**Classification:** Internal

---

## Table of Contents
1. [Deployment Overview](#deployment-overview)
2. [Environment Strategy](#environment-strategy)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Production Deployment](#production-deployment)
5. [Monitoring & Observability](#monitoring--observability)
6. [Rollback Procedures](#rollback-procedures)
7. [Disaster Recovery](#disaster-recovery)
8. [Security & Compliance](#security--compliance)

---

## Deployment Overview

### Deployment Model
- **Platform:** Kubernetes (EKS, GKE, or AKS)
- **Container Registry:** AWS ECR / Google Container Registry / Azure ACR
- **CI/CD:** GitHub Actions
- **Infrastructure as Code:** Kubernetes manifests + Helm charts
- **Deployment Strategy:** Rolling updates with zero downtime

### Release Schedule
- **Production Releases:** Tuesdays and Thursdays, 10:00 AM UTC
- **Hotfixes:** As needed with manager approval
- **Feature Freeze:** Fridays (production changes only for critical issues)

---

## Environment Strategy

### Environment Tiers

| Environment | Purpose | URL | Auto-Deploy | Data |
|-------------|---------|-----|-------------|------|
| **Local** | Developer machines | localhost | N/A | Seed data |
| **Development** | Feature testing | dev.tabletennisshop.com | On merge to `dev` | Anonymized prod data |
| **Staging** | Pre-production validation | staging.tabletennisshop.com | On merge to `staging` | Prod-like data |
| **Production** | Live customer traffic | www.tabletennisshop.com | Manual approval | Real data |

### Environment Configuration

**Development:**
- Lower resource limits
- Debug logging enabled
- Mock payment gateway
- Single replica per service

**Staging:**
- Production-like resources
- Info-level logging
- Test payment gateway
- 2 replicas per service

**Production:**
- Full resource allocation
- Warn/error logging only
- Live payment gateway
- 3+ replicas per service
- Auto-scaling enabled

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          registry: ${{ secrets.REGISTRY_URL }}
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}
      - name: Build and push images
        run: |
          docker build -t $REGISTRY/auth:${{ github.sha }} ./auth
          docker push $REGISTRY/auth:${{ github.sha }}
          # Repeat for all services

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: azure/k8s-set-context@v3
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG }}
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/auth-depl \
            auth=$REGISTRY/auth:${{ github.sha }}
          kubectl rollout status deployment/auth-depl
```

### Pipeline Stages

1. **Source** → Code committed to GitHub
2. **Build** → Compile TypeScript, run linters
3. **Test** → Unit tests, integration tests (coverage >80%)
4. **Security Scan** → Snyk/Trivy for vulnerabilities
5. **Build Images** → Docker images for each service
6. **Push to Registry** → Tag with git SHA
7. **Deploy to Dev** → Automatic on merge to `dev`
8. **Deploy to Staging** → Automatic on merge to `staging`
9. **Manual Approval** → PM/Tech Lead approves production
10. **Deploy to Production** → Rolling update
11. **Smoke Tests** → Automated health checks
12. **Notify** → Slack notification to #deployments

### Quality Gates

**Deployment blocked if:**
- Unit test failures
- Code coverage <80%
- High/critical security vulnerabilities
- Failed integration tests
- Linting errors

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing in staging
- [ ] Database migrations tested
- [ ] Environment variables updated in secrets
- [ ] Monitoring dashboards reviewed
- [ ] Rollback plan documented
- [ ] On-call engineer identified
- [ ] Stakeholders notified
- [ ] Deployment window confirmed (Tuesday/Thursday 10 AM UTC)

### Deployment Steps

#### Step 1: Database Migrations (if needed)

```bash
# Run migrations in a separate job pod
kubectl apply -f infra/k8s/migration-job.yaml
kubectl wait --for=condition=complete job/db-migration --timeout=5m
```

#### Step 2: Update Kubernetes Secrets

```bash
kubectl create secret generic jwt-secret \
  --from-literal=JWT_KEY=<new-key> \
  --dry-run=client -o yaml | kubectl apply -f -
```

#### Step 3: Deploy Services (Rolling Update)

```bash
# Deploy backend services first
kubectl set image deployment/auth-depl auth=registry.io/auth:v1.2.3
kubectl set image deployment/product-depl product=registry.io/product:v1.2.3
kubectl set image deployment/inventory-depl inventory=registry.io/inventory:v1.2.3
kubectl set image deployment/order-depl order=registry.io/order:v1.2.3
kubectl set image deployment/payment-depl payment=registry.io/payment:v1.2.3

# Wait for rollout to complete
kubectl rollout status deployment/auth-depl
kubectl rollout status deployment/product-depl
# ... etc

# Deploy frontend last
kubectl set image deployment/client-depl client=registry.io/client:v1.2.3
kubectl rollout status deployment/client-depl
```

#### Step 4: Verify Deployment

```bash
# Check pod status
kubectl get pods -o wide

# Check logs for errors
kubectl logs -l app=auth --tail=50

# Run smoke tests
curl -f https://www.tabletennisshop.com/api/health || exit 1
curl -f https://www.tabletennisshop.com/api/products || exit 1
```

#### Step 5: Monitor Metrics

Watch for 15 minutes:
- Error rate (should be <0.1%)
- Response time (p95 <100ms)
- CPU/Memory usage
- Database connection pool

#### Step 6: Notify Stakeholders

Post to #deployments Slack channel:
```
✅ Production deployment completed
Version: v1.2.3
Services: auth, product, inventory, order, payment, client
Deployed by: @username
Status: All health checks passing
```

---

## Monitoring & Observability

### Monitoring Stack

- **Metrics:** Prometheus + Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing:** Jaeger (distributed tracing)
- **APM:** New Relic / Datadog
- **Uptime:** Pingdom / UptimeRobot
- **Alerts:** PagerDuty

### Key Metrics to Monitor

**Application Metrics:**
- Request rate (requests/second)
- Error rate (%)
- Response time (p50, p95, p99)
- Throughput (operations/second)

**Infrastructure Metrics:**
- Pod CPU usage (%)
- Pod memory usage (MB)
- Node resource utilization
- Disk I/O

**Business Metrics:**
- Orders created/hour
- Payment success rate
- Cart abandonment rate
- Active users

### Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Error Rate | Error rate >1% for 5min | Critical | Page on-call |
| Slow Response Time | p95 >500ms for 5min | Warning | Investigate |
| Pod Crash Loop | Pod restarts >3 in 10min | Critical | Page on-call |
| Low Disk Space | Disk usage >85% | Warning | Provision more |
| Database Connection Pool | Connections >90% | Warning | Scale up |
| Payment Failures | Payment error rate >5% | Critical | Page on-call + escalate |

### Dashboards

**Service Overview Dashboard:**
- Request rate per service
- Error rate per service
- Latency heatmaps
- Pod health status

**Infrastructure Dashboard:**
- Cluster resource usage
- Node status
- Pod distribution
- Network traffic

**Business Dashboard:**
- Revenue (hourly/daily)
- Order conversion funnel
- Top products
- User activity

---

## Rollback Procedures

### When to Rollback

- Error rate >1% for 5+ minutes
- Critical functionality broken
- Data corruption detected
- Security vulnerability introduced

### Rollback Steps

#### Quick Rollback (Recommended)

```bash
# Rollback to previous version
kubectl rollout undo deployment/auth-depl
kubectl rollout undo deployment/product-depl
# ... for all affected services

# Verify rollback
kubectl rollout status deployment/auth-depl
```

#### Rollback to Specific Version

```bash
# View rollout history
kubectl rollout history deployment/auth-depl

# Rollback to revision 3
kubectl rollout undo deployment/auth-depl --to-revision=3
```

#### Database Rollback

If migration needs rollback:

```bash
# Run down migration
kubectl apply -f infra/k8s/migration-rollback-job.yaml
```

### Post-Rollback Actions

1. Verify all services are healthy
2. Check error rates and logs
3. Notify stakeholders
4. Create incident post-mortem
5. Fix root cause before re-deploying

---

## Disaster Recovery

### Backup Strategy

**MongoDB:**
- Automated daily snapshots at 2 AM UTC
- Retention: 30 days
- Point-in-time recovery available
- Cross-region replication enabled

**Application State:**
- Infrastructure as Code (all manifests in Git)
- Docker images tagged and stored
- Configuration in Git + Kubernetes secrets

### Recovery Procedures

#### Scenario 1: Complete Cluster Failure

1. Provision new cluster via IaC
2. Restore database from latest snapshot
3. Apply Kubernetes manifests
4. Deploy latest images
5. Update DNS (if needed)
6. Verify functionality

**RTO:** 1 hour  
**RPO:** 15 minutes

#### Scenario 2: Database Corruption

1. Identify corruption timestamp
2. Restore from snapshot before corruption
3. Replay event log (if available)
4. Verify data integrity

#### Scenario 3: Regional Outage

1. Activate DR cluster in secondary region
2. Update DNS to point to DR region
3. Monitor traffic shift
4. Communicate with customers

---

## Security & Compliance

### Pre-Production Security Checklist

- [ ] All dependencies scanned for vulnerabilities
- [ ] Secrets rotation completed
- [ ] TLS certificates valid
- [ ] Network policies applied
- [ ] RBAC configured correctly
- [ ] Container images signed
- [ ] Security audit passed

### Compliance Requirements

**PCI DSS (Payment Card Industry):**
- No cardholder data stored
- Payment gateway tokenization
- Encrypted transmission

**GDPR (Data Privacy):**
- User consent tracking
- Right to deletion implemented
- Data encryption at rest
- Audit logs maintained

### Production Access Control

- Production access via bastion host only
- MFA required for all access
- Audit logging enabled
- Least privilege principle
- Regular access reviews (quarterly)

---

## Appendix

### Useful Commands

```bash
# View all deployments
kubectl get deployments

# Scale a deployment
kubectl scale deployment/auth-depl --replicas=5

# Get pod logs
kubectl logs -f <pod-name>

# Execute command in pod
kubectl exec -it <pod-name> -- /bin/sh

# Port forward for debugging
kubectl port-forward svc/auth-srv 3000:3000

# View events
kubectl get events --sort-by='.lastTimestamp'
```

### Contact Information

| Role | Contact | Escalation |
|------|---------|------------|
| DevOps Lead | devops-lead@email.com | Direct manager |
| On-Call Engineer | Via PagerDuty | DevOps Lead |
| Security Team | security@email.com | CISO |
| Database Admin | dba@email.com | DevOps Lead |

---

**Document Approval:**
- DevOps Lead: [Signature] _______________
- Security Lead: [Signature] _______________
- Engineering Manager: [Signature] _______________
