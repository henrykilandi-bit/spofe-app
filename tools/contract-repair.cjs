#!/usr/bin/env node

/**
 * SPOFE Contract Repair Tool
 * Fixes dependency asymmetries and missing contract sections
 */

const fs = require('fs');
const path = require('path');

const CASCADE_MODULES_PATH = 'c:/Users/henry/Desktop/SPOFE-APP VERS 1.0/cascade/modules';

// List all modules by scanning the directory
function listAllModules() {
    const modules = [];
    const moduleDirs = fs.readdirSync(CASCADE_MODULES_PATH);
    
    for (const dir of moduleDirs) {
        const fullPath = path.join(CASCADE_MODULES_PATH, dir);
        if (fs.statSync(fullPath).isDirectory() && !dir.startsWith('_')) {
            modules.push(dir);
        }
    }
    
    return modules;
}

// Read DEPENDENCIES.md file for a module
function readDependenciesFile(moduleName) {
    const filePath = path.join(CASCADE_MODULES_PATH, moduleName, 'contract', 'DEPENDENCIES.md');
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return fs.readFileSync(filePath, 'utf8');
}

// Parse dependencies from DEPENDENCIES.md content
function parseDependencies(content) {
    const result = {
        consumes: [],
        consumers: []
    };
    
    if (!content) return result;
    
    // Look for "consumes" section
    const consumesMatch = content.match(/##[^#]*consommés[^#]*?(\|.*?\|.*?\n(?:\|.*?\|.*?\n)*)/gims);
    if (consumesMatch) {
        for (const match of consumesMatch) {
            const lines = match.split('\n');
            for (const line of lines) {
                if (line.includes('|') && !line.includes('Module') && !line.includes('---')) {
                    const parts = line.split('|');
                    if (parts.length >= 2) {
                        const moduleName = parts[1].trim();
                        if (moduleName && moduleName !== '') {
                            result.consumes.push(moduleName);
                        }
                    }
                }
            }
        }
    }
    
    // Look for "consumers" section
    const consumersMatch = content.match(/##[^#]*consommateurs[^#]*?(\|.*?\|.*?\n(?:\|.*?\|.*?\n)*)/gims);
    if (consumersMatch) {
        for (const match of consumersMatch) {
            const lines = match.split('\n');
            for (const line of lines) {
                if (line.includes('|') && !line.includes('Module') && !line.includes('---')) {
                    const parts = line.split('|');
                    if (parts.length >= 2) {
                        const moduleName = parts[1].trim();
                        if (moduleName && moduleName !== '') {
                            result.consumers.push(moduleName);
                        }
                    }
                }
            }
        }
    }
    
    return result;
}

// Build dependency map across all modules
function buildDependencyMap() {
    const modules = listAllModules();
    const dependencyMap = {};
    
    console.log('📊 Building dependency map...');
    
    for (const moduleName of modules) {
        const content = readDependenciesFile(moduleName);
        const deps = parseDependencies(content);
        dependencyMap[moduleName] = deps;
        
        console.log(`  • ${moduleName}: consumes [${deps.consumes.join(', ')}], consumed by [${deps.consumers.join(', ')}]`);
    }
    
    return dependencyMap;
}

// Find asymmetric dependencies
function findAsymmetricDependencies(dependencyMap) {
    const asymmetries = [];
    
    console.log('\n🔍 Detecting asymmetric dependencies...');
    
    for (const [moduleName, deps] of Object.entries(dependencyMap)) {
        // Check if modules this module consumes also declare this module as consumer
        for (const consumedModule of deps.consumes) {
            if (dependencyMap[consumedModule] && !dependencyMap[consumedModule].consumers.includes(moduleName)) {
                asymmetries.push({
                    type: 'missing_consumer_declaration',
                    consumer: moduleName,
                    provider: consumedModule,
                    description: `${moduleName} consumes ${consumedModule} but ${consumedModule} doesn't declare ${moduleName} as consumer`
                });
            }
        }
        
        // Check if modules this module declares as consumers actually consume this module
        for (const consumerModule of deps.consumers) {
            if (dependencyMap[consumerModule] && !dependencyMap[consumerModule].consumes.includes(moduleName)) {
                asymmetries.push({
                    type: 'missing_consumption_declaration',
                    consumer: consumerModule,
                    provider: moduleName,
                    description: `${moduleName} declares ${consumerModule} as consumer but ${consumerModule} doesn't consume ${moduleName}`
                });
            }
        }
    }
    
    return asymmetries;
}

function main() {
    console.log('🔧 SPOFE Contract Repair Tool Starting...\n');
    
    const dependencyMap = buildDependencyMap();
    const asymmetries = findAsymmetricDependencies(dependencyMap);
    
    console.log(`\n❌ Found ${asymmetries.length} asymmetric dependencies:`);
    
    for (const asymmetry of asymmetries) {
        console.log(`  • ${asymmetry.description}`);
    }
    
    console.log('\n🔧 Contract repair tool completed analysis.');
    console.log('Manual fixes are still required for complex dependency corrections.');
}

if (require.main === module) {
    main();
}