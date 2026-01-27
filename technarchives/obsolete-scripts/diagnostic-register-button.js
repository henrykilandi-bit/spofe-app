#!/usr/bin/env node
/**
 * 🔍 DIAGNOSTIC COMPLET - Problème Bouton RegisterPage
 * Teste la connexion complète du formulaire RegisterPage-Extended
 */

const http = require('http');
const https = require('https');

console.log('🔍 DIAGNOSTIC SPOFE - Problème Bouton RegisterPage');
console.log('═'.repeat(60));

// Test 1: Vérifier si le backend est lancé
async function testBackendConnection() {
    console.log('\n✅ TEST 1: Connexion au Backend');
    console.log('-'.repeat(60));
    
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/health',
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ RÉSULTAT: Backend est LANCÉ sur http://localhost:3001');
                    console.log('📊 Statut HTTP:', res.statusCode);
                    try {
                        console.log('📦 Réponse:', JSON.stringify(JSON.parse(data), null, 2));
                    } catch {
                        console.log('📦 Réponse:', data);
                    }
                    resolve(true);
                } else {
                    console.log('⚠️  RÉSULTAT: Backend répond mais avec statut:', res.statusCode);
                    resolve(false);
                }
            });
        });

        req.on('error', (err) => {
            console.log('❌ RÉSULTAT: Backend N\'EST PAS LANCÉ');
            console.log('📝 Erreur:', err.message);
            console.log('💡 Solution: Lancez le backend avec: cd cascade && npm run dev');
            resolve(false);
        });

        req.on('timeout', () => {
            console.log('❌ RÉSULTAT: Backend TIMEOUT (pas de réponse)');
            resolve(false);
        });

        req.end();
    });
}

// Test 2: Vérifier la route /api/auth/register
async function testRegisterRoute() {
    console.log('\n✅ TEST 2: Vérifier la route /api/auth/register');
    console.log('-'.repeat(60));
    
    return new Promise((resolve) => {
        const payload = JSON.stringify({
            username: 'test_diagnostic',
            email: 'test_diagnostic@example.com',
            password: 'TestPass123!',
            prenom: 'Test',
            nom: 'Diagnostic',
            role: 'utilisateur'
        });

        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 10000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('✅ RÉSULTAT: Route /api/auth/register accessible');
                console.log('📊 Statut HTTP:', res.statusCode);
                console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));
                try {
                    const response = JSON.parse(data);
                    console.log('📦 Réponse:', JSON.stringify(response, null, 2));
                    
                    if (res.statusCode === 201) {
                        console.log('✅ Enregistrement réussi!');
                    } else if (res.statusCode === 400) {
                        console.log('⚠️  Erreur de validation');
                    }
                } catch {
                    console.log('📦 Réponse (texte):', data);
                }
                resolve(true);
            });
        });

        req.on('error', (err) => {
            console.log('❌ RÉSULTAT: Erreur lors de l\'appel /api/auth/register');
            console.log('📝 Erreur:', err.message);
            resolve(false);
        });

        req.on('timeout', () => {
            console.log('❌ RÉSULTAT: Route TIMEOUT');
            resolve(false);
        });

        req.write(payload);
        req.end();
    });
}

// Test 3: Vérifier les fichiers critiques
function testCriticalFiles() {
    console.log('\n✅ TEST 3: Vérifier les fichiers critiques');
    console.log('-'.repeat(60));
    
    const fs = require('fs');
    const path = require('path');

    const files = [
        'frontend/src/pages/RegisterPage-Extended.jsx',
        'cascade/src/controllers/auth.controller.js',
        'cascade/src/models/user.model.js',
        'cascade/src/routes/auth.routes.js',
        'cascade/.env',
        'frontend/.env.local'
    ];

    files.forEach(file => {
        const fullPath = path.join(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            console.log(`✅ ${file} - ${stats.size} bytes`);
        } else {
            console.log(`❌ ${file} - MANQUANT`);
        }
    });
}

