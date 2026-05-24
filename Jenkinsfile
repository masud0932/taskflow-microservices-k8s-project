pipeline {
    agent any

    environment {
        AWS_REGION = 'eu-central-1'
        AWS_ACCOUNT_ID = '349036691410'
        IMAGE_TAG = "${BUILD_NUMBER}"
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        APP_DIR = 'taskflow-microservices-app'
        INFRA_DIR = 'taskflow-infra-terraform/infra'
        GITOPS_DIR = 'taskflow-gitops-manifests'
	ECR_PREFIX = 'taskflow-dev'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Terraform Init') {
            when {
                anyOf {
                    expression { currentBuild.number == 1 }
                    changeset "taskflow-infra-terraform/**"
                }
            }
            steps {
                dir("${INFRA_DIR}") {
                    sh 'terraform init'
                }
            }
        }

        stage('Terraform Validate') {
            when {
                anyOf {
                    expression { currentBuild.number == 1 }
                    changeset "taskflow-infra-terraform/**"
                }
            }
            steps {
                dir("${INFRA_DIR}") {
                    sh '''
                        terraform fmt -check
                        terraform validate
                    '''
                }
            }
        }

        stage('Terraform Plan') {
            when {
                anyOf {
                    expression { currentBuild.number == 1 }
                    changeset "taskflow-infra-terraform/**"
                }
            }
            steps {
                dir("${INFRA_DIR}") {
                    sh 'terraform plan -out=tfplan'
                }
            }
        }

        stage('Manual Approval for Terraform Apply') {
            when {
                allOf {
                    branch 'main'
                    changeset "taskflow-infra-terraform/**"
                }
            }
            steps {
                input message: 'Approve Terraform apply?', ok: 'Apply'
            }
        }

        stage('Terraform Apply') {
            when {
                allOf {
                    branch 'main'
                    changeset "taskflow-infra-terraform/**"
                }
            }
            steps {
                dir("${INFRA_DIR}") {
                    sh 'terraform apply tfplan'
                }
            }
        }

        stage('AWS ECR Login') {
            when {
                changeset "taskflow-microservices-app/**"
            }
            steps {
                sh '''
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin $ECR_REGISTRY
                '''
            }
        }

        stage('Build Images') {
            when {
                changeset "taskflow-microservices-app/**"
            }
            steps {
                sh '''
                    docker build -t $ECR_REGISTRY/$ECR_PREFIX/frontend:$IMAGE_TAG $APP_DIR/frontend

		            docker build -t $ECR_REGISTRY/$ECR_PREFIX/api-gateway:$IMAGE_TAG $APP_DIR/services/api-gateway

                    docker build -t $ECR_REGISTRY/$ECR_PREFIX/auth-service:$IMAGE_TAG $APP_DIR/services/auth-service

                    docker build -t $ECR_REGISTRY/$ECR_PREFIX/user-service:$IMAGE_TAG $APP_DIR/services/user-service

                    docker build -t $ECR_REGISTRY/$ECR_PREFIX/task-service:$IMAGE_TAG $APP_DIR/services/task-service

                    docker build -t $ECR_REGISTRY/$ECR_PREFIX/project-service:$IMAGE_TAG $APP_DIR/services/project-service

                    docker build -t $ECR_REGISTRY/$ECR_PREFIX/notification-service:$IMAGE_TAG $APP_DIR/services/notification-service
                '''
            }
        }

        stage('Push Images to ECR') {
            when {
                changeset "taskflow-microservices-app/**"
            }
            steps {
                sh '''
                    docker push $ECR_REGISTRY/$ECR_PREFIX/frontend:$IMAGE_TAG
                    docker push $ECR_REGISTRY/$ECR_PREFIX/api-gateway:$IMAGE_TAG
                    docker push $ECR_REGISTRY/$ECR_PREFIX/auth-service:$IMAGE_TAG
                    docker push $ECR_REGISTRY/$ECR_PREFIX/user-service:$IMAGE_TAG
                    docker push $ECR_REGISTRY/$ECR_PREFIX/task-service:$IMAGE_TAG
                    docker push $ECR_REGISTRY/$ECR_PREFIX/project-service:$IMAGE_TAG
                    docker push $ECR_REGISTRY/$ECR_PREFIX/notification-service:$IMAGE_TAG
                '''
            }
        }

        stage('Update GitOps Manifests') {
            when {
                changeset "taskflow-microservices-app/**"
            }
            steps {
                dir("${GITOPS_DIR}") {
                    sh '''
                        sed -i "s|registry:.*|registry: $ECR_REGISTRY|g" helm-charts/taskflow/values.yaml
                        sed -i "s|tag:.*|tag: $IMAGE_TAG|g" helm-charts/taskflow/values.yaml

                        git config user.email "jenkins@taskflow.local"
                        git config user.name "Jenkins CI"

                        git add helm-charts/taskflow/values.yaml
                        git commit -m "Update image tag to $IMAGE_TAG" || echo "No changes to commit"
                        git push origin main
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout $ECR_REGISTRY || true'
        }
    }
}