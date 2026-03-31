pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        VPS_HOST = "147.93.15.250"
        VPS_USER = "amktech"
        VPS_FRONT_DIR = "/var/www/amktechsistemas/front"
        FRONT_BUILD_DIR = "dist/browser"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    node -v
                    npm -v
                    npm ci
                '''
            }
        }

        stage('Build Front') {
            steps {
                sh '''
                    npm run build
                    ls -la ${FRONT_BUILD_DIR}
                '''
            }
        }

        stage('Deploy to VPS') {
            steps {
                sshagent(credentials: ['vps-amktech-ssh']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "mkdir -p ${VPS_FRONT_DIR}"
                        ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "rm -rf ${VPS_FRONT_DIR}/*"
                        scp -o StrictHostKeyChecking=no -r ${FRONT_BUILD_DIR}/* ${VPS_USER}@${VPS_HOST}:${VPS_FRONT_DIR}/
                    '''
                }
            }
        }
    }
}