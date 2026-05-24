resource "random_password" "rabbitmq" {
  length  = 24
  special = true
  override_special = "!@#$%^&*()-_+"
}

resource "aws_secretsmanager_secret" "rabbitmq" {
  name = var.rabbitmq_secret_name
  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "rabbitmq" { 
  secret_id = aws_secretsmanager_secret.rabbitmq.id

  secret_string = jsonencode({
    username = "rabbitmq"
    password = random_password.rabbitmq.result 
  })
}

locals {
  rabbitmq_secret_json = jsondecode(aws_secretsmanager_secret_version.rabbitmq.secret_string) 
  # Decode the JSON string to access username and password as separate variables
}

module "vpc" {
  source = "./modules/vpc"

  name_prefix     = local.name_prefix
  vpc_cidr        = var.vpc_cidr
  azs             = var.azs
  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets
  tags            = local.common_tags
}

module "eks" {
  source = "./modules/eks"

  name_prefix         = local.name_prefix
  cluster_name        = "${local.name_prefix}-eks"
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  public_subnet_ids   = module.vpc.public_subnet_ids
  node_instance_types = var.node_instance_types # ec2 instance types for worker nodes
  desired_size        = var.desired_size
  min_size            = var.min_size
  max_size            = var.max_size
  tags                = local.common_tags
}

module "ecr" {
  source = "./modules/ecr"

  name_prefix  = local.name_prefix
  repositories = var.ecr_repositories
  tags         = local.common_tags
}

module "rds" {
  source = "./modules/rds"

  name_prefix        = local.name_prefix
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  db_name            = var.db_name
  db_username        = "taskflowadmin"
  eks_node_sg_id     = module.eks.node_security_group_id
  tags               = local.common_tags
}

module "mq" {
  source = "./modules/mq"

  name_prefix        = local.name_prefix
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  eks_node_sg_id     = module.eks.node_security_group_id

  username = local.rabbitmq_secret_json.username
  password = local.rabbitmq_secret_json.password

  tags = local.common_tags
}

module "jenkins" {
  source = "./modules/jenkins"

  name_prefix       = local.name_prefix
  vpc_id            = module.vpc.vpc_id
  public_subnet_id  = module.vpc.public_subnet_ids[0]

  instance_type     = "t3.medium"
  key_name          = var.jenkins_key_name

  tags = local.common_tags
}