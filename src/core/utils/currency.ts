/**
 * Formata um valor numérico ou string para o formato de moeda BRL (R$ X.XXX,XX).
 * @param value Valor a ser formatado.
 * @returns String formatada.
 */
export const formatCurrency = (value: string | number): string => {
    if (typeof value === 'number') {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }

    const rawValue = value;
    // Remove tudo que não é dígito
    const numbers = rawValue.replace(/\D/g, '');

    // Se vazio, retorna 0,00
    if (!numbers) return '0,00';

    // Converte para número e divide por 100 para ter os centavos
    const amount = parseInt(numbers, 10) / 100;

    // Formata usando Intl
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
};

/**
 * Converte uma string formatada em moeda (pt-BR) para number.
 * @param value String formatada (ex: "1.234,56").
 * @returns Número float.
 */
export const parseCurrency = (value: string): number => {
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue);
};
