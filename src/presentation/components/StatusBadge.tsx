import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants/constants';
import { ExpenseStatus } from '../../domain/entities/Expense';

interface StatusBadgeProps {
    status: ExpenseStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getConfig = (status: ExpenseStatus) => {
        switch (status) {
            case 'draft':
                return {
                    label: 'Rascunho',
                    color: '#718096',
                    bgColor: '#EDF2F7',
                    icon: 'create-outline' as const,
                };
            case 'waiting_payment':
                return {
                    label: 'Pendente',
                    color: '#D69E2E',
                    bgColor: '#FEFCBF',
                    icon: 'time-outline' as const,
                };
            case 'paid':
                return {
                    label: 'Pago',
                    color: '#38A169',
                    bgColor: '#C6F6D5',
                    icon: 'checkmark-circle-outline' as const,
                };
            default:
                return {
                    label: status,
                    color: '#718096',
                    bgColor: '#EDF2F7',
                    icon: 'help-circle-outline' as const,
                };
        }
    };

    const config = getConfig(status);

    return (
        <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon} size={14} color={config.color} style={styles.icon} />
            <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        alignSelf: 'flex-start',
    },
    icon: {
        marginRight: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});
