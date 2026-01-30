import React, { useEffect, useState, useRef } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Platform, Image, Modal, KeyboardAvoidingView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { ExpenseRepository } from '../../infrastructure/firebase/ExpenseRepository';
import { NotificationRepository } from '../../infrastructure/firebase/NotificationRepository';
import { AddItemToExpenseUseCase } from '../../application/usecases/expenses/AddItemToExpenseUseCase';
import { FinalizeExpenseUseCase } from '../../application/usecases/expenses/FinalizeExpenseUseCase';
import { calculateProportionalAmounts, ProportionalCalculation } from '../../application/utils/CalculateProportionalAmounts';
import { ItemInput } from '../components/ItemInput';
import { UserSelector } from '../components/UserSelector';
import { ScaleButton } from '../components/ScaleButton';
import { User } from '../../domain/entities/User';
import { Expense, ExpenseStatus } from '../../domain/entities/Expense';
import { COLORS } from '../../core/constants/constants';
import { formatCurrency } from '../../core/utils/formatCurrency';
import { CustomConfirmModal } from '../components/CustomConfirmModal';
import { StatusModal } from '../components/StatusModal';
import { StatusBadge } from '../components/StatusBadge';
import { Ionicons } from '@expo/vector-icons';
import { Toast } from '../components/Toast';
import { Celebration, CelebrationHandle } from '../components/Celebration';

type AddItemsScreenRouteProp = RouteProp<RootStackParamList, 'AddItems'>;
type AddItemsScreenNavProp = StackNavigationProp<RootStackParamList, 'AddItems'>;

/**
 * @component AddItemsScreen
 * Tela principal de edição da despesa.
 * Responsável por:
 * - Listar e adicionar itens à despesa.
 * - Visualizar cálculos proporcionais.
 * - Gerenciar status da despesa e receptor.
 * - Finalizar a despesa.
 */
