# SILC v1.0 Contractual Linter — CI Enforcement Documentation

**Version:** 1.0.0  
**Release Date:** January 27, 2026  
**Type:** Automated CI/CD Enforcement Tool  
**Status:** ✅ Ready for Production  

---

## 🎯 What is the Contractual Linter?

The **SILC Contractual Linter** is a **stricter, more actionable enforcement layer** on top of the validator.

### Validator vs Linter

| Aspect | Validator | Linter |
|--------|-----------|--------|
| **Purpose** | Check contract compliance | Enforce contract in CI/CD |
| **Rules** | 5 rules (broad) | 40+ checks (detailed) |
| **Violations** | Simple list | Detailed actions |
| **PR Block** | No (advisory) | YES (mandatory) |
| **Strictness** | Standard | STRICT |
| **Use Case** | Local testing | CI/CD gates |

### Three Enforcement Levels

**LEVEL 1: CRITICAL VIOLATIONS** 🚨
- Auto-block PRs
- Require architecture review
- Examples: exposed password, missing DTOs, raw .toJSON()
- **Exit code:** 1 (FAIL)

**LEVEL 2: COMPLIANCE ISSUES** ⚠️
- Should fix before merge
- Warnings, not blocks
- Examples: missing DTO variants, missing config
- **Exit code:** 0 (WARN)

**LEVEL 3: QUALITY METRICS** 💡
- Nice to have
- Suggestions only
- Examples: missing tests, missing comments
- **Exit code:** 0 (OK)

---

## 🚀 Quick Start

### Run Linter
```bash
# Direct execution
node cascade/scripts/lint-contract.mjs

# Via npm
npm run lint:contract

# With detailed report
npm run lint:contract:report

# Both validator AND linter
npm run contract:check
```

### Expected Output
```
🚨 Critical Violations: 40
⚠️  Warnings:           26
💡 Suggestions:        10

📈 Linter Score: 0/100

❌ CONTRACT VIOLATIONS DETECTED
🚫 PR will be automatically blocked
📋 Fix violations above before re-pushing
```

---

## 📊 Current SPOFE Status (Jan 27, 2026)

**Baseline Linter Report:**
```
Critical Violations: 40
├─ 20 missing DTOs
├─ 18 raw .toJSON() calls
├─ 1 exposed password field
└─ 3 missing model configs

Warnings: 26
├─ 5 missing DTO variants
├─ 16 missing DTO checks
└─ 5 missing model configs

Suggestions: 10
├─ 7 missing unit tests
└─ 3 missing documentation

Score: 0/100
Status: ❌ FAIL (Auto-block enabled)
```

---

## 🔍 All 40+ Checks Explained

### LEVEL 1: CRITICAL CHECKS

#### Check 1.1: Forbidden Fields in DTOs
**What:** Detects password, token, apiKey, credit card, SSN in DTOs  
**Why:** These must NEVER be exposed in API responses  
**Action:** Remove field immediately  
**Example:**
```javascript
// ❌ WRONG
return {
  password: entity.password  // FAIL!
};

// ✅ RIGHT
return {
  // password intentionally omitted
};
```

#### Check 1.2: Raw .toJSON() Calls
**What:** Finds `.toJSON()` in controller responses  
**Why:** DTOs should handle transformation, not .toJSON()  
**Action:** Replace with DTO function  
**Current Violations:** 18 instances across 4 controllers  

#### Check 1.3: Missing DTOs for Models
**What:** Ensures all exposed models have DTOs  
**Why:** Every model needs a transformation contract  
**Action:** Create DTO file with 3 variants  
**Current Violations:** 20 missing DTOs

#### Check 1.4: Missing Model Configuration
**What:** Verifies `underscored: true` in model config  
**Why:** Required for snake_case → camelCase mapping  
**Action:** Add config to sequelize.define()  
**Current Violations:** 3 models

---

### LEVEL 2: COMPLIANCE WARNINGS

#### Check 2.1: Missing DTO Variants
**What:** Checks for standard, array, and minimal variants  
**Why:** Each variant serves different use cases  
**Current Warnings:** 26 instances

#### Check 2.2: Missing Timestamps
**What:** Verifies `timestamps: true` config  
**Why:** Needed for createdAt/updatedAt tracking  

#### Check 2.3: Suspicious Response Format
**What:** Checks for proper `{ success, data, meta }` structure  
**Why:** Standard API format enforcement  

---

### LEVEL 3: QUALITY SUGGESTIONS

#### Check 3.1: Missing Unit Tests
**What:** Checks for `.dto.test.js` files  
**Why:** DTOs should be tested  

