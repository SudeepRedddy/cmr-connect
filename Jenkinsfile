pipeline {
    agent any

    tools {
        nodejs 'node25'
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/SudeepRedddy/cmr-connect.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build Project') {
            steps {
                bat 'npm run build'
            }
        }
    }

    post {
        success {
            echo ' Build Successful'
        }
        failure {
            echo 'Build Failed'
        }
    }
}
