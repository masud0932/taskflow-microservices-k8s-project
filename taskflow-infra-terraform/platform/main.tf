data "terraform_remote_state" "infra" {
  backend = "s3"

  config = {
    bucket = "taskflow-terraform-state-masud"
    key    = "infra/dev/terraform.tfstate"
    region = "eu-central-1"
  }
}

locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

module "addons" {
  source = "./modules/addons"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  cluster_name      = data.terraform_remote_state.infra.outputs.eks_cluster_name
  vpc_id            = data.terraform_remote_state.infra.outputs.vpc_id
  oidc_provider_arn = data.terraform_remote_state.infra.outputs.oidc_provider_arn
  oidc_provider_url = data.terraform_remote_state.infra.outputs.oidc_provider_url

  tags = local.common_tags
}