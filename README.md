# TaskFlow Microservices Platform on AWS EKS

Taskflow is a cloud-native microservices platform deployed on Amazon EKS using Terraform, Jenkins, Argo CD, and Helm. The project demonstrates a production-style Kubernetes environment with automated CI/CD pipelines, GitOps deployment, centralized secret management, and full-stack monitoring.

The platform consists of multiple containerized microservices integrated with Amazon RDS PostgreSQL, Amazon MQ RabbitMQ, AWS Secrets Manager, Prometheus, and Grafana. Infrastructure provisioning is fully automated through Terraform, while application deployments are continuously synchronized to Kubernetes using Argo CD.

This project showcases practical experience with AWS cloud infrastructure, Kubernetes operations, Infrastructure as Code, CI/CD automation, GitOps workflows, observability, and production-grade DevOps practices.

# Architecture Overview

The platform is deployed on Amazon EKS using a GitOps-driven Kubernetes architecture integrated with managed AWS services for networking, database, messaging, secret management, and observability.

## Application Deployment Architecture

The following diagram represents the high-level deployment architecture of the Taskflow platform on AWS.

```text
Users
   ↓
AWS Application Load Balancer (ALB)
   ↓
Amazon EKS Cluster
   ├── Frontend
   ├── API Gateway
   ├── Auth Service
   ├── User Service
   ├── Task Service
   ├── Project Service
   ├── Notification Service
   │
   ├── Argo CD
   ├── Prometheus
   ├── Grafana
   └── Alertmanager

AWS Managed Services 
      ├── Amazon RDS PostgreSQL 
      ├── Amazon MQ RabbitMQ 
      ├── AWS Secrets Manager 
      └── Amazon ECR
```

## Key Features

* Infrastructure provisioning is fully automated through Terraform
* Amazon EKS-based microservices architecture
* Jenkins CI pipeline for automated image build and publishing
* GitOps continuous deployment with Argo CD
* AWS Secrets Manager integration through External Secrets Operator
* Amazon RDS PostgreSQL for persistent storage
* Amazon MQ RabbitMQ for asynchronous communication
* Prometheus and Grafana for monitoring and observability
* AWS Application Load Balancer for ingress traffic management

This architecture provides a scalable, automated, and production-style Kubernetes platform that demonstrates Infrastructure as Code, CI/CD automation, GitOps deployment, centralized secret management, and full-stack observability on AWS.


# Technology Stack

| Category                | Technologies                                   |
| ----------------------- | ---------------------------------------------- |
| Cloud Platform          | AWS                                            |
| Container Orchestration | Kubernetes (Amazon EKS)                        |
| Infrastructure as Code  | Terraform                                      |
| CI/CD                   | Jenkins, GitHub Webhooks                       |
| GitOps                  | Argo CD                                        |
| Container Registry      | Amazon ECR                                     |
| Backend                 | Node.js, Express.js                            |
| Frontend                | React.js, Vite                                 |
| Database                | Amazon RDS PostgreSQL                          |
| Messaging               | Amazon MQ RabbitMQ                             |
| Secret Management       | AWS Secrets Manager, External Secrets Operator |
| Monitoring              | Prometheus, Grafana, Alertmanager              |
| Kubernetes Packaging    | Helm                                           |
| Storage                 | Amazon EBS CSI Driver                          |
| Networking              | AWS ALB Controller, Ingress                    |
| Version Control         | Git, GitHub                                    |


# Project Structure

```bash
taskflow-microservices-project/
├── taskflow-microservices-app/
|    ├──frontend
|    ├──services/
│       ├── api-gateway/
│       ├── auth-service/
│       ├── user-service/
│       ├── task-service/
│       ├── project-service/
│       └── notification-service/
|    ├── docker-compose.yml
|
├── taskflow-infra-terraform/
|    ├──bootstrap/
|    ├──infra/
|    ├──platform/
|
├── taskflow-gitops-manifests/
|    ├──argocd/
|    ├──helm-charts/
|    ├──monitoring/
|
├── Jenkinsfile
└── README.md
```
## Repository Responsibilities

