# Operations Runbook

| Field | Value |
|-------|-------|
| **Version** | 0.1 |
| **Last updated** | 2026-08-02 |

---

## 1. Healthy local bootstrap

### Prerequisites

- Docker Desktop running
- Kubernetes **kubeadm** (not Kind) if using Docker image store + Skaffold `push: false`
- `kubectl`, `skaffold`, Node.js
- ingress-nginx installed

### Start (slim — recommended)

```powershell
cd D:\LapTrinh\TableTennisShop
skaffold dev -f skaffold-minio.yaml
```

### Start (full stack — heavy RAM)

```powershell
skaffold dev
```

Target **≥6GB** WSL/Docker memory for full stack. Caps: `%USERPROFILE%\.wslconfig` + Docker Desktop Resources.

### Stop / reclaim RAM

```powershell
# Ctrl+C skaffold first
docker desktop stop
wsl --shutdown
```

---

## 2. Install ingress-nginx

```powershell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
kubectl wait --namespace=ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=180s
```

### Symptom: Ingress create fails — admission webhook `connection refused`

Local Docker Desktop often cannot reach the validating webhook in time.

```powershell
kubectl delete validatingwebhookconfiguration ingress-nginx-admission --ignore-not-found=true
# re-apply ingress / re-run skaffold
```

---

## 3. Common incidents

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| `can't be pulled` for `nguyennoah/*` | Kind cluster + Docker image store | Switch DD Kubernetes to **kubeadm**; rebuild |
| `TLS handshake timeout` / `:6443 connection refused` | API server down / Docker engine 500 / OOM | Restart Docker Desktop; raise memory; use slim profile |
| Docker API `500 Internal Server Error` | Engine unhealthy | `docker desktop restart` or stop + `wsl --shutdown` + start |
| Pods Pending | PVC / resources | `kubectl get pvc,pods`; check events |
| NATS connection errors | NATS not ready | `kubectl logs deploy/nats-depl` |

---

## 4. Secrets (dev)

```powershell
kubectl apply -f infra/k8s/00-jwt-secret.yaml
kubectl apply -f infra/k8s/01-minio-secret.yaml
```

Dev defaults only — see Security Baseline.

---

## 5. Useful commands

```powershell
kubectl get pods -A
kubectl logs -f deployment/product-depl
kubectl port-forward svc/minio-srv 9001:9001
docker info | findstr Memory
```

---

## 6. Escalation / ownership

| Area | First look |
|------|------------|
| Product/media | `04-services/PRODUCT_DOCUMENT.md` |
| Events | `02-architecture/EVENT_ARCHITECTURE.md` |
| Infra manifests | `02-architecture/INFRA_DOCUMENT.md` |
| Security | `03-security/SECURITY_BASELINE.md` |