// Test 4: Vérifier la configuration
function testConfiguration() {
    console.log('\n✅ TEST 4: Configuration du Backend');
    console.log('-'.repeat(60));
    
    const fs = require('fs');
    const path = require('path');

    const envPath = path.join(process.cwd(), 'cascade/.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        
        console.log('🔍 Variables d\'environnement backend:');
        lines.forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
                const [key] = line.split('=');
                if (key.includes('DB_') || key.includes('API') || key.includes('PORT')) {
                    console.log(`  ✅ ${key}`);
                }
            }
        });
    }

    const envLocalPath = path.join(process.cwd(), 'frontend/.env.local');
    if (fs.existsSync(envLocalPath)) {
        const content = fs.readFileSync(envLocalPath, 'utf8');
        console.log('\n🔍 Variables d\'environnement frontend:');
        console.log(`  ✅ VITE_API_URL=${content.split('=')[1].trim()}`);
    }
}

// Test 5: Vérifier la base de données
function testDatabase() {
    console.log('\n✅ TEST 5: Vérifier la Base de Données');
    console.log('-'.repeat(60));
    
    console.log('📝 Configuration MySQL attendue:');
    console.log('  - Host: localhost');
    console.log('  - Port: 3306');
    console.log('  - Database: spofe_v2_1');
    console.log('  - User: root');
    console.log('  - Password: (vide)');
    console.log('\n💡 Commandes de vérification:');
    console.log('  Windows (XAMPP): "C:\\xampp\\mysql\\bin\\mysql" -u root spofe_v2_1 -e "SHOW TABLES;"');
    console.log('  Linux/Mac: mysql -u root spofe_v2_1 -e "SHOW TABLES;"');
}

// Test 6: Résumé et Solutions
function printSummaryAndSolutions() {
    console.log('\n\n' + '═'.repeat(60));
    console.log('📋 RÉSUMÉ ET SOLUTIONS');
    console.log('═'.repeat(60));

    console.log('\n🔴 PROBLÈMES POSSIBLES:');
    console.log('1. Backend NOT lancé');
    console.log('2. VITE_API_URL incorrect ou manquant');
    console.log('3. Database pas accessible');
    console.log('4. Erreurs JavaScript dans le navigateur');
    console.log('5. CORS désactivé');

    console.log('\n✅ SOLUTIONS:');
    console.log('\n1️⃣  Lancer le Backend:');
    console.log('  cd cascade');
    console.log('  npm run dev');
    console.log('  ✓ Doit afficher: "Server running on http://localhost:3001"');

    console.log('\n2️⃣  Vérifier .env.local du Frontend:');
    console.log('  File: frontend/.env.local');
    console.log('  Content: VITE_API_URL=http://localhost:3001/api');

    console.log('\n3️⃣  Lancer le Frontend:');
    console.log('  cd frontend');
    console.log('  npm run dev');
    console.log('  ✓ Doit afficher: "Local: http://localhost:5173"');

    console.log('\n4️⃣  Vérifier la Console du Navigateur:');
    console.log('  F12 → Console → Chercher les erreurs rouges');
    console.log('  Erreurs courantes:');
    console.log('    - "Cannot POST /api/auth/register" → Backend pas lancé');
    console.log('    - "ERR_CONNECTION_REFUSED" → Backend pas lancé');
    console.log('    - "CORS error" → Vérifier CORS_ORIGIN dans .env');

    console.log('\n5️⃣  Vérifier la Base de Données:');
    console.log('  ✓ XAMPP MySQL doit être lancé');
    console.log('  ✓ Base "spofe_v2_1" doit exister');
    console.log('  ✓ Table "users" doit exister');

    console.log('\n6️⃣  Tester manuellement:');
    console.log('  curl -X POST http://localhost:3001/api/auth/register \\');
    console.log('    -H "Content-Type: application/json" \\');
    console.log('    -d \'{"username":"test","email":"test@test.com","password":"TestPass123!","prenom":"Test","nom":"User","role":"utilisateur"}\'');

    console.log('\n' + '═'.repeat(60));
}

// Exécuter tous les tests
async function runAllTests() {
    console.log('\n⏳ Exécution des tests...\n');
    
    const backendOk = await testBackendConnection();
    
    if (backendOk) {
        await testRegisterRoute();
    }
    
    testCriticalFiles();
    testConfiguration();
    testDatabase();
    printSummaryAndSolutions();
    
    console.log('\n✅ Diagnostic terminé');
}

runAllTests().catch(console.error);
