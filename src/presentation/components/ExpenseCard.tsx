import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense } from '../../domain/entities/Expense';
import { COLORS } from '../../core/constants/constants';
import { formatCurrency } from '../../core/utils/formatCurrency';

interface ExpenseCardProps {
    expense: Expense;
    onPress: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <Text style={styles.title}>{expense.title}</Text>
                <View style={[styles.badge, expense.status === 'draft' ? styles.draft : styles.finalized]}>
                    <Text style={styles.badgeText}>
                        {expense.status === 'draft' ? 'Rascunho' : 'Finalizada'}
                    </Text>
                </View>
            </View>

            <Text style={styles.date}>
                {new Date(expense.createdAt).toLocaleDateString('pt-BR')}
            </Text>

            <View style={styles.footer}>
                <Text style={styles.owner}>Por: {expense.createdByName}</Text>
                {/* We assume total amount is calculated/updated or sum of items? 
            Currently Expense entity has totalAmount property. 
            If it's static we display it. */}
                <Text style={styles.amount}>
                    {/* If draft, maybe show '...' or sum items? For now relying on prop */}
                    Itens: {expense.items?.length || 0}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
    date: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 12 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    owner: { color: COLORS.primary, fontWeight: '600' },
    amount: { color: COLORS.text, fontWeight: 'bold' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    draft: { backgroundColor: COLORS.warning },
    finalized: { backgroundColor: COLORS.success },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
});
