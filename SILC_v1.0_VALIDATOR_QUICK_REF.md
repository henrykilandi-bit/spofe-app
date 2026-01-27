# SILC v1.0 Validator — Quick Reference Card

## ⚡ TL;DR (30 seconds)

```bash
# Run validator
npm run validate:silc

# Check report
npm run validate:silc:report

# Score = 100%? ✅ All good
# Score < 100%? ❌ Fix violations
```

---

## 📊 Current Status (Jan 27, 2026)

```
Score: 40/100
Violations: 25
Warnings: 26
Status: NEED FIXES
```

---

## 🎯 5 Validation Rules

| Rule | Status | Violations | Fix Time |
|------|--------|-----------|----------|
| 1️⃣ DB ↔ Model | ❌ FAIL | 3 models missing `underscored: true` | 15 min |
| 2️⃣ Model ↔ DTO | ❌ FAIL | 20 missing DTOs | 2-3 hours |
| 3️⃣ camelCase | ✅ PASS | None | — |
| 4️⃣ Security | ❌ FAIL | password exposed in user.dto | 10 min |
| 5️⃣ Null Safety | ✅ PASS | None | — |

**Priority:** Fix Rule 2 (20 DTOs), Rule 1 (3 models), Rule 4 (1 field)

---

## 🔧 How to Fix Each Violation Type

### Type 1: "Missing underscored: true"
**Affected models:** tokenBlacklist, passwordResetToken, twoFactorAuth

```javascript
// ❌ Wrong
sequelize.define('Model', { ... })

// ✅ Right
sequelize.define('Model', { ... }, { underscored: true, ... })
```

**Time:** 5 minutes per model × 3 = 15 minutes

---

### Type 2: "Missing DTO for model"
**Affected models:** 20 models (appSetting, businessOperation, compagnie, etc.)

```javascript
// Create file: cascade/src/dto/modelname.dto.js

export function modelnameDto(entity) {
  if (!entity) return null;
  return {
    id: entity.id,
    // ... map fields from snake_case to camelCase
  };
}

export function modelnameDtoArray(entities) {
  return entities?.map(modelnameDto) || [];
}

export function modelnameDtoMinimal(entity) {
  if (!entity) return null;
  return { id: entity.id, name: entity.name };
}
```

**Time:** 5 minutes per DTO × 20 = 100 minutes (1h 40min)

**Then:** Export in `cascade/src/dto/index.js`

---

### Type 3: "exposes forbidden field: password"
**File:** cascade/src/dto/user.dto.js

```javascript
// ❌ Wrong
return {
  password: entity.password,  // ❌ NEVER!
};

// ✅ Right
return {
  // password intentionally omitted
};
```

**Time:** 2 minutes

---

## 📝 Files You Need to Know

| File | Purpose | Edit? |
|------|---------|-------|
| `cascade/contract/silc-validator.js` | Main engine | ❌ No |
| `cascade/contract/silc.config.js` | Configuration | ✅ Yes (if needed) |
| `cascade/contract/rules/` | Validation rules | ❌ No |
| `cascade/scripts/validate-contract.mjs` | Entry point | ❌ No |
| `cascade/src/dto/` | **You create/fix these** | ✅ YES |
| `cascade/src/models/` | **You fix config here** | ✅ YES |

---

## 🎯 Roadmap to 100%

```
TODAY (Jan 27)
└─ Run: npm run validate:silc
   └─ Score: 40/100

TOMORROW (Jan 28)
├─ Task 1: Fix 3 models (add underscored: true)
│  └─ Time: 15 min
│  └─ New score: 50/100
├─ Task 2: Create 10-15 DTOs
│  └─ Time: 1-2 hours
│  └─ New score: 70/100
└─ Run: npm run validate:silc

DAY 3 (Jan 29)
├─ Task 3: Create remaining DTOs (5)
│  └─ Time: 30 min
│  └─ New score: 95/100
├─ Task 4: Fix user.dto.js (remove password)
│  └─ Time: 5 min
│  └─ New score: 98/100
├─ Task 5: Fix remaining warnings
│  └─ Time: 30 min
│  └─ New score: 100/100
└─ Run: npm run validate:silc → ✅ PASS

DEPLOYMENT
└─ Add to CI/CD pipeline
└─ Commit & push
└─ All PRs must pass validation
```

