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
      "echo '=== Paso 1: Limpiando y clonando repositorio ==='",
      "cd /home/ubuntu",
      "sudo rm -rf faketinder",
      "git clone -b ${var.git_branch} ${var.git_repo_url} faketinder",
      "echo '=== Repositorio clonado correctamente ==='",
      "ls -la /home/ubuntu/faketinder",
      "echo '=== Verificando docker-compose.yml ==='",
      "test -f /home/ubuntu/faketinder/docker-compose.yml && echo 'docker-compose.yml encontrado' || echo 'ERROR: docker-compose.yml NO encontrado'"
    ]
  }

  # Paso 2: Configurar .env y levantar contenedores
  provisioner "remote-exec" {
    inline = [
      "echo '=== Paso 2: Configurando aplicación ==='",
      "cd /home/ubuntu/faketinder",
      "cat > .env << 'ENVEOF'\nPORT=4003\nJWT_KEY=${var.jwt_key}\nJWT_EXPIRES_IN=3600\nMONGODB_URI=${var.mongodb_uri}\nENVEOF",
      "echo 'Archivo .env creado correctamente'",
      "cat .env | head -2",
      "echo '=== Deteniendo contenedores anteriores ==='",
      "sudo docker compose down 2>/dev/null || echo 'No hay contenedores previos'",
      "echo '=== Limpiando imágenes antiguas ==='",
      "sudo docker system prune -f || true",
      "echo '=== Construyendo imágenes (esto puede tardar varios minutos) ==='",
      "sudo docker compose build --no-cache 2>&1 | tail -20",
      "echo '=== Levantando contenedores ==='",
      "sudo docker compose up -d 2>&1",
      "sleep 5",
      "echo '=== Estado de contenedores ==='",
      "sudo docker ps -a",
      "echo '=== Logs recientes ==='",
      "sudo docker compose logs --tail=10 || true",
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
