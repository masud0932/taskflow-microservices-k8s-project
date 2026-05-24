terraform {
  backend "s3" {
    bucket       = "taskflow-terraform-state-masud"
    key          = "infra/dev/terraform.tfstate"
    region       = "eu-central-1"
    use_lockfile = true
    encrypt      = true
    kms_key_id   = "alias/taskflow-terraform-state"
  }
}