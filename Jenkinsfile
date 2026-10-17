pipeline {
    agent any

    // Requires Jenkins NodeJS plugin: Manage Jenkins -> Tools -> NodeJS -> Name: Node22
    tools {
        nodejs 'Node22'
    }

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        CI = 'true'
        BASE_URL = 'https://restful-booker.herokuapp.com'
    }

    stages {
        stage('Checkout Branch') {
            steps {
                checkout scm
                echo "Testing branch: ${env.BRANCH_NAME}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'node --version && npm --version && npm ci'
            }
        }

        stage('TypeScript Validation') {
            steps {
                sh 'npm run typecheck'
            }
        }

        stage('Execute API Tests') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'booker-api-credentials',
                        usernameVariable: 'AUTH_USERNAME',
                        passwordVariable: 'AUTH_PASSWORD'
                    )
                ]) {
                    sh 'npm test'
                }
            }
        }
    }

    post {
        always {
            junit testResults: 'test-results/junit.xml', allowEmptyResults: true
            archiveArtifacts artifacts: 'custom-report/**/*.html, test-results/**/*', allowEmptyArchive: true
            publishHTML(target: [
                reportName: 'Booker API HTML Report',
                reportDir: 'custom-report',
                reportFiles: 'index.html',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true
            ])
        }
        success {
            echo 'SUCCESS: API tests passed.'
        }
        failure {
            echo 'FAILURE: Review the Jenkins console and test reports.'
        }
    }
}
