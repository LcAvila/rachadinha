import { ExpenseItem } from '../../domain/entities/ExpenseItem';

/**
 * @interface ProportionalCalculation
 * Resultado do cálculo proporcional para um usuário na despesa.
 */
export interface ProportionalCalculation {
    /**
     * ID do usuário.
     */
    userId: string;
    /**
     * Nome do usuário.
     */
    userName: string;
    /**
     * Total bruto dos itens consumidos pelo usuário.
     */
    itemsSubtotal: number;
    /**
     * Valor da taxa de entrega proporcional ao consumo do usuário.
     */
    proportionalDeliveryFee: number;
    /**
     * Valor da taxa de serviço proporcional ao consumo do usuário.
     */
    proportionalServiceFee: number;
    /**
     * Valor do desconto proporcional ao consumo do usuário.
     */
    proportionalDiscount: number;
    /**
     * Valor final que o usuário deve pagar (Subtotal + Taxas - Descontos).
     */
    finalAmount: number;
    /**
     * Porcentagem do total da despesa representada por este usuário (0 a 100).
     */
    percentage: number;
}

/**
 * Calcula os valores proporcionais de uma despesa para cada participante.
 * Baseia-se no consumo individual (itens) para dividir taxas e descontos proporcionalmente.
 * 
 * @param items Lista de itens da despesa.
 * @param deliveryFee Valor total da taxa de entrega.
 * @param serviceFee Valor total da taxa de serviço.
 * @param discount Valor total do desconto.
 * @returns Array com o cálculo detalhado para cada participante.
 */
export const calculateProportionalAmounts = (
    items: ExpenseItem[],
    deliveryFee: number,
    serviceFee: number,
    discount: number
): ProportionalCalculation[] => {
    // Agrupa itens por usuário e calcula subtotais
    const userSubtotals = new Map<string, { name: string; subtotal: number }>();

    items.forEach((item) => {
        // Trata itens de usuário único (legado)
        if (item.userId && (!item.assignedTo || item.assignedTo.length === 0)) {
            const current = userSubtotals.get(item.userId) || { name: item.userName || 'Desconhecido', subtotal: 0 };
            userSubtotals.set(item.userId, {
                name: current.name,
                subtotal: current.subtotal + item.amount,
            });
            return;
        }

        // Trata novos itens multi-usuário (divididos entre várias pessoas)
        if (item.assignedTo && item.assignedTo.length > 0) {
            // O valor do item é dividido igualmente entre os atribuídos
            const amountPerPerson = item.amount / item.assignedTo.length;

            item.assignedTo.forEach(assignee => {
                const current = userSubtotals.get(assignee.userId) || { name: assignee.userName, subtotal: 0 };
                userSubtotals.set(assignee.userId, {
                    name: current.name,
                    subtotal: current.subtotal + amountPerPerson,
                });
            });
        }
    });

    // Calcula o total da soma dos itens (consumo bruto total)
    const totalItems = Array.from(userSubtotals.values()).reduce(
        (sum, user) => sum + user.subtotal,
        0
    );

    // Se não houver itens ou valor total for zero, retorna array vazio
    if (totalItems === 0) {
        return [];
    }

    // Calcula os valores proporcionais para cada usuário
    const calculations: ProportionalCalculation[] = [];

    userSubtotals.forEach((userData, userId) => {
        // Porcentagem de participação do usuário no total dos itens
        const percentage = userData.subtotal / totalItems;

        // Aplica a porcentagem às taxas e descontos
        const proportionalDeliveryFee = deliveryFee * percentage;
        const proportionalServiceFee = serviceFee * percentage;
        const proportionalDiscount = discount * percentage;

        // Valor Final = Subtotal + Taxas Proporcionais - Desconto Proporcional
        const finalAmount =
            userData.subtotal +
            proportionalDeliveryFee +
            proportionalServiceFee -
            proportionalDiscount;

        calculations.push({
            userId,
            userName: userData.name,
            itemsSubtotal: userData.subtotal,
            proportionalDeliveryFee,
            proportionalServiceFee,
            proportionalDiscount,
            finalAmount: Math.max(0, finalAmount), // Garante que não seja negativo
            percentage: percentage * 100,
        });
    });

    return calculations;
};