---

## 🚨 Critical Rules (Never Break)

### ❌ NEVER do this:

1. **Expose raw Sequelize objects**
   ```javascript
   res.json(user);  // ❌ WRONG
   res.json(userDto(user));  // ✅ RIGHT
   ```

2. **Use snake_case in API responses**
   ```javascript
   { user_id: 1 }  // ❌ WRONG
   { userId: 1 }   // ✅ RIGHT
   ```

3. **Expose sensitive fields**
   ```javascript
   { password: '...' }    // ❌ WRONG
   { username: '...' }    // ✅ RIGHT
   ```

4. **Skip null checks in DTOs**
   ```javascript
   // ❌ WRONG
   export function userDto(entity) {
     return { id: entity.id };  // Crashes if entity is null
   }

   // ✅ RIGHT
   export function userDto(entity) {
     if (!entity) return null;
     return { id: entity.id };
   }
   ```

5. **Add models without DTOs**
   ```javascript
   // ❌ WRONG
   // Create model but no DTO → validation fails

   // ✅ RIGHT
   // Create model AND DTO → validation passes
   ```

---

## 📊 Understanding Scores

| Score | Meaning | Action |
|-------|---------|--------|
| 100% | 🎉 Perfect | Ready to deploy, all rules pass |
| 80-99% | ⚠️ Good | Minor fixes, then ready to deploy |
| 60-79% | ⚠️ Warning | Significant work, don't merge yet |
| 40-59% | ❌ Critical | Major violations, needs fixes |
| <40% | 🚫 Failed | Halt development, multiple critical issues |

**Current: 40%** = Do not deploy yet, but fixable in 2-3 hours

---

## 🎮 Command Reference

| Command | What it does | When to use |
|---------|-------------|-----------|
| `npm run validate:silc` | Run all checks, show summary | Every commit |
| `npm run validate:silc:report` | Show full JSON report | Debug violations |
| `node cascade/scripts/validate-contract.mjs` | Direct execution | CI/CD pipelines |

**Exit codes:**
- `0` = Success (all rules pass)
- `1` = Failure (violations detected)

---

## 🐛 Debugging Tips

### Where do I find violations?
```bash
npm run validate:silc
# Look at console output above ❌
```

### What is the full report?
```bash
npm run validate:silc:report
# Or: cat cascade/contract/reports/silc-validation.json
```

### Why did Rule 2 fail?
```bash
# Rule 2 = "Model ↔ DTO Mapping"
# Check: Are all models in cascade/src/models/ matched by cascade/src/dto/?
# Example: appSetting.model.js needs appSetting.dto.js
```

### Why did Rule 4 fail?
```bash
# Rule 4 = "Security Fields"
# Check: Does your DTO expose password, token, apiKey, etc?
# These must be removed: password, token, secret, creditCard, ssn
```

---

## ✅ Pre-Deployment Checklist

- [ ] `npm run validate:silc` returns score = 100%
- [ ] No violations in console output
- [ ] `cascade/contract/reports/silc-validation.json` shows all rules = passed
- [ ] All 5 rules passed
- [ ] All warnings resolved
- [ ] All DTOs created and exported
- [ ] All sensitive fields removed
- [ ] Code review passed
- [ ] Tests passing
- [ ] Ready to commit

---

## 📞 Getting Help

1. **Check the report:** `npm run validate:silc:report`
2. **Read the docs:** `cascade/contract/README.md`
3. **Check config:** `cascade/contract/silc.config.js`
4. **Review rules:** `cascade/contract/rules/`
5. **Ask:** Team lead or architect

---

**SILC v1.0 Validator Quick Reference**  
Est. Jan 27, 2026 | Updated: Jan 27, 2026
