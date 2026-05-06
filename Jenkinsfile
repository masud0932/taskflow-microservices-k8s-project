pipeline {
    agent any

    environment {
        AWS_REGION = 'eu-central-1'
        AWS_ACCOUNT_ID = 'YOUR_AWS_ACCOUNT_ID'
        IMAGE_TAG = "${BUILD_NUMBER}"

        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        GITOPS_REPO = 'https://github.com/masudrana09/taskflow-gitops-manifests.git'
        GITOPS_BRANCH = 'main'
        GITOPS_CREDENTIALS = 'github-credentials'
    }

    stages {
        stage('Checkout App Code') {
            steps {
                checkout scm
            }
        }

    stage('Ensure ECR Repositories Exist') {
        steps {
            sh '''
                for repo in \
                taskflow-frontend \
                taskflow-api-gateway \
                taskflow-auth-service \
                taskflow-user-service \
                taskflow-task-service \
                taskflow-project-service \
                taskflow-notification-service
                do
                aws ecr describe-repositories \
                    --repository-names $repo \
                    --region $AWS_REGION >/dev/null 2>&1 || \
                aws ecr create-repository \
                    --repository-name $repo \
                    --region $AWS_REGION
                done
            '''
        }
    }

        stage('AWS ECR Login') {
            steps {
                sh '''
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin $ECR_REGISTRY
                '''
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    docker build -t $ECR_REGISTRY/taskflow-frontend:$IMAGE_TAG ./frontend
                    docker build -t $ECR_REGISTRY/taskflow-api-gateway:$IMAGE_TAG ./services/api-gateway
                    docker build -t $ECR_REGISTRY/taskflow-auth-service:$IMAGE_TAG ./services/auth-service
                    docker build -t $ECR_REGISTRY/taskflow-user-service:$IMAGE_TAG ./services/user-service
                    docker build -t $ECR_REGISTRY/taskflow-task-service:$IMAGE_TAG ./services/task-service
                    docker build -t $ECR_REGISTRY/taskflow-project-service:$IMAGE_TAG ./services/project-service
                    docker build -t $ECR_REGISTRY/taskflow-notification-service:$IMAGE_TAG ./services/notification-service
                '''
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh '''
                    docker push $ECR_REGISTRY/taskflow-frontend:$IMAGE_TAG
                    docker push $ECR_REGISTRY/taskflow-api-gateway:$IMAGE_TAG
                    docker push $ECR_REGISTRY/taskflow-auth-service:$IMAGE_TAG
                    docker push $ECR_REGISTRY/taskflow-user-service:$IMAGE_TAG
                    docker push $ECR_REGISTRY/taskflow-task-service:$IMAGE_TAG
                    docker push $ECR_REGISTRY/taskflow-project-service:$IMAGE_TAG
                    docker push $ECR_REGISTRY/taskflow-notification-service:$IMAGE_TAG
                '''
            }
        }

        stage('Update GitOps Repo') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${GITOPS_CREDENTIALS}",
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh '''
                        rm -rf taskflow-gitops-manifests

                        git clone https://$GIT_USER:$GIT_TOKEN@github.com/masudrana09/taskflow-gitops-manifests.git

                        cd taskflow-gitops-manifests

                        sed -i "s|registry:.*|registry: $ECR_REGISTRY|g" helm/taskflow/values.yaml
                        sed -i "s|tag:.*|tag: $IMAGE_TAG|g" helm/taskflow/values.yaml

                        git config user.email "jenkins@taskflow.local"
                        git config user.name "Jenkins CI"

                        git add helm/taskflow/values.yaml
                        git commit -m "Update image tag to $IMAGE_TAG" || echo "No changes to commit"
                        git push origin $GITOPS_BRANCH
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Images pushed to ECR and GitOps repo updated. Argo CD will sync automatically.'
        }

        failure {
            echo 'Pipeline failed.'
        }

        always {
            sh 'docker logout $ECR_REGISTRY || true'
        }
    }
}