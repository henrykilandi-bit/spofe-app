# Guide de Migration Jest → Vitest

## 🔄 Changements Requis dans les Tests

### 1. Imports

```diff
- import { jest } from '@jest/globals';
+ import { vi } from 'vitest';
```

### 2. Mocks

```diff
- jest.fn()
+ vi.fn()

- jest.mock('module')
+ vi.mock('module')

- jest.spyOn(obj, 'method')
+ vi.spyOn(obj, 'method')

- jest.clearAllMocks()
+ vi.clearAllMocks()
```

### 3. Timers

```diff
- jest.useFakeTimers()
+ vi.useFakeTimers()

- jest.advanceTimersByTime(1000)
+ vi.advanceTimersByTime(1000)
```

### 4. Matchers (identiques)

Ces matchers fonctionnent **sans changement**:

```javascript
✅ expect(value).toBe(expected)
✅ expect(value).toEqual(expected)
✅ expect(value).toBeDefined()
✅ expect(value).toBeNull()
✅ expect(fn).toHaveBeenCalled()
✅ expect(fn).toHaveBeenCalledWith(args)
✅ expect(promise).resolves.toBe(value)
✅ expect(promise).rejects.toThrow()
```

## 📝 Exemple de Migration

### AVANT (Jest)

```javascript
import { jest } from '@jest/globals';
import { User } from '../src/models/user.model.js';

jest.mock('../src/models/user.model.js');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create user', async () => {
    const mockCreate = jest.fn().mockResolvedValue({ id: 1 });
    User.create = mockCreate;

    const result = await createUser({ username: 'test' });
    
    expect(mockCreate).toHaveBeenCalled();
    expect(result.id).toBe(1);
  });
});
```

### APRÈS (Vitest)

```javascript
import { vi } from 'vitest';
import { User } from '../src/models/user.model.js';

vi.mock('../src/models/user.model.js');

describe('Auth Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create user', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: 1 });
    User.create = mockCreate;

    const result = await createUser({ username: 'test' });
    
    expect(mockCreate).toHaveBeenCalled();
    expect(result.id).toBe(1);
  });
});
```

**Changement: Seulement les imports `jest` → `vi`!**

## 🔧 Configuration Setup File

Le fichier `tests/setup.js` charge automatiquement les mocks globaux:

```javascript
import { vi } from 'vitest';

// Mocks disponibles dans TOUS les tests
vi.mock('../src/config/database.js', () => ({
  sequelize: {
    authenticate: vi.fn().mockResolvedValue(true)
  }
}));

afterEach(() => vi.clearAllMocks());
```

## ✅ Tests Existants Compatibles

Si tes tests n'utilisent pas `jest.fn()` explicitement, ils fonctionnent **sans modification**:

```javascript
// ✅ Compatible Jest & Vitest
describe('Math', () => {
  it('adds numbers', () => {
    expect(1 + 1).toBe(2);
  });
});
```

## 🚀 Nouvelles Fonctionnalités Vitest

### 1. Inline Snapshots

```javascript
it('renders component', () => {
  const html = render(<Button />);
  expect(html).toMatchInlineSnapshot(`"<button>Click</button>"`);
});
```

### 2. Concurrent Tests

```javascript
describe.concurrent('Parallel tests', () => {
  it('test 1', async () => { /* ... */ });
  it('test 2', async () => { /* ... */ });
  // S'exécutent en parallèle!
});
```

### 3. UI Mode

```bash
npm run test:ui
# Ouvre interface graphique dans le navigateur
```

### 4. Retry Tests

```javascript
it('flaky test', { retry: 3 }, () => {
  // Réessaie jusqu'à 3 fois si échec
});
```

## 📊 Coverage Configuration

`vitest.config.js` déjà configuré avec:

```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80
  }
}
```

Générer coverage:
```bash
npm run test:coverage
open coverage/index.html
```

## 🎯 Checklist Migration

- [ ] Remplacer tous les `jest` par `vi` dans les imports
- [ ] Remplacer `jest.fn()` par `vi.fn()`
- [ ] Remplacer `jest.mock()` par `vi.mock()`
- [ ] Vérifier que `tests/setup.js` est référencé dans vitest.config.js
- [ ] Lancer `npm run test` pour valider
- [ ] Générer coverage pour vérifier tout fonctionne

## 🔗 Ressources

- [Vitest API Reference](https://vitest.dev/api/)
- [Migration from Jest](https://vitest.dev/guide/migration.html)
- [Mocking](https://vitest.dev/guide/mocking.html)
