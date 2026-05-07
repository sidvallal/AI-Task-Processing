# AI Task Processing Platform

A simple full-stack task processing platform built for the internship assignment.

Users can register, log in, create text-processing tasks, and view task status, logs, and results. Tasks are queued in Redis and processed asynchronously by a Python worker.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Worker: Python
- Database: MongoDB
- Queue: Redis
- Containers: Docker and Docker Compose
- Deployment: Kubernetes manifests in a separate infra folder
- GitOps: Argo CD
- CI/CD: GitHub Actions + Docker Hub

## Project Structure

```text
ai-task-platform/
├── frontend/
├── backend/
├── worker/
├── docker-compose.yml
├── .github/workflows/
└── ai-task-platform-infra/
    ├── k8s/
    ├── argocd/
    └── README.md
```

The app code and infra manifests are separated. For final submission, push `ai-task-platform-infra/` as its own GitHub repository.

## Features

- User registration and login
- JWT authentication
- Password hashing with bcrypt
- Helmet security middleware
- API rate limiting
- Create tasks with title, input text, and operation
- Supported operations: uppercase, lowercase, reverse, word count
- Redis queue for background processing
- Python worker updates task status and result
- Status tracking: pending, running, success, failed
- Dashboard for task results and logs

## Local Development

Create a `.env` file in the project root:

```env
JWT_SECRET=replace-with-a-long-random-secret
```

Run everything locally:

```bash
docker compose up --build
```

Open:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Health:   http://localhost:5000/health
```

## Lint

```bash
cd frontend
npm ci
npm run lint
```

```bash
cd backend
npm ci
npm run lint
```

## Docker

The project includes separate multi-stage Dockerfiles for:

- `frontend/Dockerfile`
- `backend/Dockerfile`
- `worker/Dockerfile`

Each application container runs as a non-root user.

## Kubernetes And GitOps

Kubernetes and Argo CD files are in:

```text
ai-task-platform-infra/
```

That folder contains:

- Namespace
- Deployments
- Services
- Ingress
- ConfigMaps
- Secrets template
- Resource requests and limits
- Liveness and readiness probes
- Worker replicas for scaling
- Argo CD Application with auto-sync, prune, and self-heal

See [ai-task-platform-infra/README.md](ai-task-platform-infra/README.md) for Argo CD installation, dashboard access, verification, and screenshot instructions.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for:

- Worker scaling strategy
- Handling 100k tasks/day
- Database indexing strategy
- Redis failure handling
- Staging and production deployment plan

## CI/CD

GitHub Actions workflows are in:

```text
.github/workflows/
├── ci.yml
├── docker-build-push.yml
└── update-infra.yml
```

Pipeline flow:

```text
Developer push
-> GitHub Actions lint
-> Build Docker images
-> Push images to Docker Hub
-> Update image tags in infra repository
-> Argo CD detects the infra change
-> Kubernetes deploys automatically
```

Required GitHub secrets:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
INFRA_REPO_TOKEN
```

Before using CI/CD, update this value in `.github/workflows/update-infra.yml`:

```yaml
INFRA_REPOSITORY: YOUR_GITHUB_ORG/ai-task-platform-infra
```

## Verification Checklist

- Register and log in from the frontend.
- Create a task using one supported operation.
- Confirm status changes from `pending` to `running` to `success`.
- Open task details and verify logs and result.
- Run `docker compose up --build` successfully.
- Run frontend and backend lint successfully.
- Push infra repository and confirm Argo CD shows `Synced` and `Healthy`.
- Push app code and confirm CI/CD updates the infra repository image tag.

## Notes For Reviewers

This project intentionally stays simple and focuses only on the assignment requirements. It does not include Helm, Terraform, extra microservices, or unrelated application features.
