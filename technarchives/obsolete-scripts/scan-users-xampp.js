#!/usr/bin/env node

/**
 * Script de scan des utilisateurs dans XAMPP
 * Scanne la base de données spofe_v2_1 pour identifier tous les utilisateurs
 */

const mysql = require('mysql2/promise');
const path = require('path');

// Configuration de la connexion MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // XAMPP par défaut n'a pas de password
  database: 'spofe_v2_1',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
};

async function scanUsers() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║            SCAN DES UTILISATEURS - BASE XAMPP                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  let connection;

  try {
    // Connexion à la base de données
    console.log('🔌 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connecté à spofe_v2_1\n');

    // 1. Compter les utilisateurs
    console.log('📊 STATISTIQUES UTILISATEURS');
    console.log('─'.repeat(64));

    const [[countResult]] = await connection.execute(
      'SELECT COUNT(*) as total FROM users'
    );
    console.log(`Total d'utilisateurs: ${countResult.total}\n`);

    // 2. Lister tous les utilisateurs
    console.log('👥 LISTE DES UTILISATEURS');
    console.log('─'.repeat(64));

    const [users] = await connection.execute(
      `SELECT 
        id,
        username,
        email,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      ORDER BY id ASC`
    );

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé\n');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Actif: ${user.is_active ? '✅' : '❌'}`);
        console.log(`   Créé: ${new Date(user.created_at).toLocaleString('fr-FR')}`);
        console.log(`   Modifié: ${new Date(user.updated_at).toLocaleString('fr-FR')}`);
      });
    }

    // 3. Compter par rôle
    console.log('\n\n📋 RÉPARTITION PAR RÔLE');
    console.log('─'.repeat(64));

    const [roleStats] = await connection.execute(
      `SELECT 
        role,
        COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC`
    );

    roleStats.forEach(stat => {
      console.log(`  ${stat.role}: ${stat.count} utilisateur(s)`);
    });

    // 4. Vérifier les super utilisateurs
    console.log('\n\n🔐 SUPER UTILISATEURS');
    console.log('─'.repeat(64));

    const [superUsers] = await connection.execute(
      `SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        gsu.role as super_role,
        gsu.permissions
      FROM users u
      LEFT JOIN groupe_super_users gsu ON u.id = gsu.user_id
      WHERE u.role = 'admin' OR gsu.id IS NOT NULL
      ORDER BY u.id ASC`
    );

    if (superUsers.length === 0) {
      console.log('❌ Aucun super utilisateur trouvé\n');
    } else {
      superUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.username} (${user.email})`);
        console.log(`   Rôle: ${user.role}`);
        if (user.super_role) {
          console.log(`   Super-rôle: ${user.super_role}`);
          if (user.permissions) {
            console.log(`   Permissions: ${user.permissions}`);
          }
        }
      });
    }

    // 5. Utilisateurs actifs/inactifs
    console.log('\n\n🔄 STATUT D\'ACTIVATION');
    console.log('─'.repeat(64));

    const [activeStats] = await connection.execute(
      `SELECT 
        is_active,
        COUNT(*) as count
      FROM users
      GROUP BY is_active`
    );

    activeStats.forEach(stat => {
      const status = stat.is_active ? '✅ Actifs' : '❌ Inactifs';
      console.log(`  ${status}: ${stat.count}`);
    });

    // 6. Approbations en attente
    console.log('\n\n⏳ APPROBATIONS EN ATTENTE');
    console.log('─'.repeat(64));

    try {
      const [pendingApprovals] = await connection.execute(
        `SELECT 
          id,
          email,
          prenom,
          nom,
          username,
          status,
          created_at
        FROM pending_approvals
        WHERE status = 'pending'
        ORDER BY created_at DESC`
      );

      if (pendingApprovals.length === 0) {
        console.log('✅ Aucune approbation en attente\n');
      } else {
        console.log(`Nombre en attente: ${pendingApprovals.length}\n`);
        pendingApprovals.forEach((approval, index) => {
          console.log(`${index + 1}. ${approval.email}`);
          console.log(`   Nom: ${approval.prenom} ${approval.nom}`);
          console.log(`   Username: ${approval.username}`);
          console.log(`   Statut: ${approval.status}`);
          console.log(`   Demandé: ${new Date(approval.created_at).toLocaleString('fr-FR')}\n`);
        });
      }
    } catch (err) {
      console.log('⚠️  Table pending_approvals non trouvée\n');
    }

    // 7. Résumé final
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                      RÉSUMÉ DU SCAN                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Total utilisateurs: ${users.length}`);
    console.log(`✅ Actifs: ${users.filter(u => u.is_active).length}`);
    console.log(`❌ Inactifs: ${users.filter(u => !u.is_active).length}`);

    const adminCount = users.filter(u => u.role === 'admin').length;
    console.log(`🔐 Administrateurs: ${adminCount}`);

    console.log('\n✅ Scan terminé avec succès');

  } catch (error) {
    console.error('\n❌ ERREUR:');
    console.error(`   ${error.message}`);
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('\n⚠️  La connexion MySQL a été perdue');
      console.error('   Vérifiez que XAMPP est lancé et MySQL est actif');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Erreur d\'authentification');
      console.error('   Vérifiez l\'utilisateur MySQL (root) et le password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n⚠️  Base de données non trouvée: spofe_v2_1');
      console.error('   Vérifiez que la base est créée dans XAMPP');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

// Lancer le scan
scanUsers().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
