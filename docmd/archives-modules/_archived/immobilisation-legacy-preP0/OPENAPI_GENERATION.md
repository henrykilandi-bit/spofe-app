# 📘 OPENAPI_GENERATION.md — Module Immobilisation v1.0.0

## Génération Automatique OpenAPI depuis NestJS

**Module:** Immobilisation  
**Version:** 1.0.0  
**Conformité:** SPOFE Canonical Procedure

---

## 1. Principes SPOFE (Non Négociables)

| ❌ Interdit | ✅ Obligatoire |
|-------------|----------------|
| OpenAPI écrit à la main | OpenAPI généré depuis controllers |
| Divergence doc ↔ code | DTO = source unique de vérité |
| Patch manuel du spec | Swagger = outil de génération |
| Champs non documentés | Tous champs avec @ApiProperty |

---

## 2. Structure des Fichiers

```
cascade/modules/immobilisation/
├── api/
│   ├── controllers/
│   │   ├── immobilisation-read.controller.ts      # Principal (13 endpoints)
│   │   ├── immobilisation-cost-structure.controller.ts  # Contrats IMM-CS-*
│   │   ├── immobilisation-budget.controller.ts    # Contrats IMM-BUD-*
│   │   └── index.ts
│   ├── dto/
│   │   ├── response.dto.ts                        # DTOs réponse avec @ApiProperty
│   │   ├── query.dto.ts                           # DTOs query params
│   │   └── index.ts
│   ├── immobilisation.module.ts                   # Module NestJS
│   └── index.ts
├── openapi/
│   └── immobilisation.openapi.json                # Fichier contractuel généré
├── scripts/
│   ├── generate-openapi.ts                        # Validation
│   └── generate-openapi-from-nestjs.ts            # Génération
└── package.json
```

---

## 3. Commandes

```bash
# Valider le spec OpenAPI existant
npm run openapi:validate

# Vérifier la structure du module
npm run openapi:check

# Générer depuis NestJS (voir main.ts)
npm run openapi:from-nestjs
```

---

## 4. Configuration main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { ImmobilisationReadModule } from './cascade/modules/immobilisation/api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('SPOFE — Immobilisation API')
    .setDescription('Read-only API — Module Immobilisation v1.0.0')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'X-Tenant-Id', in: 'header' },
      'tenant'
    )
    .addTag('Immobilisation — Assets')
    .addTag('Immobilisation — Depreciation')
    .addTag('Immobilisation — Cost-Structure Contract')
    .addTag('Immobilisation — Budget Contract')
    .addTag('Immobilisation — Maintenance')
    .addTag('Immobilisation — Renewals')
    .addTag('Immobilisation — Disposals')
    .addTag('Immobilisation — KPI')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [ImmobilisationReadModule],
  });
  
  // Swagger UI
  SwaggerModule.setup('docs/immobilisation', app, document);
  
  // Export JSON
  writeFileSync(
    'cascade/modules/immobilisation/openapi/immobilisation.openapi.json',
    JSON.stringify(document, null, 2)
  );
  
  await app.listen(3000);
}
```

---

## 5. DTOs — Source de Vérité

### Response DTO Example

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssetListItemDTO {
  @ApiProperty({ example: 'asset-001' })
  assetId: string;

  @ApiProperty({ example: 12000000 })
  acquisitionCost: number;

  @ApiProperty({ example: 'XAF' })
  currency: string;

  @ApiProperty({ example: '2024-01-01' })
  acquisitionDate: string;

  @ApiProperty({ example: 60 })
  usefulLifeMonths: number;

  @ApiProperty({ example: 'LINEAR' })
  depreciationMethod: string;

  @ApiProperty({ example: 'IN_SERVICE', enum: ['IN_SERVICE', 'DISPOSED', 'SCRAPPED'] })
  status: string;

  @ApiPropertyOptional({ example: '2029-01-01' })
  renewalDate?: string;
}
```

