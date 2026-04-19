"use strict";
/**
 * Budget Query Controller - GET endpoints only
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 2
 * Principe: CQRS strict, Guardian non impliqué
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetQueryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const budget_query_repository_1 = require("../infrastructure/budget.query.repository");
const budget_projection_dto_1 = require("./dto/budget-projection.dto");
const budget_execution_dto_1 = require("./dto/budget-execution.dto");
const budget_variance_dto_1 = require("./dto/budget-variance.dto");
const budget_cumulative_dto_1 = require("./dto/budget-cumulative.dto");
const budget_alert_dto_1 = require("./dto/budget-alert.dto");
let BudgetQueryController = class BudgetQueryController {
    constructor(repo) {
        this.repo = repo;
    }
    async projection(req) {
        const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
        if (!tenantId) {
            throw new Error('TENANT_ID_REQUIRED');
        }
        return this.repo.projection(tenantId);
    }
    async execution(req) {
        const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
        if (!tenantId) {
            throw new Error('TENANT_ID_REQUIRED');
        }
        return this.repo.execution(tenantId);
    }
    async variance(req) {
        const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
        if (!tenantId) {
            throw new Error('TENANT_ID_REQUIRED');
        }
        return this.repo.variance(tenantId);
    }
    async cumulative(req) {
        const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
        if (!tenantId) {
            throw new Error('TENANT_ID_REQUIRED');
        }
        return this.repo.cumulative(tenantId);
    }
    async alerts(req) {
        const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
        if (!tenantId) {
            throw new Error('TENANT_ID_REQUIRED');
        }
        return this.repo.alerts(tenantId);
    }
};
exports.BudgetQueryController = BudgetQueryController;
__decorate([
    (0, common_1.Get)('/projection'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cashflow projections' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [budget_projection_dto_1.BudgetProjectionDTO] }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BudgetQueryController.prototype, "projection", null);
__decorate([
    (0, common_1.Get)('/execution'),
    (0, swagger_1.ApiOperation)({ summary: 'Get actual cashflow execution' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [budget_execution_dto_1.BudgetExecutionDTO] }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BudgetQueryController.prototype, "execution", null);
__decorate([
    (0, common_1.Get)('/variance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get budget variance (projected vs actual)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [budget_variance_dto_1.BudgetVarianceDTO] }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BudgetQueryController.prototype, "variance", null);
__decorate([
    (0, common_1.Get)('/cumulative'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cumulative cashflow projections' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [budget_cumulative_dto_1.BudgetCumulativeDTO] }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BudgetQueryController.prototype, "cumulative", null);
__decorate([
    (0, common_1.Get)('/alerts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get liquidity alerts' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [budget_alert_dto_1.BudgetAlertDTO] }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BudgetQueryController.prototype, "alerts", null);
exports.BudgetQueryController = BudgetQueryController = __decorate([
    (0, swagger_1.ApiTags)('Budget Queries'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('/api/budgets'),
    __metadata("design:paramtypes", [budget_query_repository_1.BudgetQueryRepository])
], BudgetQueryController);
//# sourceMappingURL=budget.query.controller.js.map