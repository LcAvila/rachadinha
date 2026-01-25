import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';
import { LoginUseCase } from '../../application/usecases/auth/LoginUseCase';
import { RegisterUseCase } from '../../application/usecases/auth/RegisterUseCase';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants/constants';
import { Toast } from '../components/Toast';
import { AnimatedButton } from '../components/AnimatedButton';

type LoginScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenProp>();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    const authRepo = new AuthRepository();
    const loginUseCase = new LoginUseCase(authRepo);
    const registerUseCase = new RegisterUseCase(authRepo);

    const handleAuth = async () => {
        if (!email || !password) {
            setToast({ visible: true, message: 'Preencha todos os campos 🧐', type: 'error' });
            return;
        }
        if (!isLogin && !name) {
            setToast({ visible: true, message: 'Como devemos te chamar? Preencha o nome 😊', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await loginUseCase.execute(email, password);
                setToast({ visible: true, message: 'Login realizado com sucesso! 🎉', type: 'success' });
            } else {
                await registerUseCase.execute(email, password, name);
                setToast({ visible: true, message: 'Sua conta foi criada com sucesso! 🎉', type: 'success' });
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            let message = 'Algo deu errado. Tente novamente.';
            if (error.code === 'auth/invalid-email') message = 'O e-mail digitado não é válido. 📧';
            if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado. Crie uma conta! 👤';
            if (error.code === 'auth/wrong-password') message = 'Senha incorreta. Tente de novo! 🔑';
            if (error.code === 'auth/email-already-in-use') message = 'Esse e-mail já está em uso. Faça login! 😉';

            setToast({ visible: true, message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.header}>
                    {/* Logo Image */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.title}>Rachadinha<Text style={{ fontSize: 16 }}>®</Text></Text>

                    <Text style={styles.welcomeText}>Bem-vindo!</Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.formContainer}>
                    {!isLogin && (
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome"
                                placeholderTextColor={COLORS.textSecondary}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={COLORS.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Senha"
                            placeholderTextColor={COLORS.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <AnimatedButton
                        variant="primary"
                        title={isLogin ? 'Entrar' : 'Cadastrar'}
                        onPress={handleAuth}
                        loading={loading}
                        disabled={loading}
                    />

                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.footerButton}>
                        <Text style={styles.footerText}>
                            {isLogin ? 'Esqueceu senha?' : 'Já possui conta?'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Social Placeholder */}
                <View style={styles.socialContainer}>
                    <Ionicons name="logo-google" size={24} color="#9CA3AF" style={styles.socialIcon} />
                    <Ionicons name="logo-facebook" size={24} color="#9CA3AF" style={styles.socialIcon} />
                    <Ionicons name="logo-apple" size={24} color="#9CA3AF" style={styles.socialIcon} />
                </View>
            </View>

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={() => setToast({ ...toast, visible: false })}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, // Light/White background
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    logoOverlay: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 2,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.accent, // Gold color
        marginBottom: 30,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // Trying to match serif font
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary, // Teal color
    },
    formContainer: {
        width: '100%',
        marginBottom: 40,
    },
    inputContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
    },
    button: {
        backgroundColor: COLORS.primary, // Deep Teal
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footerButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 30,
        marginTop: 20,
    },
    socialIcon: {
        opacity: 0.6,
    }
});
