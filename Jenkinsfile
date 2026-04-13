pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Backend Lint and Tests') {
      agent {
        docker {
          image 'python:3.12'
        }
      }
      steps {
        sh 'cd backend && pip install -r requirements.txt && pytest -q'
      }
    }

    stage('Frontend Lint and Tests') {
      agent {
        docker {
          image 'node:20'
        }
      }
      steps {
        sh 'cd frontend && npm install && npm run lint || true && npm test -- --passWithNoTests'
      }
    }

    stage('Build Docker Images') {
      steps {
        sh 'docker build -t futurekawa-backend ./backend'
        sh 'docker build -t futurekawa-frontend ./frontend'
      }
    }

    stage('E2E (optional)') {
      steps {
        sh 'cd frontend && npm run test:e2e || true'
      }
    }
  }
}
