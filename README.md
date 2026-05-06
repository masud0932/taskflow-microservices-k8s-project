# TaskFlow Microservices Platform

Production-grade cloud-native microservices platform built with Kubernetes, AWS EKS, Terraform, Jenkins, ArgoCD, PostgreSQL, RabbitMQ, Prometheus, and Grafana.

## Architecture Overview
Microservices-based backend architecture
API Gateway with JWT authentication
Event-driven communication using RabbitMQ
Kubernetes orchestration on AWS EKS
Infrastructure as Code using Terraform
GitOps deployment using ArgoCD
CI/CD automation with Jenkins
Monitoring and observability using Prometheus and Grafana

## Tech Stack

| Category               | Technologies        |
| ---------------------- | ------------------- |
| Frontend               | React, Vite         |
| Backend                | Node.js, Express    |
| Database               | PostgreSQL          |
| Messaging              | RabbitMQ            |
| Containerization       | Docker              |
| Orchestration          | Kubernetes, AWS EKS |
| Infrastructure as Code | Terraform           |
| CI/CD                  | Jenkins             |
| GitOps                 | ArgoCD              |
| Monitoring             | Prometheus, Grafana |
| Authentication         | JWT                 |


## Phase 1: Initial Setup and Local Development

### 1. Clone Repository

```bash
git clone https://github.com/masud0932/taskflow-microservices-project.git
cd taskflow-microservices-project
```
### 2. Project Structure

taskflow-microservices-project/
├── frontend/
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── task-service/
│   ├── project-service/
│   └── notification-service/
├── docker-compose.yml
├── k8s/
├── helm/
├── infra/
└── Jenkinsfile

### 2: Install Required Tools
Install the following tools before running the project:
-   Git
-   Docker
-   Node.js
-   npm
-   Terraform
-   AWS CLI


### 3. Start Local Development Environment

Run all services locally using Docker Compose:

```bash
sudo docker compose up --build
```

### 4. Access Services

- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- RabbitMQ UI: http://localhost:15672

### 5. Local Development Features
- Local microservices communication
- PostgreSQL database integration
- RabbitMQ event messaging
- JWT authentication flow
- Frontend integration with backend APIs
- Dockerized local development workflow

## API Testing

### Signup

```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Masud","email":"masud@example.com","password":"123456"}'
```

