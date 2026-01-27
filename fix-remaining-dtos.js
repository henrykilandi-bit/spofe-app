const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECTION DES DTOS RESTANTS - CONTRAT SILC v1.0');
console.log('================================================\n');

// Configuration
const dtoDir = 'cascade/src/dto';

// DTOs restants à corriger avec leur nom cible correct
const remainingDtos = [
  { old: 'account_balance.dto.js', new: 'AccountBalanceDto.js' },
  { old: 'audit_trail.dto.js', new: 'AuditTrailDto.js' },
  { old: 'chart_of_account.dto.js', new: 'ChartOfAccountDto.js' },
  { old: 'consultant_company_access.dto.js', new: 'ConsultantCompanyAccessDto.js' },
  { old: 'groupe_entreprise.dto.js', new: 'GroupeEntrepriseDto.js' },
  { old: 'journal_entry.dto.js', new: 'JournalEntryDto.js' },
  { old: 'journal_entry_line.dto.js', new: 'JournalEntryLineDto.js' },
  { old: 'password_reset_token.dto.js', new: 'PasswordResetTokenDto.js' },
  { old: 'security_event.dto.js', new: 'SecurityEventDto.js' },
  { old: 'token_blacklist.dto.js', new: 'TokenBlacklistDto.js' }
];

console.log(`🔍 ${remainingDtos.length} DTOs restants à traiter\n`);

let successCount = 0;
let errorCount = 0;
const results = [];

remainingDtos.forEach(({ old, new: newName }) => {
  const oldPath = path.join(dtoDir, old);
  const newPath = path.join(dtoDir, newName);
  
  try {
    // Vérifier que l'ancien fichier existe
    if (!fs.existsSync(oldPath)) {
      console.log(`⚠️  Fichier source inexistant: ${old}`);
      results.push({ old, new: newName, status: 'SOURCE_NOT_FOUND' });
      return;
    }
    
    // Si le nouveau fichier existe déjà, le supprimer d'abord
    if (fs.existsSync(newPath)) {
      console.log(`🗑️  Suppression du fichier existant: ${newName}`);
      fs.unlinkSync(newPath);
    }
    
    // Renommer le fichier
    fs.renameSync(oldPath, newPath);
    successCount++;
    
    console.log(`✅ ${old} → ${newName}`);
    results.push({ old, new: newName, status: 'RENAMED' });
    
  } catch (error) {
    errorCount++;
    console.log(`❌ ERREUR: ${old} → ${newName} - ${error.message}`);
    results.push({ old, new: newName, status: 'ERROR', error: error.message });
  }
});

console.log(`\n📊 RÉSULTATS:`);
console.log(`   ✅ Succès: ${successCount}`);
console.log(`   ❌ Erreurs: ${errorCount}`);

// Vérification finale
console.log('\n🔍 VÉRIFICATION FINALE...');
const finalFiles = fs.readdirSync(dtoDir).filter(file => 
  file.endsWith('.dto.js') && fs.statSync(path.join(dtoDir, file)).isFile()
);

const compliantFiles = finalFiles.filter(file => file.endsWith('Dto.js'));
const nonCompliantFiles = finalFiles.filter(file => !file.endsWith('Dto.js'));

console.log(`📊 DTOs totaux: ${finalFiles.length}`);
console.log(`✅ Conformes: ${compliantFiles.length}`);
console.log(`❌ Non conformes: ${nonCompliantFiles.length}`);

const complianceRate = finalFiles.length > 0 ? ((compliantFiles.length / finalFiles.length) * 100).toFixed(1) : '0.0';
console.log(`📈 Taux de conformité SILC v1.0: ${complianceRate}%`);

if (nonCompliantFiles.length > 0) {
  console.log('\n❌ DTOs encore non conformes:');
  nonCompliantFiles.forEach(file => {
    console.log(`   • ${file}`);
  });
} else {
  console.log('\n🎉 TOUS LES DTOS SONT MAINTENANT CONFORMES AU CONTRAT SILC v1.0!');
}

// Générer le rapport
const report = {
  date: new Date().toISOString(),
  operation: 'FIX_REMAINING_DTOS',
  contract: 'SILC_v1.0',
  results: {
    totalProcessed: remainingDtos.length,
    success: successCount,
    errors: errorCount,
    finalComplianceRate: complianceRate
  },
  details: results,
  finalState: {
    totalDtos: finalFiles.length,
    compliant: compliantFiles.length,
    nonCompliant: nonCompliantFiles.length
  }
};

fs.writeFileSync('fix-remaining-dtos-report.json', JSON.stringify(report, null, 2));
console.log('\n💾 Rapport sauvegardé: fix-remaining-dtos-report.json');

console.log('\n✅ Opération terminée!');
