pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker compose.yml'
        COMPOSE_PROJECT_NAME = 'faketinder'
    }

    stages {
        stage('Setup Environment') {
            steps {
                withCredentials([
                    string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                    string(credentialsId: 'mongodb-uri', variable: 'MONGODB_URI'),
                    string(credentialsId: 'api-key', variable: 'API_KEY')
                ]) {
                    sh '''
                        cat > .env << EOF
JWT_SECRET=${JWT_SECRET}
MONGODB_URI=${MONGODB_URI}
API_KEY=${API_KEY}
EOF
                    '''
                }
            }
        }

        stage('Clean Previous Containers') {
            steps {
                echo '🧹 Eliminando contenedores y redes anteriores...'
                sh "docker compose -f '${DOCKER_COMPOSE_FILE}' --project-name '${COMPOSE_PROJECT_NAME}' down --remove-orphans"
            }
        }

        stage('Build & Run Services') {
            steps {
                echo '⚙️ Construyendo imágenes y levantando servicios...'
                sh "docker compose -f '${DOCKER_COMPOSE_FILE}' --project-name '${COMPOSE_PROJECT_NAME}' build"
                sh "docker compose -f '${DOCKER_COMPOSE_FILE}' --project-name '${COMPOSE_PROJECT_NAME}' up -d"
            }
        }

        stage('Run Tests') {
            steps {
                echo '🧪 Verificando que los servicios estén activos...'
                sh '''
                    docker compose exec -T auth-service echo "Auth OK"
                    docker compose exec -T users-service echo "Users OK"
                    docker compose exec -T swipes-service echo "Swipes OK"
                    docker compose ps | grep "Up"
                    echo "✅ Todos los servicios están activos"
                '''
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline completado exitosamente"
        }
        failure {
            echo "❌ Pipeline no completado"
        }
        always {
            echo "🧹 Limpiando entorno..."

            // Eliminar archivo .env temporal
            sh 'rm -f .env'

            // Detener y eliminar contenedores, imágenes, volúmenes y cachés no usados
            sh '''
                echo "🧼 Limpiando Docker..."
                docker compose -f '${DOCKER_COMPOSE_FILE}' --project-name '${COMPOSE_PROJECT_NAME}' down -v --remove-orphans || true
                docker system prune -af --volumes || true
                docker builder prune -af || true

                echo "🧽 Limpiando workspace..."
                rm -rf * || true
            '''
        }
    }
}
