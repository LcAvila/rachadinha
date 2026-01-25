import { ExpenseItem } from '../../domain/entities/ExpenseItem';

export interface ProportionalCalculation {
    userId: string;
    userName: string;
    itemsSubtotal: number;
    proportionalDeliveryFee: number;
    proportionalServiceFee: number;
    proportionalDiscount: number;
    finalAmount: number;
    percentage: number;
}

export const calculateProportionalAmounts = (
    items: ExpenseItem[],
    deliveryFee: number,
    serviceFee: number,
    discount: number
): ProportionalCalculation[] => {
    // Group items by user and calculate subtotals
    const userSubtotals = new Map<string, { name: string; subtotal: number }>();

    items.forEach((item) => {
        const current = userSubtotals.get(item.userId) || { name: item.userName, subtotal: 0 };
        userSubtotals.set(item.userId, {
            name: item.userName,
            subtotal: current.subtotal + item.amount,
        });
    });

    // Calculate total of all items
    const totalItems = Array.from(userSubtotals.values()).reduce(
        (sum, user) => sum + user.subtotal,
        0
    );

    // If no items, return empty array
    if (totalItems === 0) {
        return [];
    }

    // Calculate proportional amounts for each user
    const calculations: ProportionalCalculation[] = [];

    userSubtotals.forEach((userData, userId) => {
        const percentage = userData.subtotal / totalItems;
        const proportionalDeliveryFee = deliveryFee * percentage;
        const proportionalServiceFee = serviceFee * percentage;
        const proportionalDiscount = discount * percentage;

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
            finalAmount: Math.max(0, finalAmount), // Ensure non-negative
            percentage: percentage * 100,
        });
    });

    return calculations;
};
