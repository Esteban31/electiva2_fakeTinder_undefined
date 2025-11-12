pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        COMPOSE_PROJECT_NAME = 'faketinder'
    }

    stages {
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

        stage('Check Running Containers') {
            steps {
                echo '🔍 Verificando que los contenedores ya estén activos...'
                sh '''
                    RUNNING=$(docker compose -f "${DOCKER_COMPOSE_FILE}" ps -q)
                    if [ -z "$RUNNING" ]; then
                        echo "⚠️ No hay contenedores activos. Debes iniciarlos manualmente con:"
                        echo "   docker compose -f ${DOCKER_COMPOSE_FILE} up -d"
                        exit 1
                    else
                        echo "✅ Contenedores activos detectados:"
                        docker compose -f "${DOCKER_COMPOSE_FILE}" ps
                    fi
                '''
            }
        }

        stage('Run Health Checks') {
            steps {
                echo '🧪 Verificando que los servicios estén respondiendo...'
                sh '''
                    docker compose -f "${DOCKER_COMPOSE_FILE}" exec -T auth-service echo "Auth OK"
                    docker compose -f "${DOCKER_COMPOSE_FILE}" exec -T users-service echo "Users OK"
                    docker compose -f "${DOCKER_COMPOSE_FILE}" exec -T swipes-service echo "Swipes OK"

                    echo "📋 Estado final de los contenedores:"
                    docker compose -f "${DOCKER_COMPOSE_FILE}" ps

                    echo "✅ Todos los servicios están funcionando correctamente"
                '''
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline completado exitosamente sin recrear contenedores"
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
