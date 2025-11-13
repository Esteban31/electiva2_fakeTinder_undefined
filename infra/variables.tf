variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

variable "ec2_instance_id" {
  description = "ID de la instancia EC2 existente"
  type        = string
}

variable "ssh_user" {
  description = "Usuario SSH para conectarse a la instancia"
  type        = string
  default     = "ubuntu"
}

variable "ssh_private_key_path" {
  description = "Ruta al archivo .pem de la clave SSH"
  type        = string
}

variable "jwt_key" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "mongodb_uri" {
  description = "MongoDB URI"
  type        = string
  sensitive   = true
}

variable "git_repo_url" {
  description = "URL del repositorio Git"
  type        = string
  default     = "https://github.com/electiva3-tdea/electiva2_fakeTinder_undefined.git"
}

variable "git_branch" {
  description = "Rama de Git a desplegar"
  type        = string
  default     = "example"
}
