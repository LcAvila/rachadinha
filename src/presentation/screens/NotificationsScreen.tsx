import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { NotificationRepository } from '../../infrastructure/firebase/NotificationRepository';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';
import { Notification } from '../../domain/entities/Notification';
import { COLORS } from '../../core/constants/constants';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

/**
 * @component NotificationsScreen
 * Tela de notificações do usuário.
 * Exibe lista de notificações, permite atualizar (pull-to-refresh) e marcar como lida ao clicar.
 */
export const NotificationsScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();

    // Estados
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Dependências
    const notificationRepo = new NotificationRepository();
    const authRepo = new AuthRepository();

    const fetchNotifications = async () => {
        try {
            const user = await authRepo.getCurrentUser();
            if (user) {
                const data = await notificationRepo.getUserNotifications(user.id);
                setNotifications(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    /**
     * Marca a notificação como lida e (opcionalmente) navega para o detalhe.
     */
    const handlePress = async (notification: Notification) => {
        if (!notification.read) {
            // Atualização otimista
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
            // Atualização no backend
            await notificationRepo.markAsRead(notification.id);
        }

        // Exemplo de deep link (se houver dados extras)
        if (notification.data?.expenseId) {
            // navigation.navigate('ExpenseDetails', { id: notification.data.expenseId });
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: COLORS.success };
            case 'warning': return { name: 'alert-circle', color: COLORS.warning };
            case 'error': return { name: 'close-circle', color: '#EF4444' };
            default: return { name: 'information-circle', color: COLORS.primary };
        }
    };

    const renderItem = ({ item, index }: { item: Notification, index: number }) => {
        const icon = getIcon(item.type);
        return (
            <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                <TouchableOpacity
                    style={[styles.item, !item.read && styles.unreadItem]}
                    onPress={() => handlePress(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name={icon.name as any} size={28} color={icon.color} />
                    </View>
                    <View style={styles.contentContainer}>
                        <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
                        <Text style={styles.message}>{item.message}</Text>
                        <Text style={styles.time}>
                            {item.createdAt.toLocaleDateString()} {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    {!item.read && <View style={styles.dot} />}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notificações</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 40 + insets.bottom }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={64} color="#CBD5E0" />
                            <Text style={styles.emptyText}>Você não tem novas notificações.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    backButton: {
        padding: 4,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    item: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        borderLeftWidth: 4,
        borderLeftColor: 'transparent',
    },
    unreadItem: {
        backgroundColor: '#F8FAFC',
        borderLeftColor: COLORS.primary,
    },
    iconContainer: {
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    unreadText: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    message: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 6,
        lineHeight: 20,
    },
    time: {
        fontSize: 12,
        color: '#94A3B8',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginLeft: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
