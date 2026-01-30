/**
 * @file formatCurrency.ts
 * Utilitário de formatação de exibição de moeda.
 */

/**
 * Formata um valor numérico (number) para exibição formatada em Real Brasileiro (BRL).
 * 
 * @param value - O valor numérico a ser formatado.
 * @returns String formatada (ex: "R$ 150,00").
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};
