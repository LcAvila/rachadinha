import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { ExpenseRepository } from '../../infrastructure/firebase/ExpenseRepository';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';
import { GetPendingExpensesUseCase } from '../../application/usecases/expenses/GetPendingExpensesUseCase';
import { PendingPayment } from '../../domain/entities/PendingPayment';
import { COLORS } from '../../core/constants/constants';
import { formatCurrency } from '../../core/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { CustomConfirmModal } from '../components/CustomConfirmModal';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Expense } from '../../domain/entities/Expense';
import { Celebration, CelebrationHandle } from '../components/Celebration';

type PendingExpensesNavProp = StackNavigationProp<RootStackParamList, 'PendingExpenses'>;

export const PendingExpensesScreen = () => {
    const navigation = useNavigation<PendingExpensesNavProp>();
    const [activeTab, setActiveTab] = useState<'toReceive' | 'toPay' | 'finished'>('toReceive');
    const [toReceive, setToReceive] = useState<PendingPayment[]>([]);
    const [toPay, setToPay] = useState<PendingPayment[]>([]);
    const [finished, setFinished] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
    const celebrationRef = useRef<CelebrationHandle>(null);

    const expenseRepo = new ExpenseRepository();
    const authRepo = new AuthRepository();
    const getPendingUseCase = new GetPendingExpensesUseCase(expenseRepo);

    const loadData = async () => {
        setLoading(true);
        try {
            const user = await authRepo.getCurrentUser();
            if (!user) return;

            const result = await getPendingUseCase.execute(user.id);
            setToReceive(result.toReceive);
            setToPay(result.toPay);

            // Fetch finished expenses
            const allExpenses = await expenseRepo.getUserExpenses(user.id);
            setFinished(allExpenses.filter(e => e.status === 'paid'));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleConfirmPayment = (paymentId: string) => {
        setSelectedPayment(paymentId);
        setIsConfirmVisible(true);
    };

    const handleMarkAsPaid = async () => {
        if (!selectedPayment) return;
        try {
            await expenseRepo.markPaymentAsPaid(selectedPayment);
            setIsConfirmVisible(false);
            setSelectedPayment(null);
            celebrationRef.current?.start();
            loadData(); // Reload list
        } catch (e) {
            console.error(e);
        }
    };

    const renderItem = ({ item }: { item: PendingPayment }) => (
        <View style={styles.card}>
            <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={activeTab === 'toReceive' ? "arrow-down-circle" : "arrow-up-circle"}
                        size={24}
                        color={activeTab === 'toReceive' ? COLORS.success : COLORS.primary}
                    />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.expenseTitle}</Text>
                    <Text style={styles.cardSubtitle}>
                        {activeTab === 'toReceive' ? `De: ${item.fromUserName}` : `Para: ${item.toUserName}`}
                    </Text>
                </View>
            </View>
            <View style={styles.cardRight}>
                <Text style={styles.cardAmount}>{formatCurrency(item.amount)}</Text>
                {activeTab === 'toReceive' && (
                    <TouchableOpacity
                        style={styles.payButton}
                        onPress={() => handleConfirmPayment(item.id)}
                    >
                        <Ionicons name="checkmark" size={18} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderFinishedItem = ({ item }: { item: Expense }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AddItems', { expenseId: item.id })}
        >
            <View style={styles.cardLeft}>
                <View style={[styles.iconContainer, { backgroundColor: COLORS.success + '10' }]}>
                    <Ionicons name="checkmark-done-circle" size={24} color={COLORS.success} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>Total: {formatCurrency(item.totalAmount)}</Text>
                </View>
            </View>
            <View style={styles.cardRight}>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </View>
        </TouchableOpacity>
    );

    const getData = () => {
        if (activeTab === 'toReceive') return toReceive;
        if (activeTab === 'toPay') return toPay;
        return finished;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Financeiro</Text>
                <TouchableOpacity onPress={loadData}>
                    <Ionicons name="refresh" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'toReceive' && styles.activeTab]}
                    onPress={() => setActiveTab('toReceive')}
                >
                    <Text style={[styles.tabText, activeTab === 'toReceive' && styles.activeTabText]}>A Receber</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'toPay' && styles.activeTab]}
                    onPress={() => setActiveTab('toPay')}
                >
                    <Text style={[styles.tabText, activeTab === 'toPay' && styles.activeTabText]}>A Pagar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'finished' && styles.activeTab]}
                    onPress={() => setActiveTab('finished')}
                >
                    <Text style={[styles.tabText, activeTab === 'finished' && styles.activeTabText]}>Finalizado</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={getData() as any}
                keyExtractor={item => item.id}
                renderItem={activeTab === 'finished' ? (renderFinishedItem as any) : (renderItem as any)}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={[COLORS.primary]} />}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="checkmark-done-circle-outline" size={64} color="#CBD5E0" />
                            <Text style={styles.emptyText}>Nada por aqui!{'\n'}Tudo em dia.</Text>
                        </View>
                    ) : null
                }
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            />

            <CustomConfirmModal
                visible={isConfirmVisible}
                title="Confirmar Recebimento"
                message="Você confirma que recebeu este pagamento?"
                confirmText="Sim, Confirmo"
                cancelText="Ainda não"
                onConfirm={handleMarkAsPaid}
                onCancel={() => setIsConfirmVisible(false)}
            />
            <Celebration ref={celebrationRef} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    title: { fontSize: 28, fontWeight: '900', color: COLORS.text },

    tabs: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#EBEEF2',
        borderRadius: 14,
        padding: 5
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    tabText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 13 },
    activeTabText: { color: '#FFF' },

    card: {
        backgroundColor: '#FFF',
        padding: 18,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: { color: COLORS.text, fontWeight: '700', fontSize: 16, marginBottom: 4 },
    cardSubtitle: { color: COLORS.textSecondary, fontSize: 13 },

    cardRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    cardAmount: { color: COLORS.text, fontWeight: '800', fontSize: 17 },

    payButton: {
        backgroundColor: COLORS.success,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },

    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        gap: 16,
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
    },
});
