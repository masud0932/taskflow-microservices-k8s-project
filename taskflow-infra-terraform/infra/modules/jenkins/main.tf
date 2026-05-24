data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["137112412989"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }
}

resource "tls_private_key" "jenkins" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "jenkins" {
  key_name   = "${var.name_prefix}-jenkins-key"
  public_key = tls_private_key.jenkins.public_key_openssh
}

resource "local_file" "private_key" {
  filename        = "${path.module}/jenkins-key.pem"
  content          = tls_private_key.jenkins.private_key_pem
  file_permission  = "0400"
}

resource "aws_security_group" "jenkins" {
  name   = "${var.name_prefix}-jenkins-sg"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["84.58.225.233/32"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["84.58.225.233/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_instance" "jenkins" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  subnet_id              = var.public_subnet_id
  key_name               = aws_key_pair.jenkins.key_name
  vpc_security_group_ids = [aws_security_group.jenkins.id]
  associate_public_ip_address = true

  user_data = file("${path.module}/user_data.sh")

  root_block_device {
    volume_size = 16
    volume_type = "gp3"
  }

  tags = merge(var.tags,{
    Name="${var.name_prefix}-jenkins"
  })
}