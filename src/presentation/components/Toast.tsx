import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants/constants';

/**
 * Tipos de feedback visual suportados pelo Toast.
 */
type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Interface para as propriedades do componente Toast.
 */
interface ToastProps {
    /** Controla se o toast deve ser exibido */
    visible: boolean;
    /** Mensagens curtas de feedback ao usuário */
    message: string;
    /** Categoria da mensagem (muda cor e ícone) */
    type?: ToastType;
    /** Tempo em milissegundos antes de desaparecer automaticamente (padrão: 3000ms) */
    duration?: number;
    /** Callback disparado quando o toast termina sua animação de saída */
    onHide?: () => void;
}

/**
 * @component Toast
 * Componente de notificação in-app (feedback flutuante).
 * Aparece no topo da tela com uma animação de deslize e desvanecimento.
 * Ideal para mensagens de sucesso, erro ou avisos rápidos.
 */
export const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type = 'info',
    duration = 3000,
    onHide
}) => {
    // Valores de animação para posição vertical e opacidade
    const translateY = React.useRef(new Animated.Value(-100)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Animação de Entrada
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();

            // Agenda o fechamento automático
            const timer = setTimeout(() => {
                // Animação de Saída
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: -100,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    })
                ]).start(() => {
                    onHide?.(); // Chama callback após sumir da tela
                });
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible, duration, onHide]);

    if (!visible) return null;

    /**
     * Define o ícone com base no tipo da mensagem.
     */
    const getIcon = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'close-circle';
            case 'warning': return 'warning';
            case 'info': return 'information-circle';
        }
    };

    /**
     * Define a cor de fundo com base no tipo da mensagem.
     */
    const getColor = () => {
        switch (type) {
            case 'success': return COLORS.success;
            case 'error': return '#FF4D4D';
            case 'warning': return COLORS.warning;
            case 'info': return COLORS.primary;
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                    backgroundColor: getColor()
                }
            ]}
        >
            <Ionicons name={getIcon() as any} size={24} color="#FFF" />
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50, // Exibe abaixo da barra de status na maioria dos dispositivos
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    message: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
});
