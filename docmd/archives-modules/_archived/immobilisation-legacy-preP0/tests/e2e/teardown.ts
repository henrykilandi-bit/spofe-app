/**
 * Global Teardown — E2E Tests Module Immobilisation
 * SPOFE v1.0.0
 * 
 * Nettoie les ressources après tous les tests E2E
 */

export default async function globalTeardown(): Promise<void> {
  console.log('\n🧹 Global teardown: cleaning up E2E test resources...');
  
  // Close any open database connections
  // (Handled by individual test files, but safety net here)
  
  // Log completion
  console.log('✅ E2E tests completed\n');
}
