pipeline {
    agent any

    environment {
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
                            
                            echo "🔍 Validando configuración..."
                            terraform validate
                            
                            echo "📋 Planificando infraestructura..."
                            terraform plan -out=tfplan -input=false
                            
                            echo "🚀 Aplicando infraestructura..."
                            terraform apply -input=false tfplan
                            
                            echo "✅ Infraestructura desplegada"
                        '''
                    }
                }
            }
        }

        stage('Get EC2 Information') {
            steps {
                dir("${TERRAFORM_DIR}") {
                    script {
                        def ec2_ip = sh(
                            script: 'terraform output -raw ec2_public_ip',
                            returnStdout: true
                        ).trim()
                        
                        echo "📍 IP de la instancia EC2: ${ec2_ip}"
                        echo "🌐 Accede a tu aplicación en: http://${ec2_ip}:4000"
                        echo "⏳ Espera ~5 minutos para que Docker Compose termine de inicializar"
                        
                        // Guardar la IP como variable de entorno para stages posteriores
                        env.EC2_IP = ec2_ip
                    }
                }
            }
        }

        stage('Wait for Application') {
            steps {
                echo "⏳ Esperando 5 minutos para que la aplicación se inicie en EC2..."
                sleep(time: 2, unit: 'MINUTES')
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    echo "🔍 Verificando despliegue en ${env.EC2_IP}..."
                    
                    // Esperar más tiempo y verificar logs
                    sleep(time: 1, unit: 'MINUTES')
                    
                    // Verificar logs de user-data
                    echo "📋 Verificando logs de inicialización..."
                    sh """
                        ssh -o StrictHostKeyChecking=no -i mi-keypair.pem ubuntu@${env.EC2_IP} '
                            echo "=== User Data Logs ==="
                            sudo tail -100 /var/log/user-data.log || echo "No user-data logs"
                            
                            echo "=== Docker Status ==="
                            sudo systemctl status docker --no-pager || true
                            
                            echo "=== Docker Compose Status ==="
                            cd /home/ubuntu/faketinder && docker-compose ps || true
                            
                            echo "=== Container Logs ==="
                            cd /home/ubuntu/faketinder && docker-compose logs --tail=50 || true
                        '
                    """
                    
                    // Health check con retry
                    def maxRetries = 10
                    def retryCount = 0
                    def healthCheckPassed = false
                    
                    while (retryCount < maxRetries && !healthCheckPassed) {
                        def healthCheckResult = sh(
                            script: """
                                curl -f -s -o /dev/null -w '%{http_code}' http://${env.EC2_IP}:4000 || echo '000'
                            """,
                            returnStdout: true
                        ).trim()
                        
                        if (healthCheckResult == '200' || healthCheckResult == '404') {
                            echo "✅ Nginx está respondiendo (HTTP ${healthCheckResult})"
                            healthCheckPassed = true
                        } else {
                            retryCount++
                            echo "⏳ Intento ${retryCount}/${maxRetries}: Nginx no responde (${healthCheckResult}). Esperando..."
                            sleep(time: 30, unit: 'SECONDS')
                        }
                    }
                    
                    if (!healthCheckPassed) {
                        error("❌ Nginx no respondió después de ${maxRetries} intentos")
                    }
                }
            }
        }

        stage('Display Access Information') {
            steps {
                script {
                    echo """
                    ═══════════════════════════════════════════════════
                    🎉 DESPLIEGUE COMPLETADO
                    ═══════════════════════════════════════════════════
                    
                    📍 IP Pública: ${env.EC2_IP}
                    🌐 URL Principal: http://${env.EC2_IP}:4000
                    
                    📡 Endpoints de Servicios:
                    ├─ Auth Service:   http://${env.EC2_IP}:4001
                    ├─ Users Service:  http://${env.EC2_IP}:4002
                    └─ Swipes Service: http://${env.EC2_IP}:4003
                    
                    🔐 Conexión SSH:
                    ssh -i mi-keypair.pem ubuntu@${env.EC2_IP}
                    
                    📋 Verificar logs en EC2:
                    cd /home/ubuntu/faketinder && docker-compose logs -f
                    
                    ═══════════════════════════════════════════════════
                    """
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline completado exitosamente"
            script {
                if (env.EC2_IP) {
                    echo "🌐 Tu aplicación está en: http://${env.EC2_IP}:4000"
                }
            }
        }
        failure {
            echo "❌ Pipeline falló. Revisa los logs."
            dir("${TERRAFORM_DIR}") {
                sh 'terraform show || true'
            }
        }
    }
}