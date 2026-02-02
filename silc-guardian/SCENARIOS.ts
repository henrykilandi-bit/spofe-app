/**
 * 🎬 Scénarios de démonstration SILC Guardian
 * Exemples de violations et leur détection
 */

// ❌ SCÉNARIO 1 : Entité mal nommée
// File: src/domain/entities/AdminUser.entity.ts
export class AdminUser {
  name: string;
  role: string;
}
// ❌ VIOLATION: Mot interdit "Admin" — Article 5
// ✅ CORRECTION: Renommer en User.entity.ts

// ❌ SCÉNARIO 2 : Entité mal placée
// File: src/models/Company.entity.ts
export class Company {
  name: string;
}
// ❌ VIOLATION: Entité hors de domain/entities — Article 8
// ✅ CORRECTION: Déplacer à src/domain/entities/Company.entity.ts

// ❌ SCÉNARIO 3 : Service qui décide
// File: src/application/services/ApprovalService.ts
export class ApprovalService {
  approve(request: Request): boolean {
    // Logique décisionnaire (INTERDITE)
    return request.status === "pending";
  }
}
// ❌ VIOLATION: Service décisionnaire — Article 6 (AST)
// ✅ CORRECTION: Extraire logique dans CompanyApproval.process.ts

// ❌ SCÉNARIO 4 : Relation mal nommée
// File: src/domain/relations/userRole.relation.ts
export class userRole {
  userId: string;
  roleId: string;
}
// ⚠️ WARNING: PascalCase requis — Article 7
// ✅ CORRECTION: Renommer en UserRole.relation.ts

// ❌ SCÉNARIO 5 : DTO avec mot d'action
// File: src/application/dtos/ApproveUserDto.ts
export class ApproveUserDto {
  userId: string;
}
// ❌ VIOLATION: Mot "Approve" dans DTO — Article 9
// ✅ CORRECTION: Renommer en UpdateUserDto.ts

// ❌ SCÉNARIO 6 : Repository mal placé
// File: src/application/repositories/UserRepository.ts
export class UserRepository {
  find(id: string) { }
}
// ❌ VIOLATION: Repository hors de infrastructure — Article 10
// ✅ CORRECTION: Déplacer à src/infrastructure/repositories/UserRepository.ts

// ✅ SCÉNARIO 7 : Structure parfaitement conforme SILC v2

// src/domain/entities/User.entity.ts
export class User {
  id: string;
  email: string;
  roles: Role[] = [];
}

// src/domain/entities/Role.entity.ts
export class Role {
  id: string;
  name: string; // Contrat: Role ✅
}

// src/domain/relations/UserRole.relation.ts
export class UserRole {
  userId: string;
  roleId: string;
}

// src/domain/processes/UserOnboarding.process.ts
export class UserOnboarding {
  execute(user: User): void {
    // Gouvernement métier (BLOQUANT si violé)
    user.roles = [];
    // Logique de gouvernement
  }
}

// src/application/dtos/UserDto.ts
export class UserDto {
  id: string;
  email: string;
}

// src/application/services/UserService.ts
export class UserService {
  // Orchestration UNIQUEMENT (pas de décision)
  async createUser(dto: UserDto): Promise<User> {
    const user = new User();
    // Appeler processus pour gouvernement
    new UserOnboarding().execute(user);
    return user;
  }
}

// src/infrastructure/repositories/UserRepository.ts
export class UserRepository {
  // Accès données UNIQUEMENT
  async findById(id: string): Promise<User> {
    // Query database
    return null!;
  }
}

// ✅ RÉSULTAT: Zéro violation — SILC COMPLIANT
// architecture/compliance/SILC_COMPLIANCE.json généré
// Merge autorisé ✅

/**
 * 📊 TABLEAU COMPARATIF
 * 
 * Violation Type      | Détection   | Bloquant? | Article
 * ─────────────────────────────────────────────────────
 * Mot interdit        | Lexique     | OUI       | 5
 * Entité mal placée   | Structurel  | OUI       | 8
 * Service décisionnaire| AST         | OUI       | 6
 * Relation camelCase  | Structurel  | NON       | 7
 * DTO avec action     | Lexique     | OUI       | 9
 * Repository mal lieu | Structurel  | OUI       | 10
 * Entity qui agit     | AST         | OUI       | 5
 */
