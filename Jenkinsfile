pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        COMPOSE_PROJECT_NAME = 'faketinder'
        TERRAFORM_DIR = 'infra'
        AWS_DEFAULT_REGION = 'us-east-1'
    }

    stages {
        stage('Provision Infrastructure (Terraform)') {
            steps {
                echo "🌍 Desplegando infraestructura con Terraform..."
                dir("${TERRAFORM_DIR}") {
                    withCredentials([
                        string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY'),
                        string(credentialsId: 'jwt-key', variable: 'TF_VAR_jwt_key'),
                        string(credentialsId: 'mongodb-uri', variable: 'TF_VAR_mongodb_uri')
                    ]) {
                        sh '''
                            echo "🔑 Inicializando Terraform..."
                            terraform init -input=false
                            
                            echo "🔍 Validando configuración de Terraform..."
                            terraform validate
                            
                            echo "📋 Planificando infraestructura..."
                            terraform plan -out=tfplan -input=false
                            
                            echo "🚀 Aplicando infraestructura..."
                            terraform apply -input=false tfplan
                            
                            echo "✅ Infraestructura desplegada"
                            terraform output
                        '''
                    }
                }
            }
        }

        stage('Wait for EC2 Initialization') {
            steps {
                echo "⏳ Esperando a que la instancia EC2 se inicialice..."
                sleep(time: 120, unit: 'SECONDS')
            }
        }

        stage('Clean Previous Containers') {
            steps {
                script {
                    echo "🧹 Deteniendo y eliminando contenedores anteriores..."
                    sh 'docker-compose -f docker-compose.yml --project-name faketinder down --remove-orphans || true'
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
                echo "🚀 Construyendo y levantando contenedores..."
                sh 'docker-compose -f docker-compose.yml --project-name faketinder up -d --build'
            }
        }

        stage('Run Health Checks') {
            steps {
                script {
                    echo '🔍 Verificando que los servicios estén activos...'
                    sh """
                        docker-compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} ps
                        docker-compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} exec -T auth-service echo "Auth service is running"
                        docker-compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} exec -T users-service echo "Users service is running"
                        docker-compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} exec -T swipes-service echo "Swipes service is running"
                        echo "✅ Todos los servicios están activos"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline completado exitosamente"
            dir("${TERRAFORM_DIR}") {
                sh 'terraform output ec2_public_ip || true'
            }
        }
        failure {
            echo "❌ Pipeline falló. Revisa los logs de Terraform y Docker."
            dir("${TERRAFORM_DIR}") {
                sh 'terraform show || true'
            }
        }
        always {
            echo "🧹 Limpiando entorno mínimo..."
            sh 'rm -f .env || true'
        }
    }
}