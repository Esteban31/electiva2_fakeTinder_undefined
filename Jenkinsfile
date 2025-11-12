pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        COMPOSE_PROJECT_NAME = 'faketinder'
    }

    stages {
        stage('Clean Previous Containers') {
            steps {
                script {
                    echo "🧹 Deteniendo y eliminando contenedores anteriores..."
                    sh "docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} down --remove-orphans"
                }
            }
        }

        stage('Setup Environment') {
            steps {
                echo '⚙️ Configurando variables de entorno...'
                withCredentials([
                    string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                    string(credentialsId: 'mongodb-uri', variable: 'MONGODB_URI'),
                    string(credentialsId: 'api-key', variable: 'API_KEY')
                ]) {
                    sh '''
                        echo "📝 Creando archivo .env ..."
                        cat > .env << EOF
JWT_SECRET=${JWT_SECRET}
MONGODB_URI=${MONGODB_URI}
API_KEY=${API_KEY}
EOF
                    '''
                }
            }
        }

        stage('Run Health Checks') {
            steps {
                script {
                    echo '🔍 Verificando que los servicios estén activos...'
                    sh """
                        docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} exec -T auth-service echo "Auth service is running"
                        docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} exec -T users-service echo "Users service is running"
                        docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} exec -T swipes-service echo "Swipes service is running"
                        docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} ps
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
            echo "❌ Pipeline falló. Revisa que los contenedores estén activos"
        }
        always {
            echo "🧹 Limpiando entorno mínimo..."
            sh 'rm -f .env'
        }
    }
}