export const AddItemsScreen = () => {
    const route = useRoute<AddItemsScreenRouteProp>();
    const navigation = useNavigation<AddItemsScreenNavProp>();
    const insets = useSafeAreaInsets();
    const { expenseId } = route.params;

    // Estados de Dados
    const [expense, setExpense] = useState<Expense | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [calculations, setCalculations] = useState<ProportionalCalculation[]>([]);

    // Estados de UI e Modais
    const [loading, setLoading] = useState(true);
    const [finalizing, setFinalizing] = useState(false);
    const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [isPaidConfirmVisible, setIsPaidConfirmVisible] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<ExpenseStatus | null>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [tempReceiver, setTempReceiver] = useState<User | undefined>(undefined);

    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
    const celebrationRef = useRef<CelebrationHandle>(null);
    const [showCelebration, setShowCelebration] = useState(false);

    // Animação do Resumo (Acordeão)
    const summaryProgress = useSharedValue(1); // 1 = aberto, 0 = fechado
    const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);

    /**
     * Alterna a visibilidade do resumo financeiro com animação tipo mola.
     */
    const toggleSummary = () => {
        const nextState = !isSummaryCollapsed;
        setIsSummaryCollapsed(nextState);

        summaryProgress.value = withSpring(nextState ? 0 : 1, {
            damping: 10,
            stiffness: 100,
            mass: 0.5,
            overshootClamping: false
        });
    };

    const summaryContentStyle = useAnimatedStyle(() => {
        return {
            maxHeight: interpolate(summaryProgress.value, [0, 1], [0, 500]),
            opacity: interpolate(summaryProgress.value, [0, 0.5, 1], [0, 0, 1]),
            transform: [
                { scaleY: summaryProgress.value },
                { translateY: interpolate(summaryProgress.value, [0, 1], [-100, 0]) }
            ],
            marginBottom: interpolate(summaryProgress.value, [0, 1], [0, 16]),
            overflow: 'hidden'
        };
    }, []);

    // Instâncias de Use Cases e Repositórios
    const expenseRepo = new ExpenseRepository();
    const notifRepo = new NotificationRepository();
    const addItemUseCase = new AddItemToExpenseUseCase(expenseRepo);
    const finalizeUseCase = new FinalizeExpenseUseCase(expenseRepo, notifRepo);

    /**
     * Carrega dados da despesa e lista de usuários.
     */
    const loadData = async () => {
        try {
            const exp = await expenseRepo.getExpense(expenseId);
            const allUsers = await expenseRepo.getAllUsers();

            setExpense(exp);
            setUsers(allUsers);

            if (exp) {
                updateCalculations(exp);
                // Define quem recebe (Receptor ou Criador)
                const receiverId = exp.receiverId || exp.createdBy;
                const receiver = allUsers.find(u => u.id === receiverId);
                setTempReceiver(receiver);
            }
        } catch (e) {
            Alert.alert('Erro', 'Falha ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [expenseId]);

    /**
     * Recalcula os valores proporcionais localmente.
     */
    const updateCalculations = (currentExpense: Expense) => {
        const calcs = calculateProportionalAmounts(
            currentExpense.items,
            currentExpense.deliveryFee,
            currentExpense.serviceFee,
            currentExpense.discount
        );
        setCalculations(calcs);
    };

    /**
     * Adiciona um novo item à despesa.
     * Atualiza o estado local de forma otimista e recalcula valores.
     */
    const handleAddItem = async (assignedUsers: { userId: string, userName: string }[], description: string, unitPrice: number, quantity: number) => {
        if (!expense || expense.status === 'paid') return;

        try {
            const newItem = {
                assignedTo: assignedUsers,
                description,
                unitPrice,
                quantity,
                amount: unitPrice * quantity,
                notified: false
            };

            await addItemUseCase.execute(expense.id, newItem);

            // Atualização Otimista
            const updatedExpense = {
                ...expense,
                items: [...expense.items, newItem]
            };
            setExpense(updatedExpense);
            updateCalculations(updatedExpense);
        } catch (e) {
            Alert.alert('Erro', 'Falha ao adicionar item');
        }
    };

    /**
     * Inicia o fluxo de finalização da despesa.
     */
    const handleFinalize = async () => {
        if (!expense || !expense.items || expense.items.length === 0) {
            Alert.alert('Ops!', 'Adicione pelo menos um item antes de finalizar. 🛒');
            return;
        }
        setIsConfirmModalVisible(true);
    };

    const triggerCelebration = () => {
        setShowCelebration(true);
        setTimeout(() => {
            celebrationRef.current?.start();
        }, 100);

        setTimeout(() => {
            setShowCelebration(false);
        }, 5000);
    };

    /**
     * Executa a lógica de finalização (geração de cobranças).
     */
    const executeFinalization = async () => {
        setFinalizing(true);
        try {
            await finalizeUseCase.execute(expenseId);
            setToast({ visible: true, message: 'Despesa finalizada com sucesso! 🚀', type: 'success' });
            triggerCelebration();
            setTimeout(() => {
                navigation.navigate('Home');
            }, 1500);
        } catch (e: any) {
            setToast({ visible: true, message: e.message || 'Erro ao finalizar despesa', type: 'error' });
        } finally {
            setFinalizing(false);
        }
    };

    /**
     * Lida com a seleção manual de status via modal.
     */
    const handleStatusSelect = (status: ExpenseStatus) => {
        if (status === 'paid') {
            setPendingStatus(status);
            setIsPaidConfirmVisible(true);
        } else {
            updateStatus(status);
        }
        setIsStatusModalVisible(false);
    };

    const updateStatus = async (status: ExpenseStatus) => {
        try {
            await expenseRepo.updateExpense(expenseId, { status });
            if (status === 'paid') {
                triggerCelebration();
            }
            if (status === 'waiting_payment') {
                setToast({ visible: true, message: 'Rachadinha salva com sucesso! 💾', type: 'success' });
                setTimeout(() => {
                    navigation.navigate('Home');
                }, 1500);
            } else {
                loadData();
            }
        } catch (e) {
            Alert.alert('Erro', 'Falha ao atualizar status');
        }
    };

    /**
     * Salva as configurações da despesa (ex: quem recebe).
     */
    const handleSaveSettings = async () => {
        if (!expense || !tempReceiver) return;
        try {
            await expenseRepo.updateExpense(expenseId, { receiverId: tempReceiver.id });
            setExpense({ ...expense, receiverId: tempReceiver.id });
            setToast({ visible: true, message: 'Configurações salvas! ⚙️', type: 'success' });
            setShowSettingsModal(false);
        } catch (e) {
            Alert.alert('Erro', 'Falha ao salvar configurações');
        }
    };

    if (loading || !expense) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const isPaid = expense.status === 'paid';
    const itemsTotal = expense.items ? expense.items.reduce((acc, item) => acc + item.amount, 0) : 0;
    const currentTotal = itemsTotal + expense.deliveryFee + expense.serviceFee - expense.discount;

    const receiverId = expense.receiverId || expense.createdBy;
    const receiver = users.find(u => u.id === receiverId);
    const receiverName = receiver ? receiver.name : expense.createdByName;

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20, paddingTop: insets.top + 20 }]} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.headerRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                            <Text style={[styles.title, { flex: 1 }]} numberOfLines={1}>{expense.title}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
                                <Ionicons name="settings-outline" size={22} color={COLORS.text} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => !isPaid && setIsStatusModalVisible(true)} disabled={isPaid}>
                                <StatusBadge status={expense.status} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Banner de quem recebe */}
                    <View style={styles.receiverBanner}>
                        <Ionicons name="wallet-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.receiverText}>
                            Valor a receber vai para: <Text style={{ fontWeight: 'bold' }}>{receiverName}</Text>
                        </Text>
                    </View>

                    {isPaid && (
                        <View style={styles.paidHeader}>
                            <Ionicons name="checkmark-done-circle" size={24} color={COLORS.success} />
                            <Text style={styles.paidHeaderText}>Esta despesa foi FINALIZADA</Text>
                        </View>
                    )}

                    {/* Resumo da Conta (Accordion) */}
                    <View style={[styles.summaryBox, { overflow: 'hidden' }]}>
                        <TouchableOpacity
                            style={styles.summaryHeader}
                            onPress={toggleSummary}
                            activeOpacity={0.7}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.summaryTitle}>Resumo da Conta</Text>
                            </View>
                            <Ionicons
                                name={isSummaryCollapsed ? "chevron-down" : "chevron-up"}
                                size={20}
                                color={COLORS.textSecondary}
                            />
                        </TouchableOpacity>

                        <Animated.View style={summaryContentStyle}>
                            <View style={styles.summaryContent}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Itens ({expense.items ? expense.items.length : 0})</Text>
                                    <Text style={styles.summaryValue}>{formatCurrency(expense.items ? expense.items.reduce((a, b) => a + b.amount, 0) : 0)}</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Taxas & Entrega</Text>
                                    <Text style={styles.summaryValue}>+ {formatCurrency(expense.deliveryFee + expense.serviceFee)}</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Descontos</Text>
                                    <Text style={[styles.summaryValue, { color: COLORS.success }]}>- {formatCurrency(expense.discount)}</Text>
                                </View>
                                <View style={[styles.summaryItem, styles.totalRow]}>
                                    <Text style={styles.totalLabel}>Total Geral</Text>
                                    <Text style={styles.totalValue}>{formatCurrency(currentTotal)}</Text>
                                </View>

                                {expense.invoiceUrl && (
                                    <TouchableOpacity style={styles.viewInvoiceBtn} onPress={() => setShowInvoiceModal(true)}>
                                        <Ionicons name="image-outline" size={18} color={COLORS.primary} />
                                        <Text style={styles.viewInvoiceText}>Ver Nota Fiscal</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </Animated.View>
                    </View>

                    {/* Input de Itens */}
                    {!isPaid && <ItemInput users={users} onAdd={handleAddItem} />}

                    {/* Lista de Cálculos Proporcionais */}
                    <View style={styles.sectionHeader}>
                        <Ionicons name="people-outline" size={20} color={COLORS.text} />
                        <Text style={styles.sectionTitle}>Divisão do Valor</Text>
                    </View>
                    <View style={styles.calculationsList}>
                        {calculations.map((calc) => (
                            <View key={calc.userId} style={styles.calcRow}>
                                <View style={styles.calcLeft}>
                                    <View style={styles.userAvatar}>
                                        <Text style={styles.avatarText}>{calc.userName.charAt(0)}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.userName}>{calc.userName}</Text>
                                        <Text style={styles.userDetail}>{calc.percentage.toFixed(0)}% da conta</Text>
                                    </View>
                                </View>
                                <Text style={styles.amount}>{formatCurrency(calc.finalAmount)}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Lista Detalhada de Itens */}
                    <View style={styles.itemsList}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="list-outline" size={20} color={COLORS.text} />
                            <Text style={styles.sectionTitle}>Itens Individuais</Text>
                        </View>
                        {expense.items && expense.items.map((item, index) => {
                            const isMulti = item.assignedTo && item.assignedTo.length > 1;
                            const assignedNames = item.assignedTo ? item.assignedTo.map(u => u.userName.split(' ')[0]).join(', ') : item.userName;
                            const qty = item.quantity || 1;

                            return (
                                <View key={index} style={styles.itemRow}>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemDesc}>{qty}x {item.description}</Text>
                                        <Text style={styles.itemUser}>
                                            {isMulti ? `Dividido: ${assignedNames}` : `por ${assignedNames}`}
                                        </Text>
                                    </View>
                                    <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Botões de Ação */}
                    {!isPaid && (
                        <View style={styles.buttonRow}>
                            <ScaleButton
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={() => navigation.navigate('Home')}
                                disabled={finalizing}
                            >
                                <Text style={[styles.buttonText, styles.saveButtonText]}>Voltar</Text>
                            </ScaleButton>

                            {(expense.status === 'draft' || expense.status === 'waiting_payment') && (
                                <ScaleButton
                                    style={[styles.actionButton, styles.finalizeButton, { opacity: finalizing ? 0.7 : 1 }]}
                                    onPress={handleFinalize}
                                    disabled={finalizing}
                                >
                                    {finalizing ? (
                                        <ActivityIndicator color='#FFF' />
                                    ) : (
                                        <Text style={styles.buttonText}>Finalizar</Text>
                                    )}
                                </ScaleButton>
                            )}

                            <ScaleButton
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={() => updateStatus('waiting_payment')}
                            >
                                <Text style={[styles.buttonText, styles.saveButtonText]}>Salvar</Text>
                            </ScaleButton>
                        </View>
                    )}

                    {isPaid && (
                        <View style={styles.buttonRow}>
                            <ScaleButton
                                style={[styles.actionButton, styles.finalizeButton]}
                                onPress={() => navigation.navigate('Home')}
                            >
                                <Text style={styles.buttonText}>Voltar para Home</Text>
                            </ScaleButton>
                        </View>
                    )}

                </ScrollView >
            </KeyboardAvoidingView>

            {/* Modal de Configurações (Quem recebe) */}
            <Modal visible={showSettingsModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.settingsModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Configurações</Text>
                            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                                <Ionicons name="close" size={26} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitleSmall}>Quem vai receber?</Text>
                        <Text style={styles.helperText}>Escolha quem pagou a conta e deve receber os valores.</Text>

                        <View style={{ height: 100, marginTop: 10 }}>
                            <UserSelector
                                users={users}
                                selectedUser={tempReceiver}
                                onSelect={setTempReceiver}
                            />
                        </View>

                        <TouchableOpacity style={styles.saveSettingsBtn} onPress={handleSaveSettings}>
                            <Text style={styles.saveSettingsText}>Salvar Alterações</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modais de Confirmação */}
            <CustomConfirmModal
                visible={isConfirmModalVisible}
                title="Finalizar Despesa"
                message="Isso irá gerar as cobranças e notificar os usuários. Deseja continuar?"
                confirmText="Sim, Finalizar"
                cancelText="Não"
                onConfirm={() => {
                    setIsConfirmModalVisible(false);
                    executeFinalization();
                }}
                onCancel={() => setIsConfirmModalVisible(false)}
            />

            <CustomConfirmModal
                visible={isPaidConfirmVisible}
                title="Confirmar Pagamento Total"
                message="Você confirma que todos pagaram e deseja encerrar esta despesa? Ela ficará disponível apenas para consulta."
                confirmText="Sim, Encerrar"
                cancelText="Não"
                onConfirm={() => {
                    setIsPaidConfirmVisible(false);
                    if (pendingStatus) updateStatus(pendingStatus);
                }}
                onCancel={() => {
                    setIsPaidConfirmVisible(false);
                    setPendingStatus(null);
                }}
            />

            <StatusModal
                visible={isStatusModalVisible}
                currentStatus={expense.status}
                onSelect={handleStatusSelect}
                onCancel={() => setIsStatusModalVisible(false)}
            />

            <Modal visible={showInvoiceModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.invoiceModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nota Fiscal</Text>
                            <TouchableOpacity onPress={() => setShowInvoiceModal(false)}>
                                <Ionicons name="close" size={28} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                        {expense.invoiceUrl ? (
                            <Image source={{ uri: expense.invoiceUrl }} style={styles.fullInvoiceImage} resizeMode="contain" />
                        ) : (
                            <Text>Nenhuma imagem disponível</Text>
                        )}
                    </View>
                </View>
            </Modal>

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={() => setToast({ ...toast, visible: false })}
            />
            {showCelebration && <Celebration ref={celebrationRef} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 20 },
    center: { justifyContent: 'center', alignItems: 'center' },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
    receiverBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.primary + '10',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    receiverText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '500',
    },
    summaryBox: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryContent: {
        gap: 12,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 15,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
        marginBottom: 12,
    },
    sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
    calculationsList: { gap: 10 },
    calcRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1,
    },
    calcLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
    userName: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
    userDetail: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
    amount: { color: COLORS.primary, fontWeight: '800', fontSize: 18 },
    itemsList: { marginTop: 12 },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    itemInfo: { flex: 1 },
    itemDesc: { color: COLORS.text, fontWeight: '600', fontSize: 15 },
    itemUser: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
    itemAmount: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 32,
        marginBottom: 40,
    },
    actionButton: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    finalizeButton: {
        backgroundColor: COLORS.success,
    },
    buttonText: { fontWeight: 'bold', fontSize: 18, color: '#FFF' },
    saveButtonText: { color: COLORS.primary },
    paidHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success + '15',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        gap: 10,
    },
    paidHeaderText: {
        color: COLORS.success,
        fontWeight: 'bold',
        fontSize: 16,
    },
    viewInvoiceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    viewInvoiceText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    invoiceModalContent: {
        width: '90%',
        height: '80%',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
    },
    settingsModalContent: {
        width: '85%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.text,
    },
    sectionTitleSmall: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    helperText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    saveSettingsBtn: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveSettingsText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    fullInvoiceImage: {
        flex: 1,
        width: '100%',
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
    },
});