#### Check 3.2: Missing Documentation
**What:** Looks for JSDoc or comments  
**Why:** Better code maintainability  

---

## 📝 How to Fix Violations

### Fix Type 1: Forbidden Fields (CRITICAL)

**Error:** `❌ CRITICAL: Forbidden field "password" exposed in DTO`

**File:** `cascade/src/dto/user.dto.js`

```javascript
// ❌ BEFORE
export function userDto(entity) {
  return {
    id: entity.id,
    username: entity.username,
    password: entity.password,  // ❌ FAIL!
    email: entity.email
  };
}

// ✅ AFTER
export function userDto(entity) {
  if (!entity) return null;
  return {
    id: entity.id,
    username: entity.username,
    email: entity.email
    // password removed ✅
  };
}
```

**Time:** 2 minutes per file

---

### Fix Type 2: Raw .toJSON() (CRITICAL)

**Error:** `❌ CRITICAL: Raw .toJSON() call detected`

**File:** `cascade/src/controllers/businessOperations.controller.js:76`

```javascript
// ❌ BEFORE
res.json(operation.toJSON());

// ✅ AFTER
import { businessOperationDto } from '../dto/index.js';
...
res.json(businessOperationDto(operation));
```

**Time:** 3 minutes per controller

---

### Fix Type 3: Missing DTOs (CRITICAL)

**Error:** `❌ CRITICAL: Missing DTO for exposed model`

**Create:** `cascade/src/dto/appSetting.dto.js`

```javascript
/**
 * AppSetting DTO
 */

export function appSettingDto(entity) {
  if (!entity) return null;
  return {
    id: entity.id,
    key: entity.key,
    value: entity.value,
    isSystem: entity.is_system,
    createdAt: entity.created_at?.toISOString()
  };
}

export function appSettingDtoArray(entities) {
  return entities?.map(appSettingDto) || [];
}

export function appSettingDtoMinimal(entity) {
  if (!entity) return null;
  return { id: entity.id, key: entity.key };
}
```

Then export in `cascade/src/dto/index.js`:
```javascript
export { 
  appSettingDto, 
  appSettingDtoArray, 
  appSettingDtoMinimal 
} from './appSetting.dto.js';
```

**Time:** 5 minutes per DTO

---

### Fix Type 4: Missing Model Config (CRITICAL)

**Error:** `❌ CRITICAL: Missing required config: underscored: true`

**File:** `cascade/src/models/passwordResetToken.model.js`

```javascript
// ❌ BEFORE
export default (sequelize) => {
  return sequelize.define('PasswordResetToken', {
    // ... attributes
  });
};

// ✅ AFTER
export default (sequelize) => {
  return sequelize.define('PasswordResetToken', 
    {
      // ... attributes
    },
    {
      underscored: true,      // ← ADD
      timestamps: true,       // ← ADD
      paranoid: true          // ← Optional
    }
  );
};
```

**Time:** 2 minutes per model

---

## 🎯 Roadmap to PASS

**Current Score:** 0/100 (40 critical violations)

### Priority 1: Fix Critical Issues (Day 1-2)
| Task | Count | Time | New Score |
|------|-------|------|-----------|
| Create 20 missing DTOs | 20 | 1.5h | +50% |
| Remove 18 .toJSON() calls | 18 | 1h | +25% |
| Remove password from user.dto | 1 | 5m | +2% |
| Add configs to 3 models | 3 | 10m | +2% |
| **SUBTOTAL** | **42** | **2.5h** | **79%** |

### Priority 2: Fix Warnings (Day 2-3)
| Task | Count | Time | New Score |
|------|-------|------|-----------|
| Add missing DTO variants | 26 | 1h | +15% |
| Add missing timestamps | 5 | 15m | +3% |
| Fix response formats | 5 | 30m | +3% |
| **SUBTOTAL** | **36** | **2h** | **100%** |

**Total Time to Pass:** ~4.5 hours

---

## 🔌 CI/CD Integration

### GitHub Actions
```yaml
name: SILC Contract Check

on: [push, pull_request]

jobs:
  contract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - name: Validate Contract
        run: npm run validate:silc
      - name: Lint Contract (CI)
        run: npm run lint:contract
        continue-on-error: false  # Block if fails
```

### GitLab CI
```yaml
contract-lint:
  stage: test
  script:
    - npm install
    - npm run validate:silc
    - npm run lint:contract
  artifacts:
    paths:
      - cascade/contract/reports/
    expire_in: 30 days
  allow_failure: false  # Block on failure
```