### Login

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"masud@example.com","password":"123456"}'
```

## Real Deployment

## Phase 1: AWS Infrastructure Provisioning with Terraform

This phase provisions the complete AWS infrastructure for the Taskflow Microservices Platform using Terraform. The infrastructure is designed following production-style cloud architecture and Infrastructure as Code (IaC) best practices.

### Architecture Overview

The infrastructure layer provisions:

- AWS VPC with public/private subnets
- Amazon EKS cluster
- Managed node groups
- Amazon ECR repositories
- Amazon RDS PostgreSQL
- Amazon MQ (RabbitMQ)
- IAM roles and IRSA
- AWS Secrets Manager integration
- Terraform remote backend (S3 + DynamoDB + KMS)

### Infrastructure Structure

terraform/
├── bootstrap/
├── infra/
└── platform/

### Bootstrap Layer

The bootstrap layer creates the Terraform remote backend.

#### Resources Created
S3 bucket for Terraform state
DynamoDB table for state locking
KMS key for state encryption

#### Run

```bash
cd terraform/bootstrap
terraform init
terraform apply
```

## Infrastructure Layer

The infrastructure layer provisions the AWS cloud resources.

### Resources Created
#### Networking
- VPC
- Public subnets
- Private subnets
- NAT Gateway
- Route tables
- Internet Gateway

#### Kubernetes
- Amazon EKS cluster
- Managed node group
- IAM roles
- OIDC provider for IRSA

#### Container Registry

Amazon ECR repositories for:

- frontend
- api-gateway
- auth-service
- user-service
- task-service
- project-service
- notification-service

#### Database
- Amazon RDS PostgreSQL
- RDS-managed master password
- Automatic secret storage in AWS Secrets Manager

#### Messaging
- Amazon MQ RabbitMQ broker
- RabbitMQ credentials stored in AWS Secrets Manager


## Remote Terraform State

Terraform state is securely stored using:

- Amazon S3
- DynamoDB locking
- AWS KMS encryption


## Secret Management

This project uses:

AWS Secrets Manager
↓
External Secrets Operator
↓
Kubernetes Secrets
↓
Application Pods

Secrets are never hardcoded in Kubernetes manifests or Git repositories.

## Run Infrastructure Layer

```bash
cd terraform/infra
terraform init
terraform plan
terraform apply
```

## Important Terraform Outputs

After successful deployment:

```bash
terraform output
```

Important outputs include:

- EKS cluster name
- VPC ID
- OIDC provider ARN
- RDS endpoint
- RDS master secret ARN
- RabbitMQ endpoint
- ECR repository URLs

These outputs are later used by the platform and GitOps layers.

## Production Features
- Infrastructure as Code with Terraform
- Production-style VPC design
- Private networking for backend services
- Secure secret management
- IAM Roles for Service Accounts (IRSA)
- Encrypted Terraform state
- Container image vulnerability scanning in ECR
- Modular Terraform architecture

# Phase 2: Kubernetes Platform & Addons Deployment

This phase installs the core Kubernetes platform components inside the Amazon EKS cluster using Terraform and Helm.

The platform layer prepares the cluster for secure application deployment, GitOps, ingress management, monitoring, and secret synchronization.

## Platform Architecture

terraform/platform
   ↓
Connects to existing EKS cluster
   ↓
Installs Kubernetes platform tools

## Components Installed

### AWS Load Balancer Controller

The AWS Load Balancer Controller integrates Kubernetes Ingress resources with AWS Application Load Balancers (ALB).

#### Features
Automatic ALB provisioning
Ingress integration
Target group management
External traffic routing

### External Secrets Operator (ESO)

External Secrets Operator synchronizes secrets from AWS Secrets Manager into Kubernetes Secrets.

#### Secret Flow

AWS Secrets Manager
   ↓
External Secrets Operator
   ↓
Kubernetes Secret
   ↓
Application Pods

#### Used For
- RDS credentials
- RabbitMQ credentials
- Grafana credentials

### Argo CD

Argo CD enables GitOps-based Kubernetes deployment.

#### Features

- Continuous deployment
- GitOps synchronization
- Automatic drift detection
- Self-healing deployments

#### Deployment Flow

GitHub Repository
   ↓
Argo CD
   ↓
EKS Cluster


### Namespaces Created

The platform layer creates the following namespaces:

- argocd
- external-secrets
- monitoring
- dev

### IAM Roles for Service Accounts (IRSA)

This project uses IRSA for secure AWS access from Kubernetes workloads.

#### IRSA Used By

- AWS Load Balancer Controller
- External Secrets Operator

#### Flow

Kubernetes ServiceAccount
   ↓
IAM Role
   ↓
AWS API Access

No static AWS credentials are stored inside pods.

### Monitoring Strategy

Prometheus and Grafana are deployed later through Argo CD using the kube-prometheus-stack Helm chart.

The platform layer only prepares the required namespace and infrastructure.

### Run Platform Layer

```bash
cd terraform/platform

