pipeline {
  agent any

  stages {
    stage('Prebuild') {
      steps {
        checkout scm
        nodejs(nodeJSInstallationName: '7.10.0', configId: null) {
          sh 'npm i'
        }
      }
    }
    stage('Scrape') {
      environment {
        DEBUG = 'scraper-pkb'
      }
      steps {
        nodejs(nodeJSInstallationName: '7.10.0', configId: null) {
          sh 'npm start'
        }
      }
    }
  }
}
