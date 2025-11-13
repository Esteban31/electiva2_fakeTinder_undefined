pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        COMPOSE_PROJECT_NAME = 'faketinder'
        TERRAFORM_DIR = 'infra'
        AWS_REGION = 'us-east-1'
    }

    stages {
        stage('Deploy to EC2 with Terraform') {
            steps {
                echo "🌍 Desplegando aplicación en EC2 con Terraform..."
                dir("${TERRAFORM_DIR}") {
                    withCredentials([
                        string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY'),
                        file(credentialsId: 'ssh-key', variable: 'SSH_KEY')
                    ]) {
                        sh '''
                            echo "🔑 Configurando credenciales AWS..."
                            export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
                            export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
                            export AWS_DEFAULT_REGION=${AWS_REGION}

                            echo "📦 Inicializando Terraform..."
                            terraform init -input=false

                            echo "🚀 Aplicando Terraform..."
                            terraform apply -var "ssh_private_key_path=$SSH_KEY" -auto-approve -input=false

                            echo "✅ Despliegue completado!"
                            echo "📍 Revisa los outputs de Terraform arriba para ver la IP de tu EC2"
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Despliegue completado exitosamente en EC2"
            echo "🌐 Accede a tu aplicación en: http://<IP_EC2>:4000"
        }
        failure {
            echo "❌ El despliegue falló. Revisa los logs de Terraform arriba."
        }
    }
}
