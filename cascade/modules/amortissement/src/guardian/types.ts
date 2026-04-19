// src/guardian/types.ts

export type AmortizationMethod =
  | 'LINEAR'
  | 'DECLINING'
  | 'EXCEPTIONAL'
  | 'UNITS_OF_PRODUCTION';

export type AmortizationCommandType =
  | 'CREATE_PLAN'
  | 'REVISE_PLAN'
  | 'STOP_PLAN';

export interface GuardianContext {
  tenantId: string;
  actorId: string;
}

export interface AssetSource {
  assetId: string;
  tenantId: string;
  acquisitionValue: number;
  inServiceDate: string; // ISO
  usefulLifeMonths: number;
  residualValue: number;
  allocations?: Array<{
    targetType: 'PRODUCT' | 'ACTIVITY' | 'PROJECT';
    targetId: string;
    ratio: number; // 0..1
  }>;
}

export interface AmortizationPlanCommand {
  commandId: string;
  commandType: AmortizationCommandType;
  tenantId: string;
  asset: AssetSource;
  method: AmortizationMethod;
  revision?: {
    usefulLifeMonths?: number;
    residualValue?: number;
  };
  effectiveDate: string; // ISO
}
