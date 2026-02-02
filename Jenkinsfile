pipeline {
  agent any
  
  stages {
    stage('Setup') {
      steps {
        script {
          echo '🔧 Setting up environment...'
          sh 'node --version'
          sh 'npm --version'
        }
      }
    }
    
    stage('Install') {
      steps {
        script {
          echo '📦 Installing dependencies...'
          sh 'npm ci'
        }
      }
    }
    
    stage('Architecture Governance') {
      steps {
        script {
          echo '🏗️ Running AGA architecture checks...'
          
          // Validate configuration
          sh 'npx ts-node aga/index.ts . --validate'
          
          // Run full analysis
          sh 'npx ts-node aga/index.ts . --verbose'
          
          // Generate JSON report
          sh 'npx ts-node aga/index.ts . --format json > aga-report.json'
          
          // Display report
          sh 'cat aga-report.json | jq .'
        }
      }
    }
  }
  
  post {
    always {
      script {
        echo '📊 Publishing reports...'
        
        // Archive reports
        archiveArtifacts artifacts: 'aga-report.json', 
                         allowEmptyArchive: false,
                         fingerprint: true
        
        // Publish JSON report
        step([
          $class: 'PublishHTML',
          reportDir: '.',
          reportFiles: 'aga-report.json',
          reportName: 'AGA Architecture Report'
        ])
      }
    }
    
    failure {
      script {
        echo '❌ Architecture violations detected!'
        echo 'Pipeline failed - fix violations before merging'
        currentBuild.result = 'FAILURE'
      }
    }
    
    success {
      script {
        echo '✅ Architecture checks passed!'
      }
    }
  }
  
  options {
    buildDiscarder(logRotator(numToKeepStr: '30'))
    timeout(time: 1, unit: 'HOURS')
    timestamps()
  }
}
