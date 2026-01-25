import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { UserSelector } from './UserSelector';
import { User } from '../../domain/entities/User';
import { COLORS } from '../../core/constants/constants';
import { formatCurrencyInput, parseCurrencyInput } from '../../core/utils/currencyInput';

interface ItemInputProps {
    users: User[];
    onAdd: (userId: string, userName: string, description: string, amount: number) => void;
}

export const ItemInput: React.FC<ItemInputProps> = ({ users, onAdd }) => {
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    const handleAdd = () => {
        if (selectedUser && description && amount) {
            onAdd(selectedUser.id, selectedUser.name, description, parseCurrencyInput(amount));
            setDescription('');
            setAmount('');
            setSelectedUser(undefined);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Adicionar Novo Item</Text>

            <UserSelector
                users={users}
                selectedUser={selectedUser}
                onSelect={setSelectedUser}
            />

            <View style={styles.row}>
                <View style={styles.flex2}>
                    <Text style={styles.label}>Item</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Cerveja"
                        placeholderTextColor={COLORS.textSecondary}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>
                <View style={styles.flex1}>
                    <Text style={styles.label}>Valor</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="R$ 0,00"
                        placeholderTextColor={COLORS.textSecondary}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={(text) => setAmount(formatCurrencyInput(text))}
                    />
                </View>
            </View>

            <TouchableOpacity
                style={[styles.button, (!selectedUser || !description || !amount) && styles.disabled]}
                onPress={handleAdd}
                disabled={!selectedUser || !description || !amount}
            >
                <Text style={styles.buttonText}>Adicionar Item</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    header: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    row: { flexDirection: 'row', gap: 12, marginTop: 12 },
    flex2: { flex: 2 },
    flex1: { flex: 1 },
    label: { color: COLORS.textSecondary, marginBottom: 8 },
    input: {
        backgroundColor: COLORS.background,
        color: COLORS.text,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    disabled: { opacity: 0.5 },
    buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
