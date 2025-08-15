import { FieldValidation } from '@/lib/types';

// Validaciones específicas
export function validateExpedienteCatastral(expediente?: string): FieldValidation {
  if (!expediente || expediente === "NO_CONSTA" || expediente.trim() === "") return { valido: false, confianza: 0, message: "Campo requerido o formato incorrecto." };
  const regex = /^\d{2}-\d{3}-\d{3}$|^\d{10}$/;
  const isValid = regex.test(expediente.replace(/\s/g, ''));
  return {
    valido: isValid,
    confianza: isValid ? 95 : 60,
    message: isValid ? null : "Formato: XX-XXX-XXX o 10 dígitos."
  };
}

export function validateCURP(curp?: string): FieldValidation {
  if (!curp || curp === "NO_CONSTA" || curp.trim() === "") return { valido: false, confianza: 0, message: "Campo requerido o formato incorrecto." };
  const regex = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]\d[A-Z]\d$/;
  const isValid = regex.test(curp);
  return {
    valido: isValid,
    confianza: isValid ? 98 : 70,
    message: isValid ? null : "Formato CURP inválido (18 caracteres)."
  };
}

export function validateFecha(fecha?: string): FieldValidation {
  if (!fecha || fecha === "NO_CONSTA" || fecha.trim() === "") return { valido: false, confianza: 0, message: "Campo requerido o formato incorrecto." };
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(fecha)) return { valido: false, confianza: 50, message: "Formato de fecha inválido (DD/MM/AAAA)." };
  const [dia, mes, anio] = fecha.split('/').map(Number);
  const fechaObj = new Date(anio, mes - 1, dia);
  const isValid = fechaObj.getFullYear() === anio &&
    fechaObj.getMonth() === mes - 1 &&
    fechaObj.getDate() === dia;
  return { valido: isValid, confianza: isValid ? 95 : 60, message: isValid ? null : "Fecha inválida." };
}

export function validateSuperficie(superficie?: string): FieldValidation {
  if (!superficie || superficie === "NO_CONSTA" || superficie.trim() === "") return { valido: false, confianza: 0, message: "Campo requerido o formato incorrecto." };
  const regex = /^\d+(\.\d+)?\s*(M²|m²|hectáreas|Ha)$/i;
  const isValid = regex.test(superficie);
  return {
    valido: isValid,
    confianza: isValid ? 90 : 70,
    message: isValid ? null : "Formato de superficie inválido (ej. '250.00 M²')."
  };
}
