pipeline {
    agent any

    environment {
        TERRAFORM_DIR = 'infra'
        AWS_DEFAULT_REGION = 'us-east-1'
    }

    stages {
        stage('Deploy Infrastructure') {
            steps {
                echo "🚀 Desplegando infraestructura con Terraform..."
                dir("${TERRAFORM_DIR}") {
                    withCredentials([
                        string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY'),
                        string(credentialsId: 'jwt-key', variable: 'TF_VAR_jwt_key'),
                        string(credentialsId: 'mongodb-uri', variable: 'TF_VAR_mongodb_uri')
                    ]) {
                        sh '''
                            terraform init -input=false
                            terraform validate
                            terraform apply -auto-approve -input=false
                        '''
                    }
                }
            }
        }

        stage('Get Deployment Info') {
            steps {
                dir("${TERRAFORM_DIR}") {
                    script {
                        env.EC2_IP = sh(
                            script: 'terraform output -raw ec2_public_ip',
                            returnStdout: true
                        ).trim()
                        
                        echo "📍 IP de EC2: ${env.EC2_IP}"
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "🔍 Verificando disponibilidad de la aplicación..."
                    
                    def maxRetries = 20
                    def retryCount = 0
                    def isHealthy = false
                    
                    while (retryCount < maxRetries && !isHealthy) {
                        def status = sh(
                            script: "curl -s -o /dev/null -w '%{http_code}' http://${env.EC2_IP}:4000 || echo '000'",
                            returnStdout: true
                        ).trim()
                        
                        if (status == '200' || status == '404' || status == '502') {
                            echo "✅ Aplicación respondiendo (HTTP ${status})"
                            isHealthy = true
                        } else {
                            retryCount++
                            echo "⏳ Intento ${retryCount}/${maxRetries} - Esperando inicialización..."
                            sleep(15)
                        }
                    }
                    
                    if (!isHealthy) {
                        echo "⚠️  La aplicación aún se está iniciando. Verifica manualmente."
                    }
                }
            }
        }

        stage('Show Access Info') {
            steps {
                script {
                    echo """
                    ═══════════════════════════════════════════════
                    ✅ DESPLIEGUE COMPLETADO
                    ═══════════════════════════════════════════════
                    
                    🌐 URL: http://${env.EC2_IP}:4000
                    
                    📡 Servicios:
                    • Auth:   http://${env.EC2_IP}:4001
                    • Users:  http://${env.EC2_IP}:4002
                    • Swipes: http://${env.EC2_IP}:4003
                    
                    ═══════════════════════════════════════════════
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
            echo "❌ Pipeline falló"
            dir("${TERRAFORM_DIR}") {
                sh 'terraform show || true'
            }
        }
    }
}