/**
 * Utilitários para aplicação de máscaras em campos de entrada
 */

/**
 * Aplica máscara de telefone no formato (XX) XXXX-XXXX para fixo ou (XX) XXXXX-XXXX para celular
 * @param value - Valor do input
 * @returns Valor formatado com a máscara
 */
export const applyPhoneMask = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos (2 para DDD + 9 para celular ou 8 para fixo)
  const limitedValue = numericValue.slice(0, 11);
  
  // Aplica a máscara baseada no número de dígitos
  if (limitedValue.length <= 2) {
    return limitedValue;
  } else if (limitedValue.length <= 6) {
    return `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2)}`;
  } else if (limitedValue.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2, 6)}-${limitedValue.slice(6)}`;
  } else {
    // Celular: (XX) XXXXX-XXXX
    return `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2, 7)}-${limitedValue.slice(7)}`;
  }
};

/**
 * Remove a máscara do telefone, retornando apenas os números
 * @param maskedValue - Valor com máscara
 * @returns Apenas os números
 */
export const removePhoneMask = (maskedValue: string): string => {
  return maskedValue.replace(/\D/g, '');
};

/**
 * Valida se o telefone está no formato correto (10 dígitos para fixo ou 11 para celular)
 * @param phone - Telefone com ou sem máscara
 * @returns true se válido, false caso contrário
 */
export const isValidPhone = (phone: string): boolean => {
  const numericPhone = removePhoneMask(phone);
  return numericPhone.length === 10 || numericPhone.length === 11;
};