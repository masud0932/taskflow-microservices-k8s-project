variable "name_prefix" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "eks_node_sg_id" { type = string }
variable "username" { type = string }
variable "password" {
  type      = string
  sensitive = true
}
variable "tags" { type = map(string) }