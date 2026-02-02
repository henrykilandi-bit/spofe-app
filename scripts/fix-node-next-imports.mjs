#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const ROOT_DIR = process.argv[2] || 'cascade/modules/cost-structure'

const TS_IMPORT_REGEX =
  /from\s+['"](\.{1,2}\/[^'"]+?)['"]/g

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(fullPath)
    if (entry.isFile() && entry.name.endsWith('.ts')) return [fullPath]
    return []
  })
}

function fixImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  const updated = content.replace(TS_IMPORT_REGEX, (match, importPath) => {
    if (
      importPath.endsWith('.js') ||
      importPath.endsWith('.json')
    ) {
      return match
    }

    changed = true
    return match.replace(importPath, `${importPath}.js`)
  })

  if (changed) {
    fs.writeFileSync(filePath, updated)
    console.log(`✔ fixed: ${filePath}`)
  }
}

console.log(`🔧 Fixing NodeNext imports in: ${ROOT_DIR}`)
walk(ROOT_DIR).forEach(fixImports)
console.log('✅ Done')
