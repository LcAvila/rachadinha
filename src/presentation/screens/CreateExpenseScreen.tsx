import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ExpenseRepository } from '../../infrastructure/firebase/ExpenseRepository';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';
import { CreateExpenseUseCase } from '../../application/usecases/expenses/CreateExpenseUseCase';
import { COLORS } from '../../core/constants/constants';
import { formatCurrencyInput, parseCurrencyInput } from '../../core/utils/currencyInput';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../infrastructure/firebase/config';
import { Toast } from '../components/Toast';

type CreateExpenseScreenProp = StackNavigationProp<RootStackParamList, 'CreateExpense'>;

/**
 * @component CreateExpenseScreen
 * Tela inicial de criação de uma despesa.
 * Define o título, taxas, descontos e imagem da NF.
 * Próximo passo: AddItemsScreen.
 */
export const CreateExpenseScreen = () => {
    const navigation = useNavigation<CreateExpenseScreenProp>();
    const insets = useSafeAreaInsets();

    // Estados do formulário
    const [title, setTitle] = useState('');
    const [deliveryFee, setDeliveryFee] = useState('');
    const [serviceFee, setServiceFee] = useState('');
    const [discount, setDiscount] = useState('');
    const [image, setImage] = useState<string | null>(null);

    // Estados de UI/Processamento
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    /**
     * Abre a galeria para selecionar uma imagem (Nota Fiscal).
     */
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Erro', 'Precisamos de permissão para acessar suas fotos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, // Permite crop
            quality: 0.7, // Reduz tamanho
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    /**
     * Faz upload da imagem selecionada para o Firebase Storage.
     * @param uri URI local da imagem.
     * @returns URL pública da imagem.
     */
    const uploadImage = async (uri: string): Promise<string | undefined> => {
        return new Promise((resolve, reject) => {
            setUploading(true);
            const xhr = new XMLHttpRequest();
            xhr.onload = async () => {
                try {
                    const blob = xhr.response;
                    const filename = `invoices/${Date.now()}.jpg`;
                    const storageRef = ref(storage, filename);
                    await uploadBytes(storageRef, blob);
                    const url = await getDownloadURL(storageRef);
                    resolve(url);
                } catch (error) {
                    console.error('Error in xhr.onload:', error);
                    reject(error);
                }
            };
            xhr.onerror = (e) => {
                console.error('XHR Error:', e);
                reject(new TypeError('Network request failed'));
            };
            xhr.responseType = 'blob'; // Importante para upload de arquivos
            xhr.open('GET', uri, true);
            xhr.send(null);
        }).finally(() => {
            setUploading(false);
        }) as Promise<string | undefined>;
    };

    /**
     * Cria a despesa inicial e navega para adicionar itens.
     */
    const handleCreate = async () => {
        if (!title) {
            setToast({ visible: true, message: 'O título é obrigatório', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const authRepo = new AuthRepository();
            const user = await authRepo.getCurrentUser();
            if (!user) {
                setToast({ visible: true, message: 'Usuário não autenticado', type: 'error' });
                return;
            }

            let invoiceUrl = undefined;
            if (image) {
                invoiceUrl = await uploadImage(image);
            }

            const expenseRepo = new ExpenseRepository();
            const createUseCase = new CreateExpenseUseCase(expenseRepo);

            const expense = await createUseCase.execute({
                title,
                createdBy: user.id,
                createdByName: user.name,
                deliveryFee: parseCurrencyInput(deliveryFee),
                serviceFee: parseCurrencyInput(serviceFee),
                discount: parseCurrencyInput(discount),
                totalAmount: 0, // Será calculado com os itens
                invoiceUrl: invoiceUrl || null,
                involvedUserIds: [] // Inicialmente vazio
            });

            setToast({ visible: true, message: 'Despesa criada com sucesso! 🎉', type: 'success' });

            // Navega para a tela de adicionar itens
            setTimeout(() => {
                navigation.replace('AddItems', { expenseId: expense.id });
            }, 1000);

        } catch (error: any) {
            setToast({ visible: true, message: error.message || 'Erro ao criar despesa', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]} style={{ backgroundColor: '#F8FAFC' }}>
                <TouchableOpacity
                    style={[styles.backButton, { top: insets.top + 10 }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>

                <View style={[styles.header, { marginTop: insets.top + 20 }]}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="receipt" size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Nova Despesa</Text>
                    <Text style={styles.subtitle}>Divida a conta de forma justa and rápida.</Text>
                </View>

                <View style={styles.form}>
                    {/* Título */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Título da Despesa</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="bookmark-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Jantar no Outback"
                                placeholderTextColor={COLORS.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                    </View>

                    {/* Taxas */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Taxa/Entrega</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.currencyPrefix}>R$</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0,00"
                                    placeholderTextColor={COLORS.textSecondary}
                                    keyboardType="numeric"
                                    value={deliveryFee}
                                    onChangeText={(text) => setDeliveryFee(formatCurrencyInput(text))}
                                />
                            </View>
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Serviço (10%)</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.currencyPrefix}>R$</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0,00"
                                    placeholderTextColor={COLORS.textSecondary}
                                    keyboardType="numeric"
                                    value={serviceFee}
                                    onChangeText={(text) => setServiceFee(formatCurrencyInput(text))}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Desconto */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Desconto ou Cupom</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="pricetag-outline" size={20} color={COLORS.success} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="R$ 0,00"
                                placeholderTextColor={COLORS.textSecondary}
                                keyboardType="numeric"
                                value={discount}
                                onChangeText={(text) => setDiscount(formatCurrencyInput(text))}
                            />
                        </View>
                    </View>

                    {/* Upload de Nota Fiscal */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nota Fiscal (Upload)</Text>
                        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                            <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.uploadText}>{image ? 'Nota Selecionada ✅' : 'Selecionar Imagem'}</Text>
                        </TouchableOpacity>
                        {image && (
                            <View style={styles.previewContainer}>
                                <Image source={{ uri: image }} style={styles.previewImage} />
                                <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}>
                                    <Ionicons name="close-circle" size={24} color={COLORS.error || '#FF4D4D'} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Botão de Continuar */}
                    <TouchableOpacity
                        style={[styles.button, (loading || uploading) && { opacity: 0.7 }]}
                        onPress={handleCreate}
                        disabled={loading || uploading}
                        activeOpacity={0.8}
                    >
                        {(loading || uploading) ? (
                            <ActivityIndicator color='#FFF' />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Continuar para Itens</Text>
                                <Ionicons name="chevron-forward" size={20} color="#FFF" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <Toast
                    visible={toast.visible}
                    message={toast.message}
                    type={toast.type}
                    onHide={() => setToast({ ...toast, visible: false })}
                />
            </ScrollView >
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        maxWidth: '80%',
    },
    form: { gap: 20 },
    row: { flexDirection: 'row', gap: 16 },
    inputGroup: { width: '100%' },
    label: {
        color: COLORS.text,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        height: 58,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    currencyPrefix: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
        marginRight: 6,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    buttonText: { color: '#FFF', fontWeight: '800', fontSize: 18 },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        padding: 16,
        marginTop: 4,
    },
    uploadText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 15,
    },
    previewContainer: {
        marginTop: 12,
        alignItems: 'center',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    removeImage: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#FFF',
        borderRadius: 12,
    },
});