### Query DTO Example

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AssetListQueryDTO {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['IN_SERVICE', 'DISPOSED', 'SCRAPPED'] })
  @IsOptional()
  @IsEnum(['IN_SERVICE', 'DISPOSED', 'SCRAPPED'])
  status?: string;
}
```

---

## 6. Controller — Annoté Swagger

```typescript
import { Controller, Get, Query, Headers, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Immobilisation — Assets')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Tenant-Id', required: true })
@Controller('/api/immobilisation')
export class ImmobilisationReadController {

  @Get('/assets')
  @ApiOperation({ 
    summary: 'Liste des immobilisations',
    description: 'Read-model: rm_assets_current'
  })
  @ApiResponse({ status: 200, description: 'Liste paginée des actifs' })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async listAssets(
    @Headers() headers: Record<string, string>,
    @Query() query: AssetListQueryDTO,
  ): Promise<PaginatedResponse<AssetListItemDTO>> {
    // ...
  }

  @Get('/assets/:assetId')
  @ApiOperation({ summary: 'Détail d\'une immobilisation' })
  @ApiParam({ name: 'assetId', description: 'ID de l\'actif' })
  @ApiResponse({ status: 200, description: 'Détail de l\'actif' })
  @ApiResponse({ status: 404, description: 'Actif non trouvé' })
  async getAssetDetail(
    @Headers() headers: Record<string, string>,
    @Param('assetId') assetId: string,
  ): Promise<AssetDetailDTO> {
    // ...
  }
}
```

---

## 7. Endpoints Contractuels

### Cost-Structure (IMM-CS-*)

| Contrat | Endpoint | Description |
|---------|----------|-------------|
| IMM-CS-DEP-01 | `GET /depreciation/summary` | Dotations par période |
| IMM-CS-DEP-02 | `GET /depreciation/cost-structure-export` | Dotations ventilées |
| IMM-CS-ALL-01 | `GET /allocations` | Affectations effectives |
| IMM-CS-MNT-01 | `GET /maintenance/summary` | Coûts maintenance par actif |
| IMM-CS-MNT-02 | `GET /maintenance/by-period` | Coûts maintenance par période |

### Budget (IMM-BUD-*)

| Contrat | Endpoint | Description |
|---------|----------|-------------|
| IMM-BUD-REN-01 | `GET /renewals` | Projections CAPEX |
| IMM-BUD-REN-02 | `GET /budget/renewals/by-year` | CAPEX par année |
| IMM-BUD-MNT-01 | `GET /maintenance/summary` | Coûts OPEX |
| IMM-BUD-DEP-01 | `GET /budget/depreciation` | Dotations budgétées |

---

## 8. Checklist Conformité

- [x] Tous les endpoints GET sont documentés
- [x] Tous les DTOs ont `@ApiProperty`
- [x] Header `X-Tenant-Id` obligatoire
- [x] Aucun endpoint write exposé
- [x] OpenAPI versionné (1.0.0)
- [x] Tags contractuels définis
- [x] Mapping read-models documenté
- [x] Réponses d'erreur standardisées

---

## 9. Fichier OpenAPI Généré

📄 **Emplacement:** `openapi/immobilisation.openapi.json`

**Statistiques:**
- 23 paths
- 23 GET endpoints (CQRS compliant)
- 35 schemas
- 8 tags dont 2 contractuels

**Validation:**
```bash
npm run openapi:validate

# Output:
# ✅ OpenAPI specification validated successfully!
# 📄 File: openapi/immobilisation.openapi.json
# 📊 Paths: 23
# 📦 Schemas: 35
# 🏷️  Version: 1.0.0
```

---

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-02-01 | Génération initiale OpenAPI |

---

**Signature:** Module Immobilisation — OpenAPI Generation v1.0.0  
**Conformité:** SPOFE Canonical Procedure  
**Artefact:** `openapi/immobilisation.openapi.json`
