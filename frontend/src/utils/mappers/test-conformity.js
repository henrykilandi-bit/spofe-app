#!/usr/bin/env node

/**
 * 🧪 TEST DE CONFORMITÉ DES MAPPERS - SPOFE v2.2
 * 
 * Test tous les mappers pour vérifier l'alignement parfait
 * avec les DTO du backend selon le contrat inter-couches
 */

import { 
  userMapper, 
  roleMapper, 
  companyMapper, 
  groupMapper,
  journalEntryMapper,
  journalEntryLineMapper,
  chartOfAccountMapper,
  accountBalanceMapper,
  auditTrailMapper,
  securityEventMapper
} from './index.js';

class MapperConformityTester {
  constructor() {
    this.mappers = {
      user: userMapper,
      role: roleMapper,
      company: companyMapper,
      group: groupMapper,
      journalEntry: journalEntryMapper,
      journalEntryLine: journalEntryLineMapper,
      chartOfAccount: chartOfAccountMapper,
      accountBalance: accountBalanceMapper,
      auditTrail: auditTrailMapper,
      securityEvent: securityEventMapper
    };
    
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  async runAllTests() {
    console.log('🧪 TEST DE CONFORMITÉ DES MAPPERS - SPOFE v2.2');
    console.log('📋 Vérification alignement DTO ↔ Frontend');
    console.log('');

    for (const [mapperName, mapper] of Object.entries(this.mappers)) {
      await this.testMapper(mapperName, mapper);
    }

    this.displaySummary();
    this.generateReport();
  }

  async testMapper(mapperName, mapper) {
    console.log(`🔍 Test ${mapperName}...`);
    
    try {
      // Utiliser le test de conformité intégré
      const testResult = mapper.testConformity();
      
      const result = {
        mapper: mapperName,
        conformity: testResult.conformity,
        isValid: testResult.validation.isValid,
        score: testResult.validation.score,
        errors: testResult.validation.errors,
        warnings: testResult.validation.warnings,
        roundTripSuccess: this.checkRoundTrip(testResult.original, testResult.roundTrip)
      };

      this.results.total++;
      if (result.isValid && result.roundTripSuccess) {
        this.results.passed++;
        console.log(`✅ ${mapperName}: CONFORM (Score: ${result.score})`);
      } else {
        this.results.failed++;
        console.log(`❌ ${mapperName}: NON-CONFORM (Score: ${result.score})`);
        if (result.errors.length > 0) {
          console.log(`   Erreurs: ${result.errors.join(', ')}`);
        }
        if (!result.roundTripSuccess) {
          console.log(`   ⚠️ Round-trip test failed`);
        }
      }

      this.results.details.push(result);
      
    } catch (error) {
      this.results.total++;
      this.results.failed++;
      console.log(`❌ ${mapperName}: ERROR - ${error.message}`);
      
      this.results.details.push({
        mapper: mapperName,
        conformity: '❌ ERROR',
        isValid: false,
        score: 0,
        errors: [error.message],
        warnings: [],
        roundTripSuccess: false
      });
    }
  }

  checkRoundTrip(original, roundTrip) {
    if (!original || !roundTrip) return false;
    
    // Vérifier les champs clés
    const keyFields = ['id'];
    for (const field of keyFields) {
      if (original[field] !== roundTrip[field]) {
        return false;
      }
    }
    
    return true;
  }

  displaySummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DES TESTS DE CONFORMITÉ');
    console.log('='.repeat(80));
    
    const conformityRate = this.results.total > 0 
      ? Math.round((this.results.passed / this.results.total) * 100)
      : 0;
    
    console.log(`📈 Taux de conformité: ${conformityRate}%`);
    console.log(`✅ Tests réussis: ${this.results.passed}/${this.results.total}`);
    console.log(`❌ Tests échoués: ${this.results.failed}/${this.results.total}`);
    
    if (this.results.failed > 0) {
      console.log('\n🚨 Mappers non conformes:');
      this.results.details
        .filter(detail => !detail.isValid || !detail.roundTripSuccess)
        .forEach(detail => {
          console.log(`   - ${detail.mapper}: ${detail.conformity}`);
        });
    }
    
    console.log('='.repeat(80));
    
    if (conformityRate >= 95) {
      console.log('🎉 EXCELLENT! Tous les mappers sont conformes');
    } else if (conformityRate >= 85) {
      console.log('BON! Quelques améliorations possibles');
    } else {
      console.log('Des corrections sont nécessaires');
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      version: 'SPOFE v2.2',
      results: this.results,
      conformityRate: this.results.total > 0 
        ? Math.round((this.results.passed / this.results.total) * 100)
        : 0,
      status: this.results.failed === 0 ? 'EXCELLENT' : 
              this.results.failed <= 2 ? 'BON' : 'À AMÉLIORER',
      recommendations: this.generateRecommendations()
    };
    
    // Sauvegarder le rapport
    const fs = await import('fs');
    const path = await import('path');
    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.dirname(__filename);
    
    const reportPath = path.join(__dirname, 'mapper-conformity-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\nRapport détaillé sauvegardé: ${reportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.failed === 0) {
      recommendations.push('🎉 Maintenir la conformité actuelle');
      recommendations.push('📏 Continuer à utiliser les mappers pour toutes les transformations');
    } else {
      recommendations.push('🔧 Corriger les mappers non conformes identifiés');
      recommendations.push('🧪 Relancer les tests après corrections');
      recommendations.push('📋 Documenter les patterns de mapping corrects');
    }
    
    const failedMappers = this.results.details
      .filter(detail => !detail.isValid || !detail.roundTripSuccess)
      .map(detail => detail.mapper);
    
    if (failedMappers.length > 0) {
      recommendations.push(`🎯 Focus sur: ${failedMappers.join(', ')}`);
    }
    
    return recommendations;
  }
}

// Point d'entrée
async function runMapperConformityTests() {
  const tester = new MapperConformityTester();
  await tester.runAllTests();
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runMapperConformityTests().catch(error => {
    console.error('❌ Erreur lors des tests:', error.message);
    process.exit(1);
  });
}

export { MapperConformityTester, runMapperConformityTests };
