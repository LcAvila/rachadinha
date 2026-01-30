import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { GroupRepository } from '../../infrastructure/firebase/GroupRepository';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';
import { GetUserGroupsUseCase } from '../../application/usecases/groups/GetUserGroupsUseCase';
import { Group } from '../../domain/entities/Group';
import { COLORS } from '../../core/constants/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type GroupsScreenProp = StackNavigationProp<RootStackParamList, 'Groups'>;

/**
 * @component GroupsScreen
 * Tela que lista os grupos do usuário.
 * Permite visualizar grupos existentes e navegar para criar um novo.
 */
export const GroupsScreen = () => {
    const navigation = useNavigation<GroupsScreenProp>();

    // Estados de dados e UI
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Dependências
    const groupRepo = new GroupRepository();
    const authRepo = new AuthRepository();
    const getUserGroupsUseCase = new GetUserGroupsUseCase(groupRepo);

    /**
     * Carrega a lista de grupos do usuário autenticado.
     */
    const loadGroups = async () => {
        const user = await authRepo.getCurrentUser();
        if (user) {
            const userGroups = await getUserGroupsUseCase.execute(user.id);
            setGroups(userGroups);
        }
        setLoading(false);
        setRefreshing(false);
    };

    // UseFocusEffect garante que a lista seja recarregada ao voltar para esta tela (ex: após criar um grupo)
    useFocusEffect(
        useCallback(() => {
            loadGroups();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadGroups();
    };

    /**
     * Renderiza o card de um grupo individual na lista.
     * @param item O grupo a ser renderizado.
     */
    const renderGroupItem = ({ item }: { item: Group }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            // Navega para a Home (por enquanto). Futuramente pode levar a detalhes do grupo.
            onPress={() => navigation.navigate('Home')}
        >
            <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.members.length} membros</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, '#D1FAE5', '#A7F3D0']}
                style={styles.background}
            />

            <View style={styles.header}>
                <Text style={styles.title}>Meus Grupos</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={groups}
                    keyExtractor={item => item.id}
                    renderItem={renderGroupItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color={COLORS.textSecondary} />
                            <Text style={styles.emptyText}>Você ainda não tem grupos.</Text>
                            <Text style={styles.emptySubText}>Crie um para começar a dividir!</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateGroup')}
            >
                <Ionicons name="add" size={24} color="#FFF" />
                <Text style={styles.fabText}>Novo Grupo</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    background: { position: 'absolute', left: 0, right: 0, top: 0, height: '100%' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
    list: { padding: 20, paddingBottom: 100 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardIconText: { fontSize: 20, color: '#FFF', fontWeight: 'bold' },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    cardSubtitle: { fontSize: 14, color: COLORS.textSecondary },
    fab: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
    emptyContainer: { alignItems: 'center', marginTop: 100, opacity: 0.7 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 16 },
    emptySubText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
});
