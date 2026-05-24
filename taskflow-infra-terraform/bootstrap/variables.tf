variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "state_bucket_name" {
  type    = string
  default = "taskflow-terraform-state-masud"
}

variable "lock_table_name" {
  type    = string
  default = "taskflow-terraform-locks"
}

variable "kms_alias_name" {
  type    = string
  default = "alias/taskflow-terraform-state"
}