import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, StyleSheet } from 'react-native';
import { User } from '../../domain/entities/User';
import { COLORS } from '../../core/constants/constants';

/**
 * Interface para as propriedades do UserSelector.
 */
interface UserSelectorProps {
    /** Lista completa de usuários para seleção */
    users: User[];
    /** Função chamada ao selecionar um único usuário (modo single) */
    onSelect: (user: User) => void;
    /** Função chamada ao confirmar seleção múltipla (modo multi) */
    onMultiSelect?: (users: User[]) => void;
    /** O usuário selecionado atualmente (modo single) */
    selectedUser?: User;
    /** Lista de usuários selecionados atualmente (modo multi) */
    selectedUsers?: User[];
    /** Se verdadeiro, permite selecionar múltiplas pessoas com confirmação */
    multiSelect?: boolean;
}

/**
 * @component UserSelector
 * Um seletor de usuários versátil que funciona em modo único ou múltiplo.
 * Abre um modal com busca em tempo real e lista de amigos.
 * No modo múltiplo, permite marcar vários itens antes de confirmar.
 */
export const UserSelector: React.FC<UserSelectorProps> = ({
    users,
    onSelect,
    selectedUser,
    multiSelect = false,
    selectedUsers = [],
    onMultiSelect
}) => {
    // Estados internos
    const [modalVisible, setModalVisible] = useState(false);
    const [search, setSearch] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);
    // Estado temporário para multi-seleção antes da confirmação
    const [tempSelectedUsers, setTempSelectedUsers] = useState<User[]>(selectedUsers);

    // Efeito para filtrar a lista conforme a busca
    useEffect(() => {
        setFilteredUsers(
            users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
        );
    }, [search, users]);

    // Sincroniza estado temporário ao abrir o modal em modo multi
    useEffect(() => {
        if (modalVisible && multiSelect) {
            setTempSelectedUsers(selectedUsers);
        }
    }, [modalVisible, multiSelect, selectedUsers]);

    /**
     * Adiciona ou remove um usuário da seleção temporária (modo multi).
     */
    const toggleUser = (user: User) => {
        if (tempSelectedUsers.find(u => u.id === user.id)) {
            setTempSelectedUsers(tempSelectedUsers.filter(u => u.id !== user.id));
        } else {
            setTempSelectedUsers([...tempSelectedUsers, user]);
        }
    };

    /**
     * Confirma a seleção e fecha o modal.
     */
    const handleConfirm = () => {
        if (multiSelect && onMultiSelect) {
            onMultiSelect(tempSelectedUsers);
        }
        setModalVisible(false);
    };

    /**
     * Retorna o texto descritivo para o botão de gatilho do selector.
     */
    const getDisplayText = () => {
        if (multiSelect) {
            if (selectedUsers.length === 0) return 'Selecione as pessoas...';
            if (selectedUsers.length === 1) return selectedUsers[0].name;
            return `${selectedUsers.length} pessoas selecionadas`;
        }
        return selectedUser ? selectedUser.name : 'Selecione um amigo...';
    };

    return (
        <View>
            <Text style={styles.label}>Para quem é este item?</Text>

            {/* Gatilho para abrir o modal */}
            <TouchableOpacity
                style={styles.selector}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.selectorText}>
                    {getDisplayText()}
                </Text>
            </TouchableOpacity>

            {/* Modal de Busca e Seleção */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeaderRow}>
                            <Text style={styles.modalTitle}>
                                {multiSelect ? 'Selecione as Pessoas' : 'Selecione um Amigo'}
                            </Text>
                            {multiSelect && (
                                <Text style={styles.countText}>{tempSelectedUsers.length} selecionados</Text>
                            )}
                        </View>

                        {/* Campo de Busca */}
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar por nome..."
                            placeholderTextColor={COLORS.textSecondary}
                            value={search}
                            onChangeText={setSearch}
                        />

                        {/* Listagem de Usuários Encontrados */}
                        <FlatList
                            data={filteredUsers}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => {
                                const isSelected = multiSelect
                                    ? !!tempSelectedUsers.find(u => u.id === item.id)
                                    : selectedUser?.id === item.id;

                                return (
                                    <TouchableOpacity
                                        style={[styles.userItem, isSelected && styles.userItemSelected]}
                                        onPress={() => {
                                            if (multiSelect) {
                                                toggleUser(item);
                                            } else {
                                                onSelect(item);
                                                setModalVisible(false);
                                            }
                                        }}
                                    >
                                        <View>
                                            <Text style={[styles.userName, isSelected && { color: COLORS.primary }]}>{item.name}</Text>
                                            <Text style={styles.userEmail}>{item.email}</Text>
                                        </View>
                                        {isSelected && <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>✓</Text>}
                                    </TouchableOpacity>
                                );
                            }}
                        />

                        {/* Botões de Ação no Rodapé */}
                        <View style={styles.footerButtons}>
                            <TouchableOpacity
                                style={[styles.closeButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            {multiSelect && (
                                <TouchableOpacity
                                    style={[styles.closeButton, styles.confirmButton]}
                                    onPress={handleConfirm}
                                >
                                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    label: { color: COLORS.text, marginBottom: 8, fontSize: 16, fontWeight: '500' },
    selector: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    selectorText: { color: COLORS.text, fontSize: 16 },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '80%',
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
    countText: { color: COLORS.primary, fontWeight: 'bold' },
    searchInput: {
        backgroundColor: COLORS.surface,
        padding: 12,
        borderRadius: 8,
        color: COLORS.text,
        marginBottom: 16,
    },
    userItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userItemSelected: {
        backgroundColor: COLORS.primary + '10',
    },
    userName: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
    userEmail: { color: COLORS.textSecondary, fontSize: 14 },
    footerButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    closeButton: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.surface,
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
    },
    cancelButtonText: { color: COLORS.textSecondary, fontWeight: 'bold', fontSize: 16 },
    confirmButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
