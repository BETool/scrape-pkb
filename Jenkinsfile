pipeline {
    agent any

    stages {
        stage('Scrape') {
            environment {
                DEBUG = 'scraper-pkb'
            }
            steps {
                sh 'npm start'
            }
        }
    }
}
