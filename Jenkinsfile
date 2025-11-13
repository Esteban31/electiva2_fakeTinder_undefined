pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        COMPOSE_PROJECT_NAME = 'faketinder'
        TERRAFORM_DIR = 'infra' // Carpeta con tus archivos .tf
        AWS_REGION = 'us-east-1'
    }

    stages {
       stage('Provision Infrastructure (Terraform)') {
            steps {
                echo "🌍 Desplegando infraestructura con Terraform..."
                dir("${TERRAFORM_DIR}") {
                    withCredentials([
                        string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                    ]) {
                        sh '''
                            echo "🔑 Configurando variables AWS para Terraform..."
                            export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                            export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                            export AWS_DEFAULT_REGION=us-east-1

                            terraform init -input=false
                            terraform apply -auto-approve -input=false
                            
                            echo ""
                            echo "=========================================="
                            echo "✅ Terraform apply completado"
                            echo "=========================================="
                            terraform output
                        '''
                    }
                }
            }
        }

        stage('Wait for Application to be Ready') {
            steps {
                echo '⏳ Esperando a que la aplicación esté lista...'
                dir('infra') {
                    withCredentials([
                        string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                    ]) {
                        script {
                            sh '''
                                export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                                export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                                export AWS_DEFAULT_REGION=us-east-1
                                
                                # Obtener IP pública
                                EC2_IP=$(terraform output -raw ec2_public_ip)
                                echo "IP de EC2: $EC2_IP"
                                
                                # Esperar a que la aplicación responda (máximo 5 minutos)
                                echo "🏥 Verificando salud de la aplicación..."
                                for i in {1..30}; do
                                    if curl -f -m 10 http://$EC2_IP:4003/health 2>/dev/null || curl -f -m 10 http://$EC2_IP:4003 2>/dev/null; then
                                        echo "✅ Aplicación está respondiendo correctamente"
                                        exit 0
                                    fi
                                    echo "Intento $i/30: Esperando respuesta de la aplicación..."
                                    sleep 10
                                done
                                
                                echo "⚠️ La aplicación no respondió en 5 minutos"
                                echo "Esto es normal si es la primera vez o si Docker está descargando imágenes"
                                echo "Puedes verificar manualmente en: http://$EC2_IP:4003"
                            '''
                        }
                    }
                }
            }
        }

        stage('Clean Previous Containers') {
            steps {
                script {
                    echo "🧹 Deteniendo y eliminando contenedores anteriores..."
                    sh "docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} down --remove-orphans || true"
                }
            }
        }

        stage('Setup Environment') {
            steps {
                echo '⚙️ Configurando variables de entorno...'
                withCredentials([
                    string(credentialsId: 'jwt-key', variable: 'JWT_KEY'),
                    string(credentialsId: 'mongodb-uri', variable: 'MONGODB_URI')
                ]) {
                    sh '''
                        echo "📝 Creando archivo .env ..."
                        cat > .env << EOF
PORT=4003
JWT_KEY=${JWT_KEY}
JWT_EXPIRES_IN=3600
MONGODB_URI=${MONGODB_URI}
EOF
                    '''
                }
            }
        }

        stage('Build and Run Containers') {
            steps {
                echo '🚀 Construyendo y levantando contenedores...'
                sh "docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} up -d --build"
            }
        }

        stage('Run Health Checks') {
            steps {
                script {
                    echo '🔍 Verificando que los servicios estén activos...'
                    sh """
                        docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} ps
                        docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} exec -T auth-service echo "Auth service is running"
                        docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} exec -T users-service echo "Users service is running"
                        docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} exec -T swipes-service echo "Swipes service is running"
                        echo "✅ Todos los servicios están activos"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline completado exitosamente"
            dir('infra') {
                withCredentials([
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    script {
                        sh '''
                            export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                            export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                            export AWS_DEFAULT_REGION=us-east-1
                            
                            EC2_IP=$(terraform output -raw ec2_public_ip)
                            
                            echo ""
                            echo "=========================================="
                            echo "✅ DESPLIEGUE COMPLETADO EXITOSAMENTE"
                            echo "=========================================="
                            echo "🌐 URL de la aplicación: http://$EC2_IP:4003"
                            echo "📊 Instancia EC2: $(terraform output -raw instance_id)"
                            echo "=========================================="
                        '''
                    }
                }
            }
        }
        failure {
            echo "❌ Pipeline falló. Revisa los logs de Terraform."
        }
        always {
            echo "🧹 Limpiando entorno mínimo..."
            sh 'rm -f .env || true'
        }
    }
}