* **taskflow-microservices-app** → Application source code and Dockerfiles
* **taskflow-infra-terraform** → AWS infrastructure provisioning with Terraform
* **taskflow-gitops-manifests** → Kubernetes manifests, Helm charts, and Argo CD applications


# Local Development Setup

## 1. Clone Repository

```bash
git clone https://github.com/masud0932/taskflow-microservices-project.git
cd taskflow-microservices-project
```
## 2: Install Required Tools

Install the following tools before running the project:

-   Git
-   Docker
-   Node.js
-   npm
-   Terraform
-   AWS CLI

## 3. Start Local Development Environment

Run all services locally using Docker Compose:

```bash
cd taskflow-microservices-app
sudo docker compose up --build
```

## 4. Access Services

- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- RabbitMQ UI: http://localhost:15672

## 5. API Testing

### Signup

```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"----","email":"----","password":"----"}'
```

### Login

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"----","password":"----"}'
```

# Real Deployment

# Phase 1: AWS Infrastructure Provisioning with Terraform

This phase provisions the complete AWS infrastructure for the Taskflow Microservices Platform using Terraform. The environment follows a modular Infrastructure as Code (IaC) approach, with resources deployed in dependency order through separate Terraform stages.

## Infrastructure Structure

```text
terraform/
├── bootstrap/
├── infra/
└── platform/
```

The infrastructure is divided into three stages:

* **Bootstrap** – Creates the Terraform backend resources (S3 and DynamoDB) required for remote state management.
* **Infrastructure** – Provisions the core AWS services, including VPC, EKS, RDS PostgreSQL, Amazon MQ RabbitMQ, ECR, and AWS Secrets Manager.
* **Platform** – Installs and configures Kubernetes add-ons and operational components on the EKS cluster.

```text
Bootstrap
    ↓
Infrastructure
    ↓
Platform
```

This deployment model ensures that prerequisite resources are available before dependent components are provisioned, while keeping the infrastructure modular and easier to manage.

## Step 1: Bootstrap Infrastructure

The bootstrap layer provisions the resources required to manage Terraform itself.

### Implemented Resources

* S3 Remote State Backend
* DynamoDB State Lock Table
* Terraform Backend Configuration

### Run

```bash
cd taskflow-infra-terraform/bootstrap
terraform init
terraform apply
```

### State Management Flow

```text
Terraform
      ↓
S3 Backend
      ↓
Terraform State File
      ↓
DynamoDB State Lock
```

### Outcome

A production-ready Terraform backend is established using Amazon S3 for remote state storage and DynamoDB for state locking. This ensures secure state management, prevents concurrent infrastructure changes, supports team collaboration, and provides a reliable foundation for provisioning and maintaining AWS resources through Terraform.

## Step 2: Core Infrastructure

The infrastructure layer provisions the foundational AWS resources required to run the application platform.

### Networking

Implemented resources:

* VPC
* Public Subnets
* Private Subnets
* Internet Gateway
* NAT Gateway
* Route Tables
* Security Groups

### Amazon EKS

Implemented resources:

* Amazon EKS Cluster
* Managed Node Groups
* IAM Roles and Policies
* OIDC Provider
* IRSA Configuration

### Data & Messaging Services

Implemented resources:

* Amazon RDS PostgreSQL
* Amazon MQ RabbitMQ
* AWS Secrets Manager
* Amazon ECR Repositories

### Run Infrastructure Layer

```bash
cd taskflow-infra-terraform/infra
terraform init
terraform plan
terraform apply
```

### Infrastructure Deployment Flow

```text
Terraform Apply
      ↓
VPC & Networking
      ↓
Amazon EKS
      ↓
OIDC & IRSA
      ↓
RDS PostgreSQL
      ↓
Amazon MQ RabbitMQ
      ↓
AWS Secrets Manager
      ↓
