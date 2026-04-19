"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G10_NoFinancialLogic = void 0;
const GuardianError_1 = require("../GuardianError");
const FORBIDDEN_FIELDS = [
    'amount',
    'balance',
    'dueDate',
    'credit',
    'debit',
    'provision'
];
class G10_NoFinancialLogic {
    validate(ctx) {
        for (const key of Object.keys(ctx.document.payload)) {
            if (FORBIDDEN_FIELDS.includes(key)) {
                throw new GuardianError_1.GuardianError('G10_FINANCIAL_FIELD_DETECTED', `Financial field detected: ${key}`);
            }
        }
    }
}
exports.G10_NoFinancialLogic = G10_NoFinancialLogic;
