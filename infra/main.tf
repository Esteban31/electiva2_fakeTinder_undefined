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

# Referencia al security group existente
data "aws_security_group" "faketinder_sg" {
  id = "sg-0a5aa30c07592243a"
}

###############
# EC2 INSTANCE #
###############

resource "aws_instance" "faketinder_ec2" {
  ami                         = var.ami_id
  instance_type               = var.instance_type != "" ? var.instance_type : "t3.micro"
  key_name                    = var.key_name
  vpc_security_group_ids      = [data.aws_security_group.faketinder_sg.id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              set -e
              
              # Log de inicio
              exec > >(tee /var/log/user-data.log)
              exec 2>&1
              
              echo "=========================================="
              echo "Iniciando configuración de la instancia..."
              echo "=========================================="
              
              # Actualizar sistema
              echo "📦 Actualizando paquetes del sistema..."
              apt update -y
              apt install -y docker.io docker-compose git curl
              
              # Configurar Docker
              echo "🐳 Configurando Docker..."
              systemctl enable docker
              systemctl start docker
              
              # Agregar usuario ubuntu al grupo docker
              usermod -aG docker ubuntu
              
              # Esperar a que Docker esté completamente listo
              echo "⏳ Esperando a que Docker esté listo..."
              timeout 60 bash -c 'until docker info > /dev/null 2>&1; do sleep 2; done' || {
                  echo "❌ Error: Docker no se inició correctamente"
                  exit 1
              }
              
              # Clonar o actualizar repositorio
              echo "📥 Clonando repositorio..."
              cd /home/ubuntu
              
              if [ -d "faketinder" ]; then
                  echo "Repositorio ya existe, actualizando..."
                  cd faketinder
                  git pull origin main || git pull origin master
              else
                  echo "Clonando repositorio..."
                  git clone ${var.git_repo_url} faketinder
                  cd faketinder
              fi
              
              # Asegurar permisos correctos
              chown -R ubuntu:ubuntu /home/ubuntu/faketinder
              
              # Crear archivo .env
              echo "📝 Creando archivo de configuración .env..."
              cat > .env << 'ENVEOF'
PORT=4003
JWT_KEY=${var.jwt_key}
JWT_EXPIRES_IN=3600
MONGODB_URI=${var.mongodb_uri}
ENVEOF
              
              # Asegurar permisos del archivo .env
              chown ubuntu:ubuntu .env
              chmod 600 .env
              
              # Detener contenedores anteriores si existen
              echo "🧹 Limpiando contenedores anteriores..."
              docker compose down --remove-orphans 2>/dev/null || true
              
              # Construir y levantar contenedores
              echo "🚀 Construyendo y levantando contenedores..."
              docker compose up -d --build
              
              # Esperar a que los contenedores estén listos
              echo "⏳ Esperando a que los servicios estén listos..."
              sleep 15
              
              # Verificar estado de los contenedores
              echo "📊 Estado de los contenedores:"
              docker compose ps
              
              # Intentar hacer health check
              echo "🏥 Verificando salud de la aplicación..."
              for i in {1..10}; do
                  if curl -f http://localhost:4003/health 2>/dev/null || curl -f http://localhost:4003 2>/dev/null; then
                      echo "✅ Aplicación respondiendo correctamente"
                      break
                  fi
                  echo "Intento $i/10: Esperando respuesta de la aplicación..."
                  sleep 5
              done
              
              # Log final
              echo "=========================================="
              echo "✅ Configuración completada exitosamente"
              echo "=========================================="
              echo "Fecha: $(date)"
              echo "IP Pública: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
              echo "=========================================="
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

output "application_url" {
  description = "URL de la aplicación"
  value       = "http://${aws_instance.faketinder_ec2.public_ip}:4003"
}

output "instance_id" {
  description = "ID de la instancia EC2"
  value       = aws_instance.faketinder_ec2.id
}
