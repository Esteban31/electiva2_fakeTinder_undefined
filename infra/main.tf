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

  # Paso 1: Clonar/actualizar código
  provisioner "remote-exec" {
    inline = [
      "echo '=== Paso 1: Actualizando código desde Git ==='",
      "cd /home/ubuntu",
      "if [ -d 'faketinder' ]; then echo 'Actualizando repositorio existente...' && cd faketinder && git fetch --all && git reset --hard origin/${var.git_branch} && git clean -fd; else echo 'Clonando repositorio...' && git clone -b ${var.git_branch} ${var.git_repo_url} faketinder; fi",
      "echo '=== Código actualizado correctamente ==='",
      "ls -la /home/ubuntu/faketinder"
    ]
  }

  # Paso 2: Configurar .env y levantar contenedores
  provisioner "remote-exec" {
    inline = [
      "echo '=== Paso 2: Configurando aplicación ==='",
      "cd /home/ubuntu/faketinder",
      "cat > .env << 'ENVEOF'\nPORT=4003\nJWT_KEY=${var.jwt_key}\nJWT_EXPIRES_IN=3600\nMONGODB_URI=${var.mongodb_uri}\nENVEOF",
      "echo 'Archivo .env creado'",
      "echo '=== Deteniendo contenedores anteriores ==='",
      "sudo docker-compose down 2>/dev/null || echo 'No hay contenedores previos'",
      "echo '=== Construyendo imágenes ==='",
      "sudo docker-compose build --no-cache",
      "echo '=== Levantando contenedores ==='",
      "sudo docker-compose up -d",
      "sleep 1",
      "echo '=== Estado de contenedores ==='",
      "sudo docker ps",
      "echo '=== Despliegue completado! ==='"
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
