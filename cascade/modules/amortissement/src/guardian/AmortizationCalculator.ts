// src/guardian/AmortizationCalculator.ts

import { AmortizationMethod } from './types';

export interface AmortizationResult {
  monthlyDotation: number;
  totalAmortizable: number;
}

export class AmortizationCalculator {
  static compute(
    method: AmortizationMethod,
    acquisitionValue: number,
    residualValue: number,
    usefulLifeMonths: number
  ): AmortizationResult {
    const amortizable = acquisitionValue - residualValue;

    if (amortizable <= 0) {
      return { monthlyDotation: 0, totalAmortizable: 0 };
    }

    switch (method) {
      case 'LINEAR':
        return {
          monthlyDotation: amortizable / usefulLifeMonths,
          totalAmortizable: amortizable,
        };

      case 'DECLINING':
        // simplifié v1.0.0 : coefficient standard 1.25
        return {
          monthlyDotation: (amortizable / usefulLifeMonths) * 1.25,
          totalAmortizable: amortizable,
        };

      case 'EXCEPTIONAL':
        // dotation immédiate
        return {
          monthlyDotation: amortizable,
          totalAmortizable: amortizable,
        };

      case 'UNITS_OF_PRODUCTION':
        // calcul unitaire hors scope Guardian (quantités fournies ailleurs)
        return {
          monthlyDotation: 0,
          totalAmortizable: amortizable,
        };

      default:
        throw new Error('Unsupported amortization method');
    }
  }
}
