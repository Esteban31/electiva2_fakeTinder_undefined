pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        COMPOSE_PROJECT_NAME = 'faketinder'
        TERRAFORM_DIR = 'infra' // Carpeta con tus archivos .tf
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
                            export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
                            export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
                            export AWS_DEFAULT_REGION=us-east-1

                            terraform init -input=false
                            terraform apply -auto-approve -input=false
                        '''
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
        }
        failure {
            echo "❌ Pipeline falló. Revisa que los contenedores estén activos o las credenciales AWS."
        }
        always {
            echo "🧹 Limpiando entorno mínimo..."
            sh 'rm -f .env || true'
        }
    }
}
