##########################
# PROVIDER CONFIGURATION #
##########################

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.6.0"
}

provider "aws" {
  region = "us-east-1"
}

##################
# SECURITY GROUP #
##################

resource "aws_security_group" "faketinder_sg" {
  name        = "faketinder-sg"
  description = "Allow HTTP, HTTPS, SSH and app ports"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 4003
    to_port     = 4003
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

###############
# EC2 INSTANCE #
###############

resource "aws_instance" "faketinder_ec2" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.faketinder_sg.id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              apt update -y
              apt install -y docker.io docker-compose git
              systemctl enable docker
              systemctl start docker

              cd /home/ubuntu
              git clone ${var.git_repo_url} faketinder
              cd faketinder

              echo "PORT=4003" >> .env
              echo "JWT_KEY=${var.jwt_key}" >> .env
              echo "JWT_EXPIRES_IN=3600" >> .env
              echo "MONGODB_URI=${var.mongodb_uri}" >> .env

              docker compose up -d --build
              EOF

  tags = {
    Name = "faketinder-instance"
  }
}

################
# OUTPUT VALUES #
################

output "ec2_public_ip" {
  description = "IP pública de la instancia EC2"
  value       = aws_instance.faketinder_ec2.public_ip
}

###################
# VARIABLE DEFINES #
###################

variable "ami_id" {}
variable "instance_type" {}
variable "key_name" {}
variable "git_repo_url" {}
variable "jwt_key" {}
variable "mongodb_uri" {}
