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
  region = var.aws_region
}

#############################
# BUSCAR INSTANCIA EXISTENTE #
#############################

data "aws_instance" "existing_ec2" {
  instance_id = var.ec2_instance_id
}

####################################
# DESPLEGAR APLICACIÓN EN LA EC2 #
####################################

resource "null_resource" "deploy_app" {
  # Ejecutar cada vez que se aplique terraform
  triggers = {
    always_run = timestamp()
  }

  connection {
    type        = "ssh"
    user        = var.ssh_user
    private_key = file(var.ssh_private_key_path)
    host        = data.aws_instance.existing_ec2.public_ip
  }

  # Clonar o actualizar el repositorio y desplegar
  provisioner "remote-exec" {
    inline = [
      "set -e",
      "echo '=== Actualizando código desde Git ==='",
      "cd /home/ubuntu",
      "if [ -d 'faketinder' ]; then cd faketinder && git pull origin ${var.git_branch}; else git clone -b ${var.git_branch} ${var.git_repo_url} faketinder; fi",
      "cd /home/ubuntu/faketinder",
      "echo '=== Configurando variables de entorno ==='",
      "cat > .env << 'ENVEOF'\nPORT=4003\nJWT_KEY=${var.jwt_key}\nJWT_EXPIRES_IN=3600\nMONGODB_URI=${var.mongodb_uri}\nENVEOF",
      "echo '=== Deteniendo contenedores anteriores ==='",
      "sudo docker-compose down 2>/dev/null || echo 'No hay contenedores previos'",
      "echo '=== Construyendo imágenes ==='",
      "sudo docker-compose build",
      "echo '=== Levantando contenedores ==='",
      "sudo docker-compose up -d",
      "echo '=== Verificando contenedores ==='",
      "sleep 3",
      "sudo docker-compose ps",
      "sudo docker ps",
      "echo '=== Despliegue completado exitosamente! ==='"
    ]
  }
}

################
# OUTPUT VALUES #
################

output "ec2_public_ip" {
  description = "IP pública de la instancia EC2"
  value       = data.aws_instance.existing_ec2.public_ip
}

output "deployment_status" {
  description = "Estado del despliegue"
  value       = "Aplicación desplegada en ${data.aws_instance.existing_ec2.public_ip}"
}
