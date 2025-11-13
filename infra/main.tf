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
      "echo 'Actualizando código desde Git...'",
      "cd /home/ubuntu",
      "if [ -d 'faketinder' ]; then cd faketinder && git pull origin ${var.git_branch} && cd ..; else git clone -b ${var.git_branch} ${var.git_repo_url} faketinder; fi",
      "cd faketinder",
      "echo 'Configurando variables de entorno...'",
      "echo 'PORT=4003' > .env",
      "echo 'JWT_KEY=${var.jwt_key}' >> .env",
      "echo 'JWT_EXPIRES_IN=3600' >> .env",
      "echo 'MONGODB_URI=${var.mongodb_uri}' >> .env",
      "echo 'Deteniendo contenedores anteriores...'",
      "sudo docker-compose down || true",
      "echo 'Levantando contenedores...'",
      "sudo docker-compose up -d --build",
      "echo 'Despliegue completado exitosamente!'"
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
