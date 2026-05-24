output "public_ip" {
  value = aws_instance.jenkins.public_ip
}

output "url" {
  value = "http://${aws_instance.jenkins.public_ip}:8080"
}