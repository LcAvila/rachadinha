import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GroupRepository } from '../../infrastructure/firebase/GroupRepository';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';
import { CreateGroupUseCase } from '../../application/usecases/groups/CreateGroupUseCase';
import { COLORS } from '../../core/constants/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const CreateGroupScreen = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const groupRepo = new GroupRepository();
    const authRepo = new AuthRepository();
    const createGroupUseCase = new CreateGroupUseCase(groupRepo);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Ops', 'Dê um nome para o seu grupo!');
            return;
        }

        setLoading(true);
        try {
            const user = await authRepo.getCurrentUser();
            if (user) {
                await createGroupUseCase.execute(name, user.id, description);
                Alert.alert('Sucesso', 'Grupo criado com sucesso! 🎉', [
                    { text: 'Legal!', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível criar o grupo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Novo Grupo</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.content}>
                    <View style={styles.iconSection}>
                        <TouchableOpacity style={styles.iconCircle}>
                            <Ionicons name="camera" size={30} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.iconText}>Foto do Grupo</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nome do Grupo</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="people-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Família & Amigos"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Descrição (Opcional)</Text>
                            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                                <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} style={[styles.inputIcon, { marginTop: 16, alignSelf: 'flex-start' }]} />
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Sobre o que é este grupo?"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.createButton, loading && { opacity: 0.7 }]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Text style={styles.createText}>Criar Grupo</Text>
                            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    scrollContent: { flexGrow: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    title: { fontSize: 22, fontWeight: '900', color: COLORS.text },
    content: { paddingHorizontal: 24, flex: 1 },
    iconSection: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    iconText: { color: COLORS.primary, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    form: { gap: 24 },
    inputGroup: { width: '100%' },
    label: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        height: 58,
    },
    textAreaWrapper: {
        height: 120,
        alignItems: 'flex-start',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500',
    },
    textArea: {
        paddingTop: 16,
        height: '100%',
        textAlignVertical: 'top'
    },
    footer: {
        padding: 24,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    createButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        height: 58,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    createText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
});
