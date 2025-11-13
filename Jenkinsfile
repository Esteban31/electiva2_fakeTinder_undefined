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
                    }
                }
            }
        }

        stage('Wait for Application') {
            steps {
                echo "⏳ Esperando 5 minutos para que la aplicación se inicie en EC2..."
                sleep(time: 5, unit: 'MINUTES')
            }
        }

        stage('Verify Deployment') {
            steps {
                dir("${TERRAFORM_DIR}") {
                    script {
                        def ec2_ip = sh(
                            script: 'terraform output -raw ec2_public_ip',
                            returnStdout: true
                        ).trim()
                        
                        echo "🔍 Verificando despliegue..."
                        sh """
                            curl -f http://${ec2_ip}:4000/auth/token -X POST \
                                -H "Content-Type: application/json" \
                                -d '{"user":"admin","apikey":"${TF_VAR_jwt_key}"}' \
                                && echo "✅ Aplicación respondiendo correctamente" \
                                || echo "⚠️ Aplicación aún no está lista"
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline completado exitosamente"
            dir("${TERRAFORM_DIR}") {
                script {
                    def ec2_ip = sh(
                        script: 'terraform output -raw ec2_public_ip',
                        returnStdout: true
                    ).trim()
                    echo "🌐 Tu aplicación está en: http://${ec2_ip}:4000"
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