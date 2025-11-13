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

  # Puerto para Nginx (API Gateway)
  ingress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Puertos para servicios individuales (opcional, para debugging)
  ingress {
    from_port   = 4001
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
  instance_type               = var.instance_type != "" ? var.instance_type : "t3.micro"
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.faketinder_sg.id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              set -e
              
              # Logs para debugging
              exec > >(tee /var/log/user-data.log)
              exec 2>&1
              
              echo "=== Iniciando configuración de la instancia ==="
              
              # Actualizar sistema
              apt-get update -y
              DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
              
              # Instalar dependencias
              echo "=== Instalando Docker y dependencias ==="
              apt-get install -y \
                  ca-certificates \
                  curl \
                  gnupg \
                  lsb-release \
                  git
              
              # Instalar Docker
              curl -fsSL https://get.docker.com -o get-docker.sh
              sh get-docker.sh
              
              # Instalar Docker Compose
              curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              
              # Configurar permisos de Docker
              usermod -aG docker ubuntu
              
              # Habilitar y iniciar Docker
              systemctl enable docker
              systemctl start docker
              
              # Esperar a que Docker esté completamente iniciado
              echo "=== Esperando a que Docker esté listo ==="
              timeout 60 sh -c 'until docker info >/dev/null 2>&1; do sleep 1; done'
              
              # Clonar repositorio
              echo "=== Clonando repositorio ==="
              cd /home/ubuntu
              rm -rf faketinder
              git clone ${var.git_repo_url} faketinder
              cd faketinder
              
              # Crear archivo .env
              echo "=== Creando archivo .env ==="
              cat > .env <<ENVFILE
              PORT=4003
              JWT_KEY=${var.jwt_key}
              JWT_EXPIRES_IN=3600
              MONGODB_URI=${var.mongodb_uri}
              ENVFILE
              
              # Cambiar permisos
              chown -R ubuntu:ubuntu /home/ubuntu/faketinder
              chmod 644 /home/ubuntu/faketinder/.env
              
              # Construir e iniciar contenedores
              echo "=== Iniciando Docker Compose ==="
              docker-compose down --remove-orphans || true
              docker-compose pull
              docker-compose up -d --build --force-recreate
              
              # Verificar estado de contenedores
              echo "=== Estado de contenedores ==="
              docker-compose ps
              docker-compose logs --tail=50
              
              echo "=== Configuración completada ==="
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
