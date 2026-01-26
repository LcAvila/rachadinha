
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../core/constants/constants';
import { ExpenseRepository } from '../../infrastructure/firebase/ExpenseRepository';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';
import { GetFinancialStatsUseCase, Period } from '../../application/usecases/stats/GetFinancialStatsUseCase';
import { PeriodSelector } from '../components/PeriodSelector';
import { SpendingChart } from '../components/SpendingChart';
import { formatCurrency } from '../../core/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';

export const FinancialScreen = () => {
    const [period, setPeriod] = useState<Period>('week');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null); // Use proper type

    const expenseRepo = new ExpenseRepository();
    const authRepo = new AuthRepository();
    const statsUseCase = new GetFinancialStatsUseCase(expenseRepo);

    const loadStats = useCallback(async () => {
        try {
            setLoading(true);
            const user = await authRepo.getCurrentUser();
            if (user) {
                const data = await statsUseCase.execute(user.id, period);
                setStats(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [loadStats])
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.title}>Financeiro</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} />}
            >
                <PeriodSelector current={period} onChange={setPeriod} />

                {stats && (
                    <>
                        <View style={styles.overviewCard}>
                            <Text style={styles.overviewLabel}>Total Gasto</Text>
                            <Text style={styles.overviewValue}>{formatCurrency(stats.totalSpent)}</Text>
                            <View style={styles.overviewRow}>
                                <Ionicons name="receipt-outline" size={16} color={COLORS.primary} />
                                <Text style={styles.overviewSub}>{stats.rachadinhaTotal} rachadinhas este período</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Evolução</Text>
                        <SpendingChart data={stats.chartData} />

                        <Text style={styles.sectionTitle}>Maiores Gastos</Text>
                        <View style={styles.topItemsList}>
                            {stats.topItems.map((item: any, index: number) => (
                                <View key={index} style={styles.topItem}>
                                    <View style={styles.topItemLeft}>
                                        <View style={styles.rankCircle}>
                                            <Text style={styles.rankText}>{index + 1}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemCount}>{item.count} vezes</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
                                </View>
                            ))}
                            {stats.topItems.length === 0 && (
                                <Text style={styles.emptyText}>Sem dados suficientes.</Text>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: '#FFF',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.text,
    },
    scrollContent: {
        padding: 20,
    },
    overviewCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    overviewLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    overviewValue: {
        color: '#FFF',
        fontSize: 36,
        fontWeight: '900',
        marginBottom: 16,
    },
    overviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    overviewSub: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 12,
        marginTop: 8,
    },
    topItemsList: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
    },
    topItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 12,
    },
    topItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rankCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        fontWeight: 'bold',
        color: COLORS.textSecondary,
    },
    itemName: {
        color: COLORS.text,
        fontWeight: '700',
        fontSize: 15,
    },
    itemCount: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    itemAmount: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    }
});