Amazon ECR
```

### Outcome

A fully automated AWS platform is provisioned using Terraform, delivering a secure networking layer, managed Kubernetes environment, database services, messaging infrastructure, container registry, and centralized secret management. This infrastructure serves as the foundation for GitOps-based application deployment, monitoring, and operational automation on Amazon EKS.


## Step 3: Platform Add-ons

The add-ons layer installs and configures Kubernetes platform components on the EKS cluster using Terraform and Helm.

The platform layer prepares the cluster for secure application deployment, GitOps, ingress management, monitoring, and secret synchronization.

### Implemented Components

* AWS Load Balancer Controller
* EBS CSI Driver
* External Secrets Operator
* Argo CD
* kube-prometheus-stack

### Run Platform Layer

```bash
cd taskflow-infra-terraform/platform
terraform init
terraform plan
terraform apply
```

### Add-on Deployment Flow

```text
EKS Cluster
      ↓
OIDC & IRSA
      ↓
AWS Load Balancer Controller
      ↓
EBS CSI Driver
      ↓
External Secrets Operator
      ↓
Argo CD
      ↓
Prometheus
      ↓
Grafana & Alertmanager
```
### Outcome

A fully operational Kubernetes platform is established on Amazon EKS, integrating AWS-native networking, persistent storage, secret management, GitOps automation, and observability. This platform serves as the foundation for automated application delivery, secure workload deployment, and real-time monitoring of the Taskflow microservices environment.

## Platform Verification

After provisioning the platform layer, the Kubernetes add-ons were validated to ensure the operational components were successfully deployed and functional on the EKS cluster.

### Verification Checks

* Argo CD server and application controller running
* Prometheus and Grafana pods healthy
* AWS Load Balancer Controller operational
* External Secrets Operator synchronized successfully
* EBS CSI Driver available for persistent storage provisioning
* Kubernetes namespaces and services created correctly

### Validation Commands

```bash id="ym34bw"
kubectl get pods -n argocd
kubectl get pods -n monitoring
kubectl get pods -n external-secrets

kubectl get svc -n monitoring
kubectl get applications -n argocd
```

### Access Argo CD UI

```bash id="8b9l2v"
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Argo CD UI:

```text id="xpp6j0"
https://localhost:8080
```

Get Argo CD admin password:

```bash id="9j3w6r"
kubectl -n argocd get secret argocd-initial-admin-secret \
-o jsonpath="{.data.password}" | base64 -d
```

### Access Grafana UI

```bash id="d7tx6k"
kubectl port-forward svc/monitoring-grafana -n monitoring 3000:80
```

Grafana UI:

```text id="0ejd1n"
http://localhost:3000
```

Get Grafana admin password:

```bash id="z01h5k"
kubectl get secret monitoring-grafana -n monitoring \
-o jsonpath="{.data.admin-password}" | base64 -d
```

### Result

All platform components were successfully deployed and verified on Amazon EKS, providing GitOps deployment automation, AWS-native ingress management, secret synchronization, persistent storage integration, and full monitoring capabilities for the Kubernetes platform.


## Phase 2: CI/CD Pipeline

### Jenkins Server Setup

Jenkins was deployed on an EC2 instance and configured as the CI automation server for the Taskflow platform. The server is responsible for building Docker images, pushing images to Amazon ECR, and updating the GitOps repository for automated Kubernetes deployments.

#### Access Jenkins UI

```text
http://<jenkins-public-ip>:8080
```

The Jenkins public endpoint can be retrieved from Terraform outputs:

```bash
terraform output jenkins_url
```

#### Required Jenkins Plugins

* Git
* Pipeline
* GitHub Integration
* Docker Pipeline
* Credentials Binding
* SSH Agent

#### Jenkins Credentials Configuration

The following credentials were configured in Jenkins:

* AWS credentials for Amazon ECR authentication
* GitHub access token for repository access
* SSH private key for updating the GitOps repository

### Step 1: CI/CD Automation with Jenkins

A Jenkins pipeline was implemented to automate the build and delivery process of all microservices. GitHub webhooks trigger the pipeline whenever code is pushed to the repository.

#### Pipeline Workflow

```bash
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
Push Images to Amazon ECR
    ↓
Update GitOps Manifests
    ↓
Commit & Push Changes
    ↓
GitOps Repository
```

