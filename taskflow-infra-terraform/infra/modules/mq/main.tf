resource "aws_security_group" "mq" {
  name        = "${var.name_prefix}-mq-sg"
  description = "Allow RabbitMQ from EKS nodes"
  vpc_id      = var.vpc_id

  ingress {
    description     = "AMQP from EKS"
    from_port       = 5671
    to_port         = 5672
    protocol        = "tcp"
    security_groups = [var.eks_node_sg_id]
  }

  ingress {
    description     = "RabbitMQ UI from EKS"
    from_port       = 15672
    to_port         = 15672
    protocol        = "tcp"
    security_groups = [var.eks_node_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_mq_broker" "rabbitmq" {
  broker_name        = "${var.name_prefix}-rabbitmq"
  engine_type        = "RabbitMQ"
  engine_version     = "3.13"
  host_instance_type = "mq.m5.large"
  deployment_mode    = "SINGLE_INSTANCE"

  subnet_ids         = [var.private_subnet_ids[0]]
  security_groups    = [aws_security_group.mq.id]

  auto_minor_version_upgrade = true

  user {
    username = var.username
    password = var.password
  }

  publicly_accessible = false

  tags = var.tags
}