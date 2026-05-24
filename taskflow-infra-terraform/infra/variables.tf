variable "project_name" {
  type    = string
  default = "taskflow"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "azs" {
  type    = list(string)
  default = ["eu-central-1a", "eu-central-1b"]
}

variable "public_subnets" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  type    = list(string)
  default = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "db_name" {
  type    = string
  default = "taskflow"
}

variable "rabbitmq_secret_name" {
  type    = string
  default = "taskflow/dev/rabbitmq/v1"
}

variable "ecr_repositories" {
  type = list(string)
  default = [
    "frontend",
    "api-gateway",
    "auth-service",
    "user-service",
    "task-service",
    "project-service",
    "notification-service"
  ]
}

variable "node_instance_types" {
  type    = list(string)
  default = ["t3.medium"]
}

variable "desired_size" {
  type    = number
  default = 2
}

variable "min_size" {
  type    = number
  default = 2
}

variable "max_size" {
  type    = number
  default = 3
}
