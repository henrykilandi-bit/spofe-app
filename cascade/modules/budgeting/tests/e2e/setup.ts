/**
 * Setup E2E Tests - Budget Module
 */
import { execSync } from 'child_process';

beforeAll(async () => {
  console.log('🔧 Setting up E2E test environment...');
  
  // Start test database
  try {
    execSync('docker-compose -f docker-compose.test.yml up -d postgres-test', { 
      stdio: 'inherit',
      timeout: 30000 
    });
    
    // Wait for DB to be ready
    console.log('⏳ Waiting for test database...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Run migrations
    execSync('npm run db:migrate:test', { stdio: 'inherit' });
    
    console.log('✅ E2E environment ready');
  } catch (error) {
    console.error('❌ Failed to setup E2E environment:', error);
    throw error;
  }
});

afterAll(async () => {
  console.log('🧹 Cleaning up E2E test environment...');
  
  try {
    // Stop test containers
    execSync('docker-compose -f docker-compose.test.yml down -v', { 
      stdio: 'inherit',
      timeout: 15000 
    });
    
    console.log('✅ E2E cleanup completed');
  } catch (error) {
    console.warn('⚠️ E2E cleanup warning:', error instanceof Error ? error.message : String(error));
  }
});