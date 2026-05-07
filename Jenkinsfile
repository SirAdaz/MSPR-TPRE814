pipeline {
  agent any
  parameters {
    booleanParam(name: 'RUN_E2E', defaultValue: false, description: 'Run optional E2E stage')
  }
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
        sh '''
          cd backend
          mkdir -p test-results
          pip install -r requirements.txt
          pytest -q \
            --cov=app \
            --cov-fail-under=$BACKEND_COVERAGE_MIN \
            --cov-report=xml:coverage.xml \
            --cov-report=term-missing \
            --junitxml=test-results/junit-backend.xml
        '''
      }
    }

    stage('Frontend Lint and Tests') {
      agent {
        docker {
          image 'node:22'
        }
      }
      steps {
        sh '''
          cd frontend
          mkdir -p test-results
          npm install
          npm run lint
          npm run test:coverage
        '''
      }
    }

    stage('Build Docker Images') {
      steps {
        sh 'docker build -t futurekawa-backend:${BUILD_NUMBER} -t futurekawa-backend:latest ./backend'
        sh 'docker build -t futurekawa-frontend:${BUILD_NUMBER} -t futurekawa-frontend:latest ./frontend'
      }
    }

    stage('Package Docker Artifacts') {
      steps {
        sh '''
          mkdir -p artifacts
          docker save -o artifacts/futurekawa-backend-${BUILD_NUMBER}.tar futurekawa-backend:${BUILD_NUMBER}
          docker save -o artifacts/futurekawa-frontend-${BUILD_NUMBER}.tar futurekawa-frontend:${BUILD_NUMBER}
        '''
      }
    }

    stage('E2E (optional)') {
      when {
        expression { params.RUN_E2E }
      }
      steps {
        sh 'cd frontend && npm run test:e2e'
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: 'backend/test-results/*.xml'
      archiveArtifacts artifacts: 'backend/coverage.xml,frontend/coverage/**/*,artifacts/*.tar', allowEmptyArchive: true, fingerprint: true
    }
  }
}
