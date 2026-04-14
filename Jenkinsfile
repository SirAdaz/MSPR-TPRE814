pipeline {
  agent any
  environment {
    FRONTEND_COVERAGE_MIN = '80'
    BACKEND_COVERAGE_MIN = '80'
  }

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
        sh 'cd backend && pip install -r requirements.txt && pytest -q --cov-fail-under=$BACKEND_COVERAGE_MIN'
      }
    }

    stage('Frontend Lint and Tests') {
      agent {
        docker {
          image 'node:20'
        }
      }
      steps {
        sh 'cd frontend && npm install && npm run lint && npm run test:coverage'
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
        sh 'cd frontend && npm run test:e2e'
      }
    }
  }
}
