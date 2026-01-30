import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { UserSelector } from './UserSelector';
import { User } from '../../domain/entities/User';
import { COLORS } from '../../core/constants/constants';
import { formatCurrencyInput, parseCurrencyInput } from '../../core/utils/currencyInput';

/**
 * Interface para as propriedades do ItemInput.
 */
interface ItemInputProps {
    /** Lista de usuários disponíveis para serem atribuídos ao item */
    users: User[];
    /** Função chamada ao clicar em adicionar item, retornando os dados capturados */
    onAdd: (assignedUsers: { userId: string, userName: string }[], description: string, unitPrice: number, quantity: number) => void;
}

/**
 * @component ItemInput
 * Formulário compacto para adição de novos itens a uma despesa.
 * Inclui:
 * - Seletor múltiplo de usuários (atribuição do item).
 * - Campo de quantidade.
 * - Campo de descrição do item.
 * - Campo de valor unitário com máscara de moeda.
 */
export const ItemInput: React.FC<ItemInputProps> = ({ users, onAdd }) => {
    // Estados internos dos campos
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [quantity, setQuantity] = useState('1');

    /**
     * Limpa os campos e repassa os dados para o componente pai.
     */
    const handleAdd = () => {
        if (selectedUsers.length > 0 && description && amount && quantity) {
            const unitPrice = parseCurrencyInput(amount);
            const qty = parseInt(quantity) || 1;

            const assigned = selectedUsers.map(u => ({ userId: u.id, userName: u.name }));

            onAdd(assigned, description, unitPrice, qty);

            // Reseta o estado para a próxima entrada
            setDescription('');
            setAmount('');
            setQuantity('1');
            setSelectedUsers([]);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Adicionar Novo Item</Text>

            {/* Seletor de Pessoas Atribuídas */}
            <UserSelector
                users={users}
                onSelect={() => { }} // Ignorado no modo multi-seleção
                multiSelect={true}
                selectedUsers={selectedUsers}
                onMultiSelect={setSelectedUsers}
            />

            {/* Linha com inputs de Quantidade, Descrição e Valor */}
            <View style={styles.row}>
                <View style={{ flex: 0.8 }}>
                    <Text style={styles.label}>Qtd</Text>
                    <TextInput
                        style={[styles.input, { textAlign: 'center' }]}
                        placeholder="1"
                        placeholderTextColor={COLORS.textSecondary}
                        keyboardType="numeric"
                        value={quantity}
                        onChangeText={setQuantity}
                    />
                </View>

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
                    <Text style={styles.label}>Valor Unit.</Text>
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

            {/* Botão de Adicionar */}
            <TouchableOpacity
                style={[styles.button, (selectedUsers.length === 0 || !description || !amount) && styles.disabled]}
                onPress={handleAdd}
                disabled={selectedUsers.length === 0 || !description || !amount}
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
    flex1: { flex: 1.2 },
    label: { color: COLORS.textSecondary, marginBottom: 8, fontSize: 12, fontWeight: '600' },
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
