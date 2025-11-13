variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

variable "ami_id" {
  description = "AMI de Ubuntu (por ejemplo, Ubuntu 22.04 LTS)"
  type        = string
  default     = "ami-053b0d53c279acc90"
}

variable "instance_type" {
  description = "Tipo de instancia"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Nombre del key pair en AWS"
  type        = string
}

variable "git_repo_url" {
  description = "URL del repositorio con el proyecto"
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
