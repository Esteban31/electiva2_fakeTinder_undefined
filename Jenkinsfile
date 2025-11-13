pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        COMPOSE_PROJECT_NAME = 'faketinder'
        TERRAFORM_DIR = 'infra'
    }

    stages {
        stage('Deploy to EC2 with Terraform') {
            steps {
                echo "🌍 Desplegando aplicación en EC2 con Terraform..."
                dir("${TERRAFORM_DIR}") {
                    withCredentials([
                        string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                    ]) {
                        sh '''
                            echo "🔑 Configurando credenciales AWS..."
                            export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
                            export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
                            export AWS_DEFAULT_REGION=us-east-1

                            echo "📦 Inicializando Terraform..."
                            terraform init -input=false

                            echo "🚀 Aplicando Terraform..."
                            terraform apply -auto-approve -input=false

                            echo "✅ Despliegue en EC2 completado"
                        '''
                    }
                }
            }
        }

        stage('Clean Previous Containers') {
            steps {
                script {
                    echo "🧹 Deteniendo contenedores anteriores..."
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

        stage('Verify Services') {
            steps {
                script {
                    echo '🔍 Verificando servicios...'
                    sh """
                        sleep 5
                        docker-compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} ps
                        echo "✅ Servicios desplegados"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Despliegue completado exitosamente"
        }
        failure {
            echo "❌ El despliegue falló. Revisa los logs de los contenedores."
        }
        always {
            echo "🧹 Limpiando archivos temporales..."
            sh 'rm -f .env || true'
        }
    }
}
