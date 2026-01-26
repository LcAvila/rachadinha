
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { COLORS } from '../../core/constants/constants';
import { formatCurrency } from '../../core/utils/formatCurrency';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../../domain/entities/Expense'; // Adjusted path

interface DashboardProps {
    toReceive: number;
    toPay: number;
    expenses: Expense[];
    onPress?: () => void;
}

const { width } = Dimensions.get('window');

export const Dashboard: React.FC<DashboardProps> = ({ toReceive, toPay, expenses, onPress }) => {
    const [collapsed, setCollapsed] = useState(false);

    // Simple calculations for stats
    const totalDraft = expenses.filter(e => e.status === 'draft').length;
    const totalWaiting = expenses.filter(e => e.status === 'waiting_payment').length;
    const totalPaid = expenses.filter(e => e.status === 'paid').length;

    // Bar chart percentages
    const totalFlow = toReceive + toPay;
    const receivePct = totalFlow > 0 ? (toReceive / totalFlow) * 100 : 0;
    const payPct = totalFlow > 0 ? (toPay / totalFlow) * 100 : 0;

    return (
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.headerTitleContainer}>
                    <Ionicons name="pie-chart" size={20} color={COLORS.primary} />
                    <Text style={styles.title}>Financeiro</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCollapsed(!collapsed)} style={styles.collapseButton}>
                    <Ionicons name={collapsed ? "chevron-down" : "chevron-up"} size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            {!collapsed && (
                <>

                    {/* Main Balance Row */}
                    <View style={styles.balanceRow}>
                        <View style={styles.balanceItem}>
                            <Text style={styles.label}>A Pagar</Text>
                            <Text style={[styles.amount, { color: COLORS.warning }]}>
                                {formatCurrency(toPay)}
                            </Text>
                        </View>
                        <View style={[styles.divider]} />
                        <View style={styles.balanceItem}>
                            <Text style={styles.label}>A Receber</Text>
                            <Text style={[styles.amount, { color: COLORS.success }]}>
                                {formatCurrency(toReceive)}
                            </Text>
                        </View>
                    </View>

                    {/* Graphic Bar */}
                    <View style={styles.chartContainer}>
                        <View style={[styles.barSegment, { flex: payPct || 1, backgroundColor: COLORS.warning + '80', borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }]} />
                        <View style={[styles.barSegment, { flex: receivePct || 1, backgroundColor: COLORS.success + '80', borderTopRightRadius: 8, borderBottomRightRadius: 8 }]} />
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <Text style={styles.statCount}>{totalDraft}</Text>
                            <Text style={styles.statLabel}>Rascunhos</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statCount}>{totalWaiting}</Text>
                            <Text style={styles.statLabel}>Pendentes</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statCount}>{totalPaid}</Text>
                            <Text style={styles.statLabel}>Pagos</Text>
                        </View>
                    </View>
                </>
            )}

        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    collapseButton: {
        padding: 4,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    balanceItem: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: '80%',
        backgroundColor: '#E2E8F0',
        alignSelf: 'center',
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    amount: {
        fontSize: 20,
        fontWeight: '900',
    },
    chartContainer: {
        flexDirection: 'row',
        height: 12,
        width: '100%',
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        marginBottom: 20,
        overflow: 'hidden',
    },
    barSegment: {
        height: '100%',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statCount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
});
