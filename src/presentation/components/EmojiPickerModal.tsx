import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { COLORS } from '../../core/constants/constants';
import { Ionicons } from '@expo/vector-icons';

/**
 * Interface para as propriedades do EmojiPickerModal.
 */
interface EmojiPickerModalProps {
    /** Se verdadeiro, o modal está visível */
    visible: boolean;
    /** Função chamada para fechar o modal */
    onClose: () => void;
    /** Função chamada quando um emoji é selecionado */
    onSelect: (emoji: string) => void;
}

/**
 * Lista de emojis disponíveis para seleção em grupos/despesas.
 */
const EMOJIS = [
    '🏠', '🏢', '✈️', '🏖️', '🎁', '🎉', '🍕', '🍔', '🍻', '🍷',
    '⚽', '🏀', '🎮', '🎲', '🚗', '💰', '💡', '📚', '💼', '📅',
    '💳', '🧾', '📅', '🤝', '👨‍👩‍👧‍👦', '👫', '🐾', '❤️', '⭐', '🔥'
];

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 6;
const ITEM_SIZE = width / COLUMN_COUNT;

/**
 * @component EmojiPickerModal
 * Um seletor simples de emojis exibido em um modal com scroll (FlatList).
 * Permite ao usuário escolher um ícone representativo para um grupo ou despesa.
 * É renderizado deslizando de baixo para cima (animação 'slide').
 */
export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({ visible, onClose, onSelect }) => {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.content}>
                    {/* Cabeçalho do Modal */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Escolha um ícone</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Grade de Emojis */}
                    <FlatList
                        data={EMOJIS}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        numColumns={COLUMN_COUNT}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.emojiItem}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={styles.emojiText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.list}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        height: '50%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    list: {
        padding: 10,
    },
    emojiItem: {
        width: ITEM_SIZE - 4,
        height: ITEM_SIZE - 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 32,
    },
});
