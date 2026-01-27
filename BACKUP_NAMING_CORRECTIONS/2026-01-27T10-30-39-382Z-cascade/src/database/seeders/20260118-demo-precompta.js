/**
 * Seeder: Données de démonstration pour pré-comptabilité SPOFE
 * 
 * Contenu:
 * 1. Exercice fiscal 2024 (OPEN)
 * 2. Templates d'opérations pré-comptables
 * 3. Opérations de test pour le workflow
 * 
 * Exécution: npx sequelize-cli db:seed --seed 20260118-demo-precompta.js
 */

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ============================================
    // 1. VÉRIFIER/CRÉER SOCIÉTÉ DE DÉMO
    // ============================================
    
    const [companies] = await queryInterface.sequelize.query(
      `SELECT id FROM companies LIMIT 1`
    );

    let companyId;
    if (companies.length === 0) {
      const [result] = await queryInterface.sequelize.query(
        `INSERT INTO companies (id, name, registrationNumber, email, phone, country, createdAt, updatedAt) 
         VALUES (UUID(), 'DEMO SARL', 'CI-ABJ-2024-000001', 'demo@spofe_v2_1.com', '+225 01 02 03 04 05', 'Côte d\'Ivoire', NOW(), NOW())`
      );
      companyId = result.insertId;
    } else {
      companyId = companies[0].id;
    }

    // ============================================
    // 2. CRÉER UTILISATEURS DE TEST
    // ============================================
    
    const hashedPassword = await bcrypt.hash('Test@2024', 10);

    // Comptable (ADMIN)
    await queryInterface.bulkInsert('users', [{
      id: Sequelize.literal('UUID()'),
      username: 'comptable_demo',
      email: 'comptable@spofe_v2_1-demo.local',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {
      ignoreDuplicates: true
    });

    // Utilisateur métier (USER)
    await queryInterface.bulkInsert('users', [{
      id: Sequelize.literal('UUID()'),
      username: 'user_demo',
      email: 'user@spofe_v2_1-demo.local',
      password: hashedPassword,
      role: 'USER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {
      ignoreDuplicates: true
    });

    // Récupérer les IDs
    const [comptableResult] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE username = 'comptable_demo' LIMIT 1`
    );
    const [userResult] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE username = 'user_demo' LIMIT 1`
    );

    const comptableId = comptableResult[0]?.id;
    const userId = userResult[0]?.id;

    // ============================================
    // 3. CRÉER EXERCICE FISCAL 2024
    // ============================================
    
    await queryInterface.bulkInsert('fiscal_years', [{
      company_id: companyId,
      year: 2024,
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-31'),
      status: 'OPEN',
      is_current: true,
      created_at: new Date(),
      updated_at: new Date()
    }], {
      ignoreDuplicates: true
    });

    const [fiscalYearResult] = await queryInterface.sequelize.query(
      `SELECT id FROM fiscal_years WHERE year = 2024 LIMIT 1`
    );
    const fiscalYearId = fiscalYearResult[0]?.id;

    // ============================================
    // 4. CRÉER COMPTES OHADA (si pas déjà présents)
    // ============================================
    
    const accountsData = [
      { number: '57', name: 'Caisse', type: 'ASSET' },
      { number: '521', name: 'Banque locale', type: 'ASSET' },
      { number: '24', name: 'Immobilisations', type: 'ASSET' },
      { number: '31', name: 'Stocks', type: 'ASSET' },
      { number: '411', name: 'Clients', type: 'ASSET' },
      { number: '401', name: 'Fournisseurs', type: 'LIABILITY' },
      { number: '701', name: 'Ventes de marchandises', type: 'REVENUE' },
      { number: '601', name: 'Achats de marchandises', type: 'EXPENSE' },
      { number: '6', name: 'Charges', type: 'EXPENSE' }
    ];

    for (const account of accountsData) {
      const [existingAccount] = await queryInterface.sequelize.query(
        `SELECT id FROM chart_of_accounts WHERE accountNumber = '${account.number}' LIMIT 1`
      );

      if (existingAccount.length === 0) {
        await queryInterface.sequelize.query(
          `INSERT INTO chart_of_accounts (companyId, accountNumber, accountName, accountType, level, isActive, createdAt, updatedAt) 
           VALUES ('${companyId}', '${account.number}', '${account.name}', '${account.type}', ${account.number.length}, true, NOW(), NOW())`
        );
      }
    }

    // Récupérer les IDs des comptes
    const [caisseAccount] = await queryInterface.sequelize.query(`SELECT id FROM chart_of_accounts WHERE accountNumber = '57' LIMIT 1`);
    const [banqueAccount] = await queryInterface.sequelize.query(`SELECT id FROM chart_of_accounts WHERE accountNumber = '521' LIMIT 1`);
    const [immobilisationsAccount] = await queryInterface.sequelize.query(`SELECT id FROM chart_of_accounts WHERE accountNumber = '24' LIMIT 1`);
    const [clientsAccount] = await queryInterface.sequelize.query(`SELECT id FROM chart_of_accounts WHERE accountNumber = '411' LIMIT 1`);
    const [fournisseursAccount] = await queryInterface.sequelize.query(`SELECT id FROM chart_of_accounts WHERE accountNumber = '401' LIMIT 1`);
    const [ventesAccount] = await queryInterface.sequelize.query(`SELECT id FROM chart_of_accounts WHERE accountNumber = '701' LIMIT 1`);
    const [achatsAccount] = await queryInterface.sequelize.query(`SELECT id FROM chart_of_accounts WHERE accountNumber = '601' LIMIT 1`);
    const [chargesAccount] = await queryInterface.sequelize.query(`SELECT id FROM chart_of_accounts WHERE accountNumber = '6' LIMIT 1`);

    const accountIds = {
      caisse: caisseAccount[0]?.id,
      banque: banqueAccount[0]?.id,
      immobilisations: immobilisationsAccount[0]?.id,
      clients: clientsAccount[0]?.id,
      fournisseurs: fournisseursAccount[0]?.id,
      ventes: ventesAccount[0]?.id,
      achats: achatsAccount[0]?.id,
      charges: chargesAccount[0]?.id
    };

    // ============================================
    // 5. CRÉER TEMPLATES D'OPÉRATIONS
    // ============================================
    
    const templates = [
      {
        operation_type: 'CAISSE',
        label: 'Vente au comptant',
        description: 'Vente de marchandise payée en espèces',
        example_use_case: 'Ex: Vente produit 50 000 FCFA en caisse',
        debit_account_id: accountIds.caisse,
        credit_account_id: accountIds.ventes,
        requires_third_party: false,
        requires_attachment: true,
        editable_by_accountant: true
      },
      {
        operation_type: 'CAISSE',
        label: 'Paiement fournisseur en espèces',
        description: 'Règlement fournisseur par caisse',
        example_use_case: 'Ex: Paiement facture fournisseur 30 000 FCFA',
        debit_account_id: accountIds.fournisseurs,
        credit_account_id: accountIds.caisse,
        requires_third_party: true,
        requires_attachment: true,
        editable_by_accountant: true
      },
      {
        operation_type: 'BANQUE',
        label: 'Virement bancaire reçu',
        description: 'Encaissement client par virement',
        example_use_case: 'Ex: Virement client 150 000 FCFA',
        debit_account_id: accountIds.banque,
        credit_account_id: accountIds.clients,
        requires_third_party: true,
        requires_attachment: true,
        editable_by_accountant: true
      },
      {
        operation_type: 'BANQUE',
        label: 'Paiement fournisseur par chèque',
        description: 'Règlement fournisseur par chèque bancaire',
        example_use_case: 'Ex: Chèque n°123456 pour 200 000 FCFA',
        debit_account_id: accountIds.fournisseurs,
        credit_account_id: accountIds.banque,
        requires_third_party: true,
        requires_attachment: true,
        editable_by_accountant: true
      },
      {
        operation_type: 'IMMO',
        label: 'Acquisition immobilisation',
        description: 'Achat d\'immobilisation (matériel, véhicule, etc.)',
        example_use_case: 'Ex: Achat ordinateur 500 000 FCFA',
        debit_account_id: accountIds.immobilisations,
        credit_account_id: accountIds.banque,
        requires_third_party: true,
        requires_attachment: true,
        editable_by_accountant: true
      },
      {
        operation_type: 'CREANCE',
        label: 'Vente à crédit',
        description: 'Vente avec paiement différé',
        example_use_case: 'Ex: Facture client à 30 jours',
        debit_account_id: accountIds.clients,
        credit_account_id: accountIds.ventes,
        requires_third_party: true,
        requires_attachment: true,
        editable_by_accountant: true
      },
      {
        operation_type: 'DETTE',
        label: 'Achat à crédit',
        description: 'Achat avec paiement différé',
        example_use_case: 'Ex: Facture fournisseur à 60 jours',
        debit_account_id: accountIds.achats,
        credit_account_id: accountIds.fournisseurs,
        requires_third_party: true,
        requires_attachment: true,
        editable_by_accountant: true
      }
    ];

    for (const template of templates) {
      await queryInterface.bulkInsert('operation_templates', [{
        ...template,
        active: true,
        created_by: comptableId,
        created_at: new Date(),
        updated_at: new Date()
      }], {
        ignoreDuplicates: true
      });
    }

    // ============================================
    // 6. CRÉER OPÉRATIONS DE DÉMONSTRATION
    // ============================================
    
    const operations = [
      {
        operation_type: 'CAISSE',
        label: 'Vente au comptant',
        description: 'Vente produit électronique',
        amount: 75000.00,
        operation_date: new Date('2024-06-15'),
        status: 'DRAFT'
      },
      {
        operation_type: 'BANQUE',
        label: 'Virement bancaire reçu',
        description: 'Paiement facture client ABC',
        amount: 250000.00,
        operation_date: new Date('2024-06-16'),
        status: 'PENDING_VALIDATION'
      },
      {
        operation_type: 'CAISSE',
        label: 'Paiement fournisseur en espèces',
        description: 'Règlement fournitures bureau',
        amount: 35000.00,
        operation_date: new Date('2024-06-17'),
        status: 'DRAFT'
      }
    ];

    for (const operation of operations) {
      await queryInterface.bulkInsert('business_operations', [{
        ...operation,
        currency_code: 'XOF',
        exchange_rate: 1.000000,
        fiscal_year_id: fiscalYearId,
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      }], {
        ignoreDuplicates: true
      });
    }

    console.log('\n✅ Données de démonstration créées avec succès!');
    console.log('\n📝 Comptes créés:');
    console.log('   - Comptable: comptable@spofe_v2_1-demo.local / Test@2024');
    console.log('   - Utilisateur: user@spofe_v2_1-demo.local / Test@2024');
    console.log('\n📊 Données créées:');
    console.log(`   - 1 exercice fiscal 2024`);
    console.log(`   - ${templates.length} templates d'opérations`);
    console.log(`   - ${operations.length} opérations de démonstration`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('business_operations', null, {});
    await queryInterface.bulkDelete('operation_templates', null, {});
    await queryInterface.bulkDelete('fiscal_years', null, {});
    await queryInterface.sequelize.query(`DELETE FROM users WHERE username IN ('comptable_demo', 'user_demo')`);
  }
};