1. Jenkins checks out the latest source code from GitHub.
2. Docker images are built for all microservices using their respective Dockerfiles.
3. Images are tagged with the Jenkins build number.
4. Built images are pushed to Amazon ECR.
5. Kubernetes deployment manifests in the GitOps repository are automatically updated with the new image tags.
6. Updated manifests are committed and pushed back to the GitOps repository.

#### CI/CD Components

- Jenkins Server
- GitHub Webhook Integration
- Docker Build Automation
- Amazon ECR Integration
- Multi-Service Image Versioning
- Automated GitOps Manifest Updates
- SSH-based Git Repository Updates

### Outcome

A fully automated CI pipeline is established for the Taskflow microservices platform. Every code change triggers an end-to-end workflow that builds, versions, and publishes container images to Amazon ECR while automatically updating deployment manifests in the GitOps repository. This eliminates manual image management and provides a consistent, repeatable release process across all microservices.

### Step 2: GitOps Continuous Deployment with Argo CD

Argo CD was deployed on Amazon EKS and configured to continuously synchronize Kubernetes manifests and Helm releases from a dedicated GitOps repository.

All Kubernetes manifests and Helm configurations are stored in a dedicated GitOps repository, enabling automated deployment, synchronization, and self-healing.

#### Deployment Workflow

```bash
Jenkins Pipeline
      ↓
Update Image Tags
      ↓
GitOps Repository
      ↓
Argo CD
      ↓
Application Sync
      ↓
Amazon EKS Cluster
      ↓
Kubernetes Deployments
      ↓
Rolling Update
```

1. Jenkins updates image tags in the GitOps repository.
2. Changes are pushed to the GitOps repository.
3. Argo CD continuously monitors the repository.
4. When a new commit is detected, Argo CD compares the desired state with the current cluster state.
5. Argo CD automatically synchronizes the changes.
6. Kubernetes performs a rolling update of the affected deployments.
7. New application versions become available without downtime.

### GitOps Components

- Argo CD
- GitOps Repository
- Helm-based Kubernetes Manifests
- Automated Synchronization
- Kubernetes Rolling Updates
- Self-Healing Configuration Management
- Drift Detection

### Outcome

A fully automated GitOps workflow is implemented using Argo CD and Helm. Deployment manifests are continuously synchronized from the GitOps repository to Amazon EKS, enabling version-controlled releases, automated rolling updates, configuration drift correction, and reliable application delivery across the Kubernetes platform.

## Deployment Verification

After Argo CD synchronization, the deployment status was verified using Kubernetes and Argo CD to ensure all application components reached the desired state.

### Verification Checks

- Argo CD applications synchronized successfully
- All Kubernetes deployments reached Ready status
- Application pods became healthy
- Services and ingress routes were accessible
- Rolling updates completed successfully
- Cluster state matched the GitOps repository

### Validation Commands

```bash
kubectl get pods -n dev
kubectl get svc -n dev
kubectl get ingress -n dev
kubectl get applications -n argocd
```

# Phase 3: Monitoring & Observability

Implemented a production-style observability stack as the final observability layer on Amazon EKS using **kube-prometheus-stack (Prometheus, Grafana, Alertmanager, Node Exporter, and kube-state-metrics)**, fully managed through Argo CD GitOps workflows.

Prometheus was used to collect metrics from the cluster, including pods, nodes, namespaces, and services.

Grafana was used to visualise these metrics through dashboards, giving visibility into the health and performance of the Kubernetes environment.

## What Was Implemented

* Deployed Prometheus and Grafana using Helm on EKS.
* Instrumented all Node.js microservices using the **prom-client** library.
* Exposed custom `/metrics` endpoints for Prometheus scraping.
* Configured ServiceMonitors for automatic service discovery.
* Exposed Grafana through an AWS Application Load Balancer (ALB).
* Created dashboards for both Kubernetes infrastructure and application-level metrics.

## Metrics Collected

**Infrastructure & Kubernetes**

* Node CPU and memory utilization
* Pod resource consumption
* Container restarts
* Deployment availability
* Cluster health and capacity

**Application Metrics**

* HTTP request count
* Request latency and response times
* HTTP status code distribution
* Service uptime
* Process CPU and memory usage

