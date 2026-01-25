import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants/constants';

type StatusOption = {
    label: string;
    value: 'draft' | 'waiting_payment' | 'paid';
    icon: string;
    color: string;
};

interface StatusModalProps {
    visible: boolean;
    currentStatus: 'draft' | 'waiting_payment' | 'paid';
    onSelect: (status: 'draft' | 'waiting_payment' | 'paid') => void;
    onCancel: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({ visible, currentStatus, onSelect, onCancel }) => {
    const options: StatusOption[] = [
        { label: 'Rascunho', value: 'draft', icon: 'create-outline', color: COLORS.textSecondary },
        { label: 'Aguardando Pagamento', value: 'waiting_payment', icon: 'time-outline', color: COLORS.warning },
        { label: 'Pago', value: 'paid', icon: 'checkmark-circle', color: COLORS.success },
    ];

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Alterar Status</Text>
                    {options.map(opt => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[styles.option, opt.value === currentStatus && { backgroundColor: opt.color + '20' }]}
                            onPress={() => onSelect(opt.value)}
                        >
                            <Ionicons name={opt.icon as any} size={20} color={opt.color} />
                            <Text style={styles.optionText}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 12,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        width: '100%',
        marginBottom: 8,
    },
    optionText: {
        marginLeft: 8,
        fontSize: 16,
        color: COLORS.text,
    },
    cancelButton: {
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cancelText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});
