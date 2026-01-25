export const formatCurrencyInput = (value: string): string => {
    // Remove non-numeric characters
    const cleanValue = value.replace(/\D/g, '');

    // If empty, return empty
    if (!cleanValue) return '';

    // Convert to number and divide by 100 to get cents
    const numberValue = parseInt(cleanValue, 10) / 100;

    // Format locally
    return numberValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
};

export const parseCurrencyInput = (value: string): number => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue ? parseInt(cleanValue, 10) / 100 : 0;
};