## Outcome

The monitoring solution provides end-to-end visibility across the EKS cluster and Node.js microservices, enabling proactive monitoring, faster troubleshooting, performance analysis, and real-time operational insights.


# Secret Management

Sensitive application credentials are centrally managed using AWS Secrets Manager and automatically synchronized into Kubernetes through the External Secrets Operator (ESO). This approach eliminates hardcoded credentials from source code, container images, and Kubernetes manifests while providing a secure and scalable secret management solution.

## Secret Management Flow

```text
AWS Secrets Manager
        ↓
External Secrets Operator
        ↓
Kubernetes Secrets
        ↓
Application Pods
```

## Database Credential Flow

```text
Amazon RDS PostgreSQL
        ↓
AWS Secrets Manager
        ↓
External Secrets Operator
        ↓
taskflow-db-secret
        ↓
Backend Services
```

### Implementation Details

* Amazon RDS master credentials are stored in AWS Secrets Manager.
* External Secrets Operator continuously synchronizes secrets into the Kubernetes cluster.
* Kubernetes Secrets are automatically created and updated.
* Backend services consume database credentials through environment variables.
* No credentials are stored in Git repositories or container images.

## RabbitMQ Credential Flow

```text
Amazon MQ RabbitMQ
        ↓
AWS Secrets Manager
        ↓
External Secrets Operator
        ↓
taskflow-rabbitmq-secret
        ↓
Task Service / Notification Service
```

### Implementation Details

* RabbitMQ broker credentials are securely stored in AWS Secrets Manager.
* External Secrets Operator synchronizes credentials into Kubernetes Secrets.
* Microservices access RabbitMQ credentials through Kubernetes Secret references.
* Secret updates can be propagated without modifying application code.

## Components Used

* AWS Secrets Manager
* External Secrets Operator (ESO)
* IAM Roles for Service Accounts (IRSA)
* Kubernetes Secrets
* Amazon RDS PostgreSQL
* Amazon MQ RabbitMQ

## Benefits

* Centralized secret management
* No hardcoded credentials
* GitOps-compatible secret synchronization
* Secure integration with AWS services
* Automated secret distribution to Kubernetes workloads


# Key Implementation Challenges and Solutions

During the implementation of the TaskFlow Microservices project, several real-world infrastructure, Kubernetes, GitOps, CI/CD, and application deployment issues were encountered and resolved.

## 1. Terraform Remote State Checksum Mismatch

**Problem**

Terraform failed with a remote state checksum mismatch between S3 and DynamoDB.

```bash
state data in S3 does not have the expected content
```

**Cause**

The Terraform state stored in S3 and the checksum digest stored in DynamoDB became inconsistent after a previous operation.

**Solution**

Only the related DynamoDB digest item was removed after verifying the S3 state file. Terraform was then able to refresh and continue using the remote backend correctly.

---

## 2. EKS Kubernetes Provider Unauthorized

**Problem**

Terraform and Kubernetes commands failed with:

```bash
Unauthorized
Kubernetes cluster unreachable
The server has asked for client credentials
```

**Cause**

The AWS IAM user had permission to access AWS resources, but it was not automatically mapped as a Kubernetes cluster administrator.

**Solution**

The kubeconfig was updated and proper EKS cluster admin access was added.

```bash
aws eks update-kubeconfig \
  --region eu-central-1 \
  --name taskflow-dev-eks
```

---

## 3. Argo CD Application Not Visible

**Problem**

Argo CD was installed successfully, but no applications were displayed.

**Cause**

The Argo CD `Application` manifest had not been applied.

**Solution**

Applied the Argo CD application manifest manually.

```bash
kubectl apply -f taskflow-dev-application.yaml
```

---

## 4. Helm Chart Not Detected Correctly

**Problem**

Argo CD treated the application as a plain directory instead of a Helm chart.

**Cause**

The Argo CD Application manifest was missing the correct Helm configuration.

**Solution**

Added the Helm value file configuration.

```yaml
helm:
  valueFiles:
    - values.yaml
```
---

