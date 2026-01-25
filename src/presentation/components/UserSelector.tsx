import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, StyleSheet } from 'react-native';
import { User } from '../../domain/entities/User';
import { COLORS } from '../../core/constants/constants';

interface UserSelectorProps {
    users: User[];
    onSelect: (user: User) => void;
    selectedUser?: User;
}

export const UserSelector: React.FC<UserSelectorProps> = ({ users, onSelect, selectedUser }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [search, setSearch] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);

    useEffect(() => {
        setFilteredUsers(
            users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
        );
    }, [search, users]);

    return (
        <View>
            <Text style={styles.label}>Para quem é este item?</Text>
            <TouchableOpacity
                style={styles.selector}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.selectorText}>
                    {selectedUser ? selectedUser.name : 'Selecione um amigo...'}
                </Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selecione um Amigo</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar..."
                            value={search}
                            onChangeText={setSearch}
                        />

                        <FlatList
                            data={filteredUsers}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.userItem}
                                    onPress={() => {
                                        onSelect(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.userName}>{item.name}</Text>
                                    <Text style={styles.userEmail}>{item.email}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Cancelar</Text>
                        </TouchableOpacity>
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
        height: '70%',
    },
    modalTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
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
    },
    userName: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
    userEmail: { color: COLORS.textSecondary, fontSize: 14 },
    closeButton: {
        marginTop: 16,
        padding: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: { color: COLORS.error, fontWeight: 'bold', fontSize: 16 },
});
