import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { ExpenseRepository } from '../../infrastructure/firebase/ExpenseRepository';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';
import { Expense, ExpenseStatus } from '../../domain/entities/Expense';
import { COLORS } from '../../core/constants/constants';
import { GetPendingExpensesUseCase } from '../../application/usecases/expenses/GetPendingExpensesUseCase';
import { formatCurrency } from '../../core/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, FadeInDown } from 'react-native-reanimated';
import { StatusBadge } from '../components/StatusBadge';

type HomeScreenProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenProp>();
    const route = useRoute();
    // @ts-ignore - route params might be undefined if accessed directly, but TabNavigator sets them.
    const filterStatus: ExpenseStatus = route.params?.filterStatus || 'draft';

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingStats, setPendingStats] = useState({ toReceive: 0, toPay: 0 });
    const [menuOpen, setMenuOpen] = useState(false);

    const expenseRepo = new ExpenseRepository();
    const authRepo = new AuthRepository();
    const pendingUseCase = new GetPendingExpensesUseCase(expenseRepo);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const user = await authRepo.getCurrentUser();
            if (!user) return;

            // Fetch expenses and filter
            const fetchedExpenses = await expenseRepo.getUserExpenses(user.id);
            const filtered = fetchedExpenses.filter(e => e.status === filterStatus);
            setExpenses(filtered);

            // Fetch stats
            const { toReceive, toPay } = await pendingUseCase.execute(user.id);
            const totalReceive = toReceive.reduce((acc, p) => acc + p.amount, 0);
            const totalPay = toPay.reduce((acc, p) => acc + p.amount, 0);
            setPendingStats({ toReceive: totalReceive, toPay: totalPay });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const getStatusColor = (status: ExpenseStatus) => {
        switch (status) {
            case 'draft': return COLORS.textSecondary;
            case 'waiting_payment': return COLORS.warning;
            case 'paid': return COLORS.success;
            default: return COLORS.primary;
        }
    };

    const getStatusLabel = (status: ExpenseStatus) => {
        switch (status) {
            case 'draft': return 'Rascunho';
            case 'waiting_payment': return 'Aguardando Pagamento';
            case 'paid': return 'Pago';
            default: return '';
        }
    };

    const renderExpenseItem = ({ item, index }: { item: Expense; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
            <TouchableOpacity
                style={styles.expenseCard}
                onPress={() => {
                    navigation.navigate('AddItems', { expenseId: item.id });
                }}
                activeOpacity={0.7}
            >
                <View style={[styles.cardIcon, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <Ionicons
                        name={item.status === 'draft' ? "document-text-outline" : item.status === 'paid' ? "checkmark-done-circle" : "hourglass-outline"}
                        size={26}
                        color={getStatusColor(item.status)}
                    />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.cardStatusRow}>
                        <View style={styles.cardDetails}>
                            <Text style={styles.cardAmount}>
                                {formatCurrency(item.totalAmount || 0)}
                            </Text>
                            <Text style={styles.cardItemCount}>{item.items?.length || 0} itens</Text>
                        </View>
                        <StatusBadge status={item.status} />
                    </View>
                </View>
                <View style={styles.cardArrow}>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Rachadinha</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <Ionicons name="person-circle-outline" size={28} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginLeft: 16 }}>
                        <Ionicons name="notifications-outline" size={26} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.saldoCard}
                    onPress={() => navigation.navigate('PendingExpenses')}
                    activeOpacity={0.9}
                >
                    <View style={styles.saldoHeader}>
                        <Text style={styles.saldoLabel}>Saldo Geral</Text>
                        <Ionicons name="stats-chart" size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.saldoSubLabel}>Você deve</Text>
                    <Text style={styles.saldoValue}>{formatCurrency(pendingStats.toPay)}</Text>
                    {pendingStats.toReceive > 0 && (
                        <Text style={[styles.saldoSubLabel, { color: COLORS.success, marginTop: 8 }]}>
                            e tem a receber <Text style={{ fontWeight: 'bold' }}>{formatCurrency(pendingStats.toReceive)}</Text>
                        </Text>
                    )}
                    <View style={styles.saldoFooter}>
                        <Text style={styles.saldoFooterText}>Ver detalhes</Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
                    </View>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Minhas Despesas</Text>

                <FlatList
                    data={expenses}
                    keyExtractor={item => item.id}
                    renderItem={renderExpenseItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} colors={[COLORS.primary]} />}
                    ListEmptyComponent={
                        !loading ? <Text style={styles.emptyText}>Nenhuma despesa recente.</Text> : null
                    }
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Speed Dial Menu */}
            <View style={styles.bottomBar}>
                {menuOpen && (
                    <View style={styles.menuContainer}>
                        <TouchableOpacity
                            style={styles.subFab}
                            onPress={() => { toggleMenu(); navigation.navigate('CreateGroup'); }}
                        >
                            <View style={styles.subFabLabelContainer}>
                                <Text style={styles.subFabLabel}>Novo Grupo</Text>
                            </View>
                            <View style={styles.subFabButton}>
                                <Ionicons name="people" size={24} color={COLORS.primary} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.subFab}
                            onPress={() => { toggleMenu(); navigation.navigate('CreateExpense'); }}
                        >
                            <View style={styles.subFabLabelContainer}>
                                <Text style={styles.subFabLabel}>Nova Rachadinha</Text>
                            </View>
                            <View style={styles.subFabButton}>
                                <Ionicons name="receipt" size={24} color={COLORS.primary} />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.fab, menuOpen ? styles.fabOpen : null]}
                    onPress={toggleMenu}
                    activeOpacity={0.9}
                >
                    <Ionicons name={menuOpen ? "close" : "add"} size={32} color={menuOpen ? COLORS.text : "#FFF"} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    saldoCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    saldoLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    saldoSubLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    saldoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    saldoValue: {
        fontSize: 34,
        fontWeight: '900',
        color: COLORS.text,
    },
    saldoFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 4,
    },
    saldoFooterText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
        textTransform: 'uppercase',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
    },
    expenseCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.surfaceLight,
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
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    cardDetails: {
        gap: 4,
    },
    cardItemCount: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    cardArrow: {
        marginLeft: 8,
    },
    cardValues: {
        alignItems: 'flex-end',
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginTop: 20,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        alignItems: 'flex-end',
    },
    menuContainer: {
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    fabOpen: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: COLORS.textSecondary
    },
    subFab: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    subFabButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        marginLeft: 12,
    },
    subFabLabelContainer: {
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        elevation: 2,
    },
    subFabLabel: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontSize: 14,
    },
});
