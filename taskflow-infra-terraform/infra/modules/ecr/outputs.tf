output "repository_urls" {
  value = {
    for repo, details in aws_ecr_repository.repos : repo => details.repository_url
  }
}