## 5. Invalid Kubernetes Resource Names

**Problem**

Kubernetes rejected service names such as:

```bash
apiGateway is invalid
authService is invalid
```

**Cause**

Kubernetes resource names must follow DNS naming rules and should use lowercase letters with hyphens.

**Solution**

Renamed services using lowercase dash format:

```text
api-gateway
auth-service
user-service
task-service
project-service
notification-service
```
---

## 6. Invalid Service Port `0`

**Problem**

Kubernetes failed to create services because some ports were rendered as `0`.

```bash
Service port: Invalid value: 0
```

**Cause**

Required service port values were missing in `values.yaml`.

**Solution**

Added all required service ports.

```yaml
api-gateway: 4000
auth-service: 3001
user-service: 3002
task-service: 3003
project-service: 3004
notification-service: 3005
frontend: 80
```
---

## 7. External Secrets API Version Mismatch

**Problem**

ExternalSecret resources failed because the API version was not found.

```bash
external-secrets.io/v1beta1 not found
```

**Cause**

The installed External Secrets Operator CRDs supported `external-secrets.io/v1`, not `v1beta1`.

**Solution**

Updated ExternalSecret manifests:

```yaml
apiVersion: external-secrets.io/v1
```
---

## 8. External Secrets IAM Permission Denied

**Problem**

External Secrets Operator failed to read the RDS-managed secret.

```bash
AccessDeniedException: not authorized to perform secretsmanager:GetSecretValue
```

**Cause**

The IAM policy allowed only `taskflow/*` secrets, but the AWS-managed RDS secret used the `rds!db-*` naming pattern.

**Solution**

Added permission for RDS-managed secrets:

```json
"arn:aws:secretsmanager:${region}:${account}:secret:rds!*"
```
---

## 9. Missing Kubernetes Secrets

**Problem**

Pods failed with missing secret errors.

```bash
secret "taskflow-db-secret" not found
```

**Cause**

External Secrets Operator failed to sync secrets from AWS Secrets Manager due to IAM and secret mapping issues.

**Solution**

Fixed the ESO IAM policy and corrected the ExternalSecret definitions. After that, Kubernetes Secrets were created successfully and pods were able to start.

---

## 10. EKS Pod Scheduling Limit

**Problem**

Some pods stayed in `Pending` state.

```bash
Too many pods
```

**Cause**

The EKS node group had only two worker nodes, which did not provide enough pod capacity for application, monitoring, Argo CD, and ESO workloads.

**Solution**

Increased the node group desired size from 2 to 3.

```bash
aws eks update-nodegroup-config \
  --cluster-name taskflow-dev-eks \
  --nodegroup-name <nodegroup-name> \
  --scaling-config desiredSize=3
```

# Future Improvements

* Implement Horizontal Pod Autoscaler (HPA) for automatic workload scaling based on CPU and memory utilization.
* Add HTTPS support using cert-manager and TLS certificates.
* Integrate centralized logging using the ELK or Loki stack.
* Implement Kubernetes Network Policies for enhanced pod-to-pod security.
* Add automated backup and disaster recovery strategies for PostgreSQL and RabbitMQ.
* Configure advanced Prometheus alerting and notification integrations.
* Implement multi-environment GitOps deployment workflows (dev/staging/production).
* Add vulnerability scanning and security checks in the CI/CD pipeline.
* Introduce service mesh integration for advanced traffic management and observability.
* Optimize infrastructure costs through cluster autoscaling and resource tuning.

# Conclusion

This project demonstrates the end-to-end implementation of a production-style cloud-native microservices platform on AWS using modern DevOps and Platform Engineering practices.

The solution combines Infrastructure as Code with Terraform, containerization with Docker, orchestration through Amazon EKS, GitOps-based deployments using Argo CD, CI/CD automation with Jenkins, secure secret management via AWS Secrets Manager and External Secrets Operator, and full observability through Prometheus and Grafana.

The final platform successfully delivers a secure, automated, scalable, and observable microservices environment that reflects industry best practices and demonstrates practical expertise in AWS Cloud, Kubernetes, DevOps, and Platform Engineering.