### Jenkins
```groovy
stage('SILC Contract') {
  steps {
    sh 'npm install'
    sh 'npm run validate:silc'
    sh 'npm run lint:contract'
  }
  post {
    always {
      archiveArtifacts 'cascade/contract/reports/**'
    }
    failure {
      error('SILC Contract validation failed')
    }
  }
}
```

---

## 📊 Report Format

**Location:** `cascade/contract/reports/silc-linter-report.json`

```json
{
  "metadata": {
    "tool": "SILC Contractual Linter",
    "version": "1.0.0",
    "contractVersion": "v1.0.0",
    "timestamp": "2026-01-27T14:05:20.000Z"
  },
  "enforcement": {
    "criticalViolations": 40,
    "warnings": 26,
    "suggestions": 10
  },
  "violations": [
    {
      "level": "CRITICAL",
      "file": "user.dto.js",
      "line": 51,
      "message": "❌ CRITICAL: Forbidden field \"password\" exposed in DTO",
      "detail": "This field should NEVER be returned in API responses.",
      "action": "REMOVE this field from the DTO immediately"
    }
  ],
  "warnings": [...],
  "suggestions": [...],
  "score": 0,
  "status": "FAIL"
}
```

---

## ⚙️ Configuration

**File:** `cascade/contract/linter.config.js`

```javascript
export default {
  linterName: 'SILC Contractual Linter',
  version: '1.0.0',

  enforcement: {
    critical: {
      enabled: true,
      blockPr: true,        // ← Auto-block on critical
      requireApproval: true
    },
    warning: {
      enabled: true,
      blockPr: false        // ← Warnings don't block
    },
    suggestion: {
      enabled: true,
      blockPr: false
    }
  },

  cicd: {
    enabled: true,
    minScore: 50,           // ← Minimum to pass
    autoBlock: true
  }
};
```

---

## 🚦 Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| `0` | ✅ Pass | PR can merge |
| `1` | ❌ Fail | PR blocked, must fix |

---

## 📈 Scoring System

**Max Score:** 100 points

**Deductions:**
- Critical violation: -50 points each
- Warning: -10 points each
- Suggestion: -5 points each

**Example:**
```
Starting: 100 points
- 40 critical violations: 100 - (40 × 50) = -1900 points (capped at 0)
- 26 warnings: 0 - (26 × 10) = -260 points (capped at 0)

Final Score: 0/100 (FAIL)
```

---

## 🔐 What's Blocked?

PRs will be **automatically blocked** if they contain:

❌ Forbidden fields (password, token, apiKey, etc.)  
❌ Raw .toJSON() in controllers  
❌ Models without DTOs  
❌ Missing `underscored: true` config  

All other violations (warnings, suggestions) can pass with review.

---

## 💡 Tips & Tricks

### Run Linter Before Pushing
```bash
# Before git push
npm run lint:contract

# If it fails, fix issues
npm run lint:contract:report

# Check detailed report
cat cascade/contract/reports/silc-linter-report.json
```

### Debug Specific File
```bash
# Find violations in specific file
cat cascade/contract/reports/silc-linter-report.json | grep "user.dto.js"
```

### Watch for Changes
```bash
# Run linter on file save (requires nodemon)
nodemon --ext js --exec "npm run lint:contract" cascade/src/dto
```

---

## 🚨 Common Errors & Fixes

### "Forbidden field password exposed"
👉 Remove password from DTO, never return it

### "Raw .toJSON() call detected"
👉 Replace with DTO function from index.js

### "Missing DTO for model"
👉 Create new DTO file with 3 variants

### "Missing required config: underscored: true"
👉 Add to model definition options

---

## ✅ Pre-Merge Checklist

- [ ] Run: `npm run lint:contract`
- [ ] Score > 0? (No critical violations)
- [ ] Review report: `npm run lint:contract:report`
- [ ] Fixed all critical issues?
- [ ] Addressed all warnings?
- [ ] Tests passing?
- [ ] Ready to commit/push

---

## 📚 Related Documentation

- [SILC_v1.0_SPOFE_INTER-LAYER_CONTRACT.md](../SILC_v1.0_SPOFE_INTER_LAYER_CONTRACT.md) — Official contract
- [SILC_VERSIONS.md](../SILC_VERSIONS.md) — Versioning & official status
- [SILC_v1.0_VALIDATOR_SUMMARY.md](../SILC_v1.0_VALIDATOR_SUMMARY.md) — Validator guide
- [cascade/contract/README.md](README.md) — Full validator docs

---

**SILC v1.0 Contractual Linter**  
Issued: January 27, 2026  
Status: ✅ Production Ready  
Enforcement: MANDATORY in CI/CD
