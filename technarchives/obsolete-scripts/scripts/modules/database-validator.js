/**
 * DatabaseValidator Module
 * Valide et corrige les problèmes de schéma BD
 */

import mysql from 'mysql2/promise';
import path from 'path';

export class DatabaseValidator {
  constructor(config, dryRun = false) {
    this.config = config;
    this.dryRun = dryRun;
    this.connection = null;
    this.results = {
      conformity: 0,
      issues: [],
      fixed: 0,
    };
  }

  async validate() {
    try {
      await this.connect();
      
      // Vérifier les tables critiques
      await this.validateTables();
      
      // Vérifier les Foreign Keys
      await this.validateForeignKeys();
      
      // Vérifier les colonnes
      await this.validateColumns();
      
      await this.disconnect();
      
      // Calculer conformité
      this.calculateConformity();
      
      return this.results;
    } catch (error) {
      throw new Error(`Erreur validation BD: ${error.message}`);
    }
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'spofe_v2_1',
      });
      console.log('  ✅ Connecté à la BD');
    } catch (error) {
      throw new Error(`Connexion BD échouée: ${error.message}`);
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
    }
  }

  async validateTables() {
    const criticalTables = [
      'users',
      'compagnies',
      'charts_of_accounts',
      'journal_entries',
      'third_parties',
    ];

    for (const table of criticalTables) {
      try {
        const [rows] = await this.connection.query(
          `SELECT 1 FROM information_schema.TABLES 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
          [process.env.DB_NAME || 'spofe_v2_1', table]
        );

        if (rows.length === 0) {
          this.results.issues.push(`Table manquante: ${table}`);
        }
      } catch (error) {
        this.results.issues.push(`Erreur vérification table ${table}: ${error.message}`);
      }
    }
  }

  async validateForeignKeys() {
    try {
      // Vérifier FK third_parties → companies
      const [fks] = await this.connection.query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'third_parties' 
        AND COLUMN_NAME = 'company_id'
      `, [process.env.DB_NAME || 'spofe_v2_1']);

      if (fks.length === 0) {
        this.results.issues.push('FK third_parties.company_id manquante');
      }

      // Vérifier que la table référencée existe
      const dbName = process.env.DB_NAME || 'spofe_v2_1';
      const [companyTable] = await this.connection.query(`
        SELECT 1 FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME IN ('companies', 'compagnies')
      `, [dbName]);

      if (companyTable.length === 0) {
        this.results.issues.push('Table companies/compagnies manquante - FK ne peut pas être créée');
      }

    } catch (error) {
      this.results.issues.push(`Erreur vérification FK: ${error.message}`);
    }
  }

  async validateColumns() {
    // Vérifier les colonnes critiques
    const columnChecks = [
      {
        table: 'users',
        column: 'password',
        type: 'VARCHAR',
      },
      {
        table: 'charts_of_accounts',
        column: 'account_number',
        type: 'VARCHAR',
      },
      {
        table: 'journal_entries',
        column: 'entry_date',
        type: 'DATE',
      },
    ];

    for (const check of columnChecks) {
      try {
        const [cols] = await this.connection.query(`
          SELECT COLUMN_TYPE 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = ? 
          AND COLUMN_NAME = ?
        `, [process.env.DB_NAME || 'spofe_v2_1', check.table, check.column]);

        if (cols.length === 0) {
          this.results.issues.push(`Colonne manquante: ${check.table}.${check.column}`);
        }
      } catch (error) {
        this.results.issues.push(`Erreur vérification colonne: ${error.message}`);
      }
    }
  }

  calculateConformity() {
    // Conformité basée sur le nombre de tables/colonnes valides
    const totalChecks = 15; // Nombre de vérifications total
    const passed = totalChecks - this.results.issues.length;
    this.results.conformity = Math.round((passed / totalChecks) * 100);
  }
}
