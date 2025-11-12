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
                sh "docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} down --remove-orphans"
            }
        }
        stage('Build & Run Services') {
            steps {
                sh "docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} build"
                sh "docker compose -f ${DOCKER_COMPOSE_FILE} --project-name ${COMPOSE_PROJECT_NAME} up -d"
            }
        }  

        stage('Run Tests') {
            steps {
                sh '''
                    docker compose exec -T auth-service echo "Service is running successfully"
                    docker compose exec -T users-service echo "Users service is running" 
                    docker compose exec -T swipes-service echo "Swipes service is running"
                    
                    docker compose ps | grep "Up"
                    
                    echo "Todos los servicios están activos"
                '''
            }
        }
    }
    post {
        success {
            echo "Pipeline completado exitosamente"
        }
        failure {
            echo "Pipeline no completado"
        }
        always {
            echo "Pipeline finalizado"
            sh 'rm -f .env'
        }
    }
}
