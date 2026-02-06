import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../core/constants/constants';
import { ExpenseRepository } from '../../infrastructure/firebase/ExpenseRepository';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';
import { GetFinancialStatsUseCase, Period } from '../../application/usecases/stats/GetFinancialStatsUseCase';
import { PeriodSelector } from '../components/PeriodSelector';
import { SpendingChart } from '../components/SpendingChart';
import { formatCurrency } from '../../core/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * @component FinancialScreen
 * Tela de relatórios financeiros detalhados.
 * Exibe o total gasto, gráficos de evolução, ranking de gastos e interações com outros usuários.
 * Permite filtrar por Semana, Mês ou Ano.
 */
export const FinancialScreen = () => {
    // Estados
    const [period, setPeriod] = useState<Period>('week');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const insets = useSafeAreaInsets();

    // Dependências
    const expenseRepo = new ExpenseRepository();
    const authRepo = new AuthRepository();
    const statsUseCase = new GetFinancialStatsUseCase(expenseRepo);

    /**
     * Carrega as estatísticas financeiras com base no período selecionado.
     */
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

    const renderPeriodLabel = () => {
        switch (period) {
            case 'week': return 'Esta Semana';
            case 'month': return 'Este Mês';
            case 'year': return 'Este Ano';
            default: return 'Filtro';
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

            {/* Cabeçalho com Filtro Discreto */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Text style={styles.screenTitle}>Relatório</Text>

                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setIsFilterVisible(!isFilterVisible)}
                >
                    <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.filterButtonText}>{renderPeriodLabel()}</Text>
                    <Ionicons name="chevron-down" size={12} color={COLORS.primary} />
                </TouchableOpacity>

                {isFilterVisible && (
                    <Animated.View entering={FadeInDown.duration(200)} style={styles.filterDropdown}>
                        <TouchableOpacity style={styles.filterItem} onPress={() => { setPeriod('week'); setIsFilterVisible(false); }}>
                            <Text style={[styles.filterText, period === 'week' && styles.filterTextActive]}>Semana</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.filterItem} onPress={() => { setPeriod('month'); setIsFilterVisible(false); }}>
                            <Text style={[styles.filterText, period === 'month' && styles.filterTextActive]}>Mês</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.filterItem} onPress={() => { setPeriod('year'); setIsFilterVisible(false); }}>
                            <Text style={[styles.filterText, period === 'year' && styles.filterTextActive]}>Ano</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} colors={[COLORS.primary]} />}
                showsVerticalScrollIndicator={false}
            >
                {stats && (
                    <>
                        {/* Cartão de Visão Geral */}
                        <Animated.View entering={FadeInDown.delay(100).springify()}>
                            <LinearGradient
                                colors={[COLORS.primary, '#10B981', '#059669']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.overviewCard}
                            >
                                {/* Elementos decorativos de fundo */}
                                <View style={styles.decorativeCircle1} />
                                <View style={styles.decorativeCircle2} />

                                <View style={styles.overviewHeader}>
                                    <View>
                                        <Text style={styles.overviewLabel}>Total Gasto</Text>
                                        <Text style={styles.overviewPeriod}>{renderPeriodLabel()}</Text>
                                    </View>
                                    <View style={styles.iconBadge}>
                                        <Ionicons name="wallet" size={20} color="#FFF" />
                                    </View>
                                </View>

                                <Text style={styles.overviewValue}>{formatCurrency(stats.totalSpent)}</Text>

                                <View style={styles.overviewFooter}>
                                    <View style={styles.overviewRow}>
                                        <Ionicons name="receipt" size={16} color="rgba(255,255,255,0.9)" />
                                        <Text style={styles.overviewSub}>{stats.rachadinhaTotal} rachadinhas</Text>
                                    </View>
                                    <View style={styles.trendBadge}>
                                        <Ionicons name="trending-up" size={12} color="#10B981" />
                                    </View>
                                </View>
                            </LinearGradient>
                        </Animated.View>

                        {/* Gráfico de Evolução */}
                        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.chartContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Evolução</Text>
                                <Ionicons name="trending-up" size={20} color={COLORS.primary} />
                            </View>
                            <SpendingChart data={stats.chartData} />
                        </Animated.View>

                        {/* Ranking de Maiores Gastos */}
                        <Animated.View entering={FadeInDown.delay(300).springify()}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Maiores Gastos</Text>
                            </View>
                            <View style={styles.topItemsList}>
                                {stats.topItems.map((item: any, index: number) => (
                                    <View key={index} style={styles.topItem}>
                                        <View style={styles.topItemLeft}>
                                            <View style={[styles.rankCircle, index === 0 && styles.goldRank, index === 1 && styles.silverRank, index === 2 && styles.bronzeRank]}>
                                                <Text style={[styles.rankText, index < 3 && { color: '#FFF' }]}>{index + 1}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                                                <Text style={styles.itemCount}>{item.count} vezes</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
                                    </View>
                                ))}
                                {stats.topItems.length === 0 && (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>Sem dados suficientes.</Text>
                                    </View>
                                )}
                            </View>
                        </Animated.View>

                        {/* Ranking de Interações */}
                        <Animated.View entering={FadeInDown.delay(400).springify()}>
                            <Text style={styles.sectionTitle}>Interações Principais</Text>

                            <View style={styles.balanceRow}>
                                {/* Coluna: Quem mais me pagou (quem me deveu) */}
                                <View style={styles.balanceColumn}>
                                    <Text style={styles.subSectionTitle}>Quem realizou mais pagamentos para mim</Text>
                                    {stats.toPayByPerson.slice(0, 3).map((person: any, index: number) => (
                                        <View key={`pay-${index}`} style={styles.miniPersonCard}>
                                            <View style={[styles.miniAvatar, { backgroundColor: '#FEF3C7' }]}>
                                                <Text style={[styles.miniAvatarText, { color: '#D97706' }]}>{index + 1}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.miniPersonName} numberOfLines={1}>{person.userName}</Text>
                                                <Text style={styles.miniAmountError}>-{formatCurrency(person.amount)}</Text>
                                            </View>
                                        </View>
                                    ))}
                                    {stats.toPayByPerson.length === 0 && <Text style={styles.emptyMiniText}>Ninguém.</Text>}
                                </View>

                                {/* Coluna: Para quem mais paguei (quem paguei por eles) */}
                                <View style={styles.balanceColumn}>
                                    <Text style={styles.subSectionTitle}>Quem recebeu mais pagamentos de mim</Text>
                                    {stats.toReceiveByPerson.slice(0, 3).map((person: any, index: number) => (
                                        <View key={`receive-${index}`} style={styles.miniPersonCard}>
                                            <View style={[styles.miniAvatar, { backgroundColor: '#D1FAE5' }]}>
                                                <Text style={[styles.miniAvatarText, { color: '#059669' }]}>{index + 1}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.miniPersonName} numberOfLines={1}>{person.userName}</Text>
                                                <Text style={styles.miniAmountSuccess}>+{formatCurrency(person.amount)}</Text>
                                            </View>
                                        </View>
                                    ))}
                                    {stats.toReceiveByPerson.length === 0 && <Text style={styles.emptyMiniText}>Ninguém.</Text>}
                                </View>
                            </View>
                        </Animated.View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        paddingBottom: 12,
        paddingHorizontal: 24,
        backgroundColor: COLORS.background,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '10',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    filterButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    filterDropdown: {
        position: 'absolute',
        top: 60,
        right: 24,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        minWidth: 120,
    },
    filterItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    filterText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    filterTextActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 24,
        paddingTop: 8,
    },
    overviewCard: {
        borderRadius: 28,
        padding: 28,
        marginBottom: 32,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    decorativeCircle1: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -50,
        right: -30,
    },
    decorativeCircle2: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: -20,
        left: -20,
    },
    overviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        zIndex: 1,
    },
    overviewLabel: {
        color: 'rgba(255,255,255,0.95)',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    overviewPeriod: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    iconBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 16,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    overviewValue: {
        color: '#FFF',
        fontSize: 48,
        fontWeight: '900',
        marginBottom: 20,
        letterSpacing: -2,
        zIndex: 1,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    overviewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1,
    },
    overviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    overviewSub: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
    },
    trendBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 6,
    },
    chartContainer: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 16,
    },
    topItemsList: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 8,
        paddingVertical: 12,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    topItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    topItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        paddingRight: 8,
    },
    rankCircle: {
        width: 32,
        height: 32,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    goldRank: { backgroundColor: '#F59E0B' },
    silverRank: { backgroundColor: '#94A3B8' },
    bronzeRank: { backgroundColor: '#B45309' },
    rankText: {
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    itemName: {
        color: COLORS.text,
        fontWeight: '700',
        fontSize: 15,
    },
    itemCount: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    itemAmount: {
        color: COLORS.primary,
        fontWeight: '800',
        fontSize: 15,
    },
    balanceRow: {
        flexDirection: 'row',
        gap: 16,
    },
    balanceColumn: {
        flex: 1,
    },
    subSectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: COLORS.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    miniPersonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    miniAvatar: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniAvatarText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    miniPersonName: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    miniAmountSuccess: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.success,
    },
    miniAmountError: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.error,
    },
    emptyState: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    emptyMiniText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
    }
});
