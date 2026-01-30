import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Expense, ExpenseStatus } from '../../domain/entities/Expense';
import { COLORS } from '../../core/constants/constants';
import { formatCurrency } from '../../core/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from './StatusBadge';
import { ScaleButton } from './ScaleButton';
import Animated, { FadeInDown } from 'react-native-reanimated';

/**
 * Interface para as propriedades do componente ExpenseCard.
 */
interface ExpenseCardProps {
    /** Objeto da despesa contendo detalhes como título, valor e status */
    expense: Expense;
    /** Função executada ao clicar no card */
    onPress: () => void;
    /** Índice do card na lista para animação escalonada */
    index?: number;
}

/**
 * @component ExpenseCard
 * Representação visual de uma despesa em listas (ex: Home ou Pendências).
 * Exibe um ícone representativo do status, título, valor total calculado,
 * contagem de itens e um badge indicativo de estado.
 */
export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onPress, index = 0 }) => {
    /**
     * Retorna a cor principal associada ao status atual da despesa.
     */
    const getStatusColor = (status: ExpenseStatus) => {
        switch (status) {
            case 'draft': return COLORS.textSecondary;
            case 'waiting_payment': return COLORS.warning;
            case 'paid': return COLORS.success;
            default: return COLORS.primary;
        }
    };

    // Cálculos de valor total considerando taxas e descontos
    const itemsTotal = expense.items ? expense.items.reduce((acc, i) => acc + i.amount, 0) : 0;
    const currentTotal = itemsTotal + (expense.deliveryFee || 0) + (expense.serviceFee || 0) - (expense.discount || 0);

    return (
        <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
            <ScaleButton onPress={onPress} style={styles.expenseCard}>
                {/* Ícone de Status à esquerda */}
                <View style={[styles.cardIcon, { backgroundColor: getStatusColor(expense.status) + '15' }]}>
                    <Ionicons
                        name={expense.status === 'draft' ? "document-text-outline" : expense.status === 'paid' ? "checkmark-done-circle" : "hourglass-outline"}
                        size={26}
                        color={getStatusColor(expense.status)}
                    />
                </View>

                {/* Informações Centrais */}
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{expense.title}</Text>
                    <View style={styles.cardStatusRow}>
                        <View style={styles.cardDetails}>
                            <Text style={styles.cardAmount}>
                                {formatCurrency(currentTotal)}
                            </Text>
                            <Text style={styles.cardItemCount}>{expense.items?.length || 0} itens</Text>
                        </View>
                        {/* Badge de Status à direita do valor */}
                        <StatusBadge status={expense.status} />
                    </View>
                </View>

                {/* Setinha indicativa de clique */}
                <View style={styles.cardArrow}>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
                </View>
            </ScaleButton>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    expenseCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)'
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 6,
    },
    cardStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    cardDetails: {
        gap: 2,
    },
    cardItemCount: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    cardArrow: {
        marginLeft: 8,
    },
});