terraform init
terraform plan
terraform apply
```

### Platform Structure

terraform/platform/
├── provider.tf
├── versions.tf
├── variables.tf
├── terraform.tfvars
├── main.tf
├── outputs.tf
└── modules/
    └── addons/

Phase 3: GitOps Deployment with Argo CD

This phase deploys the Taskflow microservices platform into Amazon EKS using GitOps practices with Argo CD and Helm charts.

All Kubernetes manifests and Helm configurations are stored in a dedicated GitOps repository, enabling automated deployment, synchronization, and self-healing.

GitOps Architecture

GitHub Repository
   ↓
Argo CD
   ↓
Amazon EKS Cluster
   ↓
Kubernetes Resources

GitOps Repository Structure
taskflow-gitops-manifests/
├── argocd/
│   ├── external-secrets-app.yaml
│   ├── monitoring-application.yaml
│   └── taskflow-dev-application.yaml
│
├── helm-charts/
│   └── taskflow/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── configmaps.yaml
│           ├── deployments.yaml
│           ├── services.yaml
│           ├── ingress.yaml
│           ├── hpa.yaml
│           └── external-secrets/
│               ├── clustersecretstore.yaml
│               ├── db-externalsecret.yaml
│               └── rabbitmq-externalsecret.yaml
│
└── monitoring/
    └── kube-prometheus-stack-values.yaml
Argo CD Applications
External Secrets Operator Application

Deploys the External Secrets Operator Helm chart.

external-secrets-app.yaml
Monitoring Application

Deploys Prometheus and Grafana using the kube-prometheus-stack Helm chart.

monitoring-application.yaml
Taskflow Application

Deploys the Taskflow microservices Helm chart.

taskflow-dev-application.yaml
Microservices Deployed

The platform deploys:

Frontend
API Gateway
Auth Service
User Service
Task Service
Project Service
Notification Service
Secret Management Flow
AWS Secrets Manager
   ↓
External Secrets Operator
   ↓
Kubernetes Secrets
   ↓
Application Pods
Database Flow
Amazon RDS PostgreSQL
   ↓
AWS Secrets Manager
   ↓
External Secrets Operator
   ↓
taskflow-db-secret
   ↓
Backend Services
RabbitMQ Flow
Amazon MQ RabbitMQ
   ↓
AWS Secrets Manager
   ↓
External Secrets Operator
   ↓
taskflow-rabbitmq-secret
   ↓
task-service / notification-service
Ingress Flow
User
   ↓
AWS Application Load Balancer
   ↓
Ingress Resource
   ↓
Frontend / API Gateway

The AWS Load Balancer Controller automatically provisions the ALB from Kubernetes Ingress resources.

Monitoring Stack

The monitoring stack includes:

Prometheus
Grafana
Alertmanager
kube-state-metrics
node-exporter
Auto Sync & Self Healing

Argo CD continuously monitors the Git repository.

Features
Automatic synchronization
Drift detection
Self-healing
Automatic pruning of removed resources
Deploy Argo CD Applications
kubectl apply -f argocd/external-secrets-app.yaml

kubectl apply -f argocd/monitoring-application.yaml

kubectl apply -f argocd/taskflow-dev-application.yaml
Continuous Delivery Flow
Developer
   ↓
Push code to GitHub
   ↓
Jenkins CI/CD pipeline
   ↓
Build Docker images
   ↓
Push images to Amazon ECR
   ↓
Update Helm chart image tags
   ↓
Git commit to GitOps repository
   ↓
Argo CD detects changes
   ↓
Automatic deployment to EKS
Production Features
GitOps-based Kubernetes deployment
Declarative infrastructure and application management
Automated deployment synchronization
Secure secret management
ALB ingress integration
Horizontal Pod Autoscaling
Centralized monitoring stack
Production-style microservices deployment

# Phase 4: CI/CD Automation with Jenkins

This phase implements the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Taskflow Microservices Platform using Jenkins.

The pipeline automates:

- Application build
- Docker image creation
- Security scanning
- Image push to Amazon ECR
- GitOps manifest updates
- Automated Kubernetes deployment through Argo CD

## CI/CD Architecture

Developer
   ↓
GitHub Repository
   ↓
GitHub Webhook
   ↓
Jenkins Pipeline
   ↓
Build & Test
   ↓
Docker Image Build
   ↓
Push Image to Amazon ECR
   ↓
Update GitOps Repository
   ↓
Argo CD detects changes
   ↓
Deploy to Amazon EKS

## Jenkins Responsibilities

The Jenkins pipeline performs:

- Source code checkout
- Application build
- Docker image build
- Docker image tagging
- Push images to Amazon ECR
- Update Helm chart image tags
- Commit changes to GitOps repository

## CI/CD Workflow

### Step 1: Developer Pushes Code

Developer
   ↓
Push code to GitHub

### Step 2: GitHub Webhook Triggers Jenkins
GitHub
   ↓
Webhook
   ↓
Jenkins Pipeline

### Step 3: Jenkins Builds Docker Images

Each microservice is containerized:

- frontend
- api-gateway
- auth-service
- user-service
- task-service
- project-service
- notification-service

### Step 4: Push Images to Amazon ECR

Jenkins
   ↓
Amazon ECR

Images are tagged using:

- build number
- Git commit SHA
- version tags

## ECR Repositories

Separate ECR repositories are created for each service:

- taskflow-frontend
- taskflow-api-gateway
- taskflow-auth-service
- taskflow-user-service
- taskflow-task-service
- taskflow-project-service
- taskflow-notification-service

## GitOps Update Flow

After pushing images:

Jenkins
   ↓
Updates Helm values/image tag
   ↓
Pushes changes to GitOps repository
   ↓
Argo CD detects new commit
   ↓
Deploys updated version

## Deployment Automation

Argo CD automatically synchronizes:

- Deployments
- Services
- Ingress
- HPA
- ExternalSecrets

No manual Kubernetes deployment commands are required.

## Security & Secret Handling

The pipeline uses:

- AWS IAM roles
- Kubernetes IRSA
- AWS Secrets Manager
- External Secrets Operator

Sensitive credentials are not stored directly in Git repositories.

## Example Pipeline Stages
1. Checkout Source
2. Build Application
3. Run Tests
4. Build Docker Image
5. Authenticate to Amazon ECR
6. Push Docker Image
7. Update GitOps Repository
8. Push Updated Helm Values
9. Argo CD Deploys Automatically

## Continuous Deployment Flow

Code Change
   ↓
Jenkins CI Pipeline
   ↓
New Docker Image
   ↓
Amazon ECR
   ↓
GitOps Repository Update
   ↓
Argo CD Sync
   ↓
Updated Pods Running in EKS

## Production Features
- Automated CI/CD pipeline
- GitOps deployment workflow
- Immutable container image deployment
- Automated ECR integration
- Kubernetes continuous delivery
- Secure AWS authentication
- Infrastructure and application separation
- Production-style deployment automation
