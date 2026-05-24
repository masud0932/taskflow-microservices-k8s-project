terraform {
  backend "s3" {
    bucket         = "taskflow-terraform-state-masud"
    key            = "platform/dev/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "taskflow-terraform-locks"
    encrypt        = true
    kms_key_id     = "alias/taskflow-terraform-state"
  }
}