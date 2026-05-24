output "external_secrets_namespace" {
  value = module.addons.external_secrets_namespace
}

output "argocd_namespace" {
  value = module.addons.argocd_namespace
}

output "monitoring_namespace" {
  value = module.addons.monitoring_namespace
}

output "alb_controller_role_arn" {
  value = module.addons.alb_controller_role_arn
}

output "external_secrets_role_arn" {
  value = module.addons.external_secrets_role_arn
}