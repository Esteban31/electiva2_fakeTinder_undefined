# Guía de Despliegue - Fake Tinder

Esta guía te ayudará a desplegar la aplicación en tu instancia EC2 existente usando Terraform.

## Requisitos Previos

1. **Instancia EC2 con:**
   - Docker instalado
   - Docker Compose instalado
   - Jenkins instalado
   - Puertos abiertos: 22 (SSH), 80, 4000, 4001, 4002, 4003

2. **En tu máquina local:**
   - Terraform instalado
   - Credenciales AWS configuradas
   - Archivo .pem de tu keypair de AWS

## Configuración

### 1. Editar `terraform.tfvars`

Abre el archivo `terraform.tfvars` y actualiza los siguientes valores:

```terraform
# ID de tu instancia EC2 (lo encuentras en la consola de AWS EC2)
ec2_instance_id = "i-0123456789abcdef0"  # <- CAMBIA ESTO

# Ruta a tu archivo .pem (usa barras / incluso en Windows)
ssh_private_key_path = "C:/Users/TuUsuario/Downloads/tu-keypair.pem"  # <- CAMBIA ESTO
```

**Para obtener el Instance ID:**
1. Ve a la consola de AWS EC2
2. Selecciona tu instancia
3. Copia el "Instance ID" (empieza con `i-`)

### 2. Desplegar con Terraform

Abre PowerShell en la carpeta `infra/` y ejecuta:

```powershell
# Inicializar Terraform
terraform init

# Ver los cambios que se aplicarán
terraform plan

# Aplicar los cambios y desplegar
terraform apply
```

Terraform se conectará a tu EC2, copiará los archivos y levantará los contenedores automáticamente.

### 3. Verificar el Despliegue

Después del despliegue, verás la IP pública de tu EC2. Puedes verificar que todo funcione:

```powershell
# Ver los contenedores corriendo
ssh -i "ruta/a/tu-keypair.pem" ubuntu@TU_IP_PUBLICA "sudo docker ps"
```

Accede a: `http://TU_IP_PUBLICA:4000`

## Jenkinsfile

El `Jenkinsfile` actualizado es más simple y solo:
1. Detiene contenedores previos
2. Configura variables de entorno
3. Levanta los contenedores
4. Verifica que estén corriendo

**No necesitas configurar credenciales de AWS en Jenkins** porque los contenedores se levantan directamente en la instancia.

## Comandos Útiles

```powershell
# Ver estado de la infraestructura
terraform show

# Destruir el despliegue (detiene contenedores)
terraform destroy

# Re-desplegar
terraform apply
```

## Solución de Problemas

**Error: "Connection timeout"**
- Verifica que el puerto 22 esté abierto en el Security Group
- Verifica que la ruta del archivo .pem sea correcta

**Error: "Permission denied"**
- En Windows, asegúrate de que el archivo .pem tenga permisos apropiados
- Puedes usar: `icacls "tu-keypair.pem" /inheritance:r /grant:r "%USERNAME%:R"`

**Los contenedores no levantan:**
- Conéctate por SSH a la EC2 y verifica los logs:
  ```bash
  cd /home/ubuntu/faketinder
  sudo docker-compose logs
  ```
