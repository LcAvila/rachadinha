/**
 * @file currencyInput.ts
 * Utilitários de formatação para campos de entrada monetária (TextInput).
 */

/**
 * Formata um valor numérico em string para o padrão de moeda brasileiro (R$).
 * Ideal para ser usado no evento onChangeText de inputs.
 * 
 * @param value - String contendo apenas números ou o valor bruto do input.
 * @returns String formatada como moeda (ex: "R$ 1.250,50").
 */
export const formatCurrencyInput = (value: string): string => {
    // Remove caracteres não numéricos
    const cleanValue = value.replace(/\D/g, '');

    // Se vazio, retorna string vazia
    if (!cleanValue) return '';

    // Converte para número e divide por 100 para tratar como centavos
    const numberValue = parseInt(cleanValue, 10) / 100;

    // Formata localmente para BRL
    return numberValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
};

/**
 * Converte a string de moeda formatada de volta para um valor numérico (double).
 * 
 * @param value - String de moeda formatada (ex: "R$ 10,00").
 * @returns Valor numérico correspondente (ex: 10.0).
 */
export const parseCurrencyInput = (value: string): number => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue ? parseInt(cleanValue, 10) / 100 : 0;
};
