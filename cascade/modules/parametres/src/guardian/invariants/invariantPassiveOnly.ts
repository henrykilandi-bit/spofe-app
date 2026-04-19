import { GuardianViolation } from '../../shared/errors';
import { ParametersFrame } from '../types/ParametersFrame';

export function invariantPassiveOnly(
  frame: ParametersFrame
): void {
  const valuesToInspect = [
    frame.identityContext.legalName,
    ...frame.rolesCatalog.roles.flatMap((role) => [role.roleCode, role.label]),
    ...frame.monetaryContext.taxRates.map((rate) => rate.taxCode),
  ].map(value => value.toUpperCase());

  if (
    valuesToInspect.some(
      value =>
        value.includes('IF ') ||
        value.includes('IF_') ||
        value.includes('_THEN') ||
        value.includes(' THEN') ||
        value.includes('WHEN ')
    )
  ) {
    throw new GuardianViolation('G-P03: Logique conditionnelle détectée');
  }

  if (
    valuesToInspect.some(
      value =>
        value.includes('CALCULATED') ||
        value.includes('CALCULATE') ||
        value.includes('FORMULA') ||
        value.includes('AUTO')
    )
  ) {
    throw new GuardianViolation('G-P03: Automatisme détecté');
  }

  if (
    frame.documentsCatalog.documentTypes.some((doc) => {
      const code = doc.documentTypeCode.toUpperCase();
      return code.includes('REALTIME') || code.includes('SCHEDULED');
    })
  ) {
    throw new GuardianViolation('G-P03: Comportement temporel détecté');
  }
}
