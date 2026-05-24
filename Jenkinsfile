pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        AWS_REGION = 'eu-central-1'
        AWS_ACCOUNT_ID = '349036691410'

        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_TAG = "${BUILD_NUMBER}"

        GITOPS_REPO = 'https://github.com/masud0932/taskflow-microservices-k8s-project.git'
        GITOPS_BRANCH = 'main'
        GIT_CREDENTIALS_ID = 'github-token' 
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('AWS ECR Login') {
            steps {
                sh """
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin ${ECR_REGISTRY}
                """
            }
        }

        stage('Build Images') {
            steps {
                sh """
                docker build -t ${ECR_REGISTRY}/taskflow-frontend:${IMAGE_TAG} ./taskflow-microservices-app/frontend
                docker build -t ${ECR_REGISTRY}/taskflow-api-gateway:${IMAGE_TAG} ./taskflow-microservices-app/api-gateway
                docker build -t ${ECR_REGISTRY}/taskflow-auth-service:${IMAGE_TAG} ./taskflow-microservices-app/auth-service
                docker build -t ${ECR_REGISTRY}/taskflow-user-service:${IMAGE_TAG} ./taskflow-microservices-app/user-service
                docker build -t ${ECR_REGISTRY}/taskflow-task-service:${IMAGE_TAG} ./taskflow-microservices-app/task-service
                docker build -t ${ECR_REGISTRY}/taskflow-project-service:${IMAGE_TAG} ./taskflow-microservices-app/project-service
                docker build -t ${ECR_REGISTRY}/taskflow-notification-service:${IMAGE_TAG} ./taskflow-microservices-app/notification-service
                """
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh """
                    docker push ${ECR_REGISTRY}/taskflow-frontend:${IMAGE_TAG}
                    docker push ${ECR_REGISTRY}/taskflow-api-gateway:${IMAGE_TAG}
                    docker push ${ECR_REGISTRY}/taskflow-auth-service:${IMAGE_TAG}
                    docker push ${ECR_REGISTRY}/taskflow-user-service:${IMAGE_TAG}
                    docker push ${ECR_REGISTRY}/taskflow-task-service:${IMAGE_TAG}
                    docker push ${ECR_REGISTRY}/taskflow-project-service:${IMAGE_TAG}
                    docker push ${ECR_REGISTRY}/taskflow-notification-service:${IMAGE_TAG}
                """
            }
        }

stage('Update GitOps Manifests') {
    steps {
        withCredentials([usernamePassword(
            credentialsId: "${GIT_CREDENTIALS_ID}",
            usernameVariable: 'GIT_USERNAME',
            passwordVariable: 'GIT_TOKEN'
        )]) {
            sh """
                rm -rf taskflow-microservices-k8s-project

                git clone -b ${GITOPS_BRANCH} https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/masud0932/taskflow-microservices-k8s-project.git

                cd taskflow-microservices-k8s-project/taskflow-gitops-manifests

                sed -i 's/tag:.*/tag: "${IMAGE_TAG}"/' helm-charts/taskflow/values.yaml
                sed -i 's|registry:.*|registry: "${ECR_REGISTRY}"|' helm-charts/taskflow/values.yaml

                git config user.email "jenkins@taskflow.local"
                git config user.name "Jenkins CI"

                git add helm-charts/taskflow/values.yaml
                git commit -m "Update image tag to ${IMAGE_TAG}" || echo "No changes to commit"
                git push origin ${GITOPS_BRANCH}
            """
        }
    }
}
}

    post {
        success {
            echo "Pipeline completed successfully. Image tag: ${IMAGE_TAG}"
        }

        failure {
            echo "Pipeline failed. Check Jenkins logs."
        }

        always {
            cleanWs()
        }
    }
}
