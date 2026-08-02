# ADR-004: Local development with Skaffold + Kubernetes

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-02 |

## Context

Team needs a single command to build images and deploy all (or subset) services locally.

## Decision

Use **Skaffold** (`push: false`) against **Docker Desktop Kubernetes (kubeadm)**. Prefer kubeadm over Docker Desktop Kind when using the classic Docker image store so local images are visible (`IfNotPresent`).

## Consequences

- Full `skaffold.yaml` is memory-heavy.
- Slim file `skaffold-minio.yaml` is the default recommendation for product/media work.
- Image pull failures on Kind+Docker image store are expected — documented in runbook.
