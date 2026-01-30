import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width, height } = Dimensions.get('window');

/**
 * Interface para os métodos expostos pelo componente Celebration através do useImperativeHandle.
 */
export interface CelebrationHandle {
    /** Inicia a animação de celebração com confetes */
    start: () => void;
}

/**
 * @component Celebration
 * Componente responsável por exibir animações de confetes.
 * Utiliza dois canhões de confete: um de explosão central e outro de chuva constante do topo.
 * Pode ser disparado externamente via referência (Ref).
 */
export const Celebration = forwardRef<CelebrationHandle, {}>((props, ref) => {
    // Referências para os canhões de confete
    const explosionRef = useRef<ConfettiCannon>(null);
    const rainRef = useRef<ConfettiCannon>(null);

    // Expõe o método 'start' para o componente pai
    useImperativeHandle(ref, () => ({
        start: () => {
            // Dispara a explosão central imediatamente
            explosionRef.current?.start();

            // Dispara a chuva vinda do topo após um breve delay
            setTimeout(() => {
                rainRef.current?.start();
            }, 500);
        }
    }));

    return (
        <View style={styles.container} pointerEvents="none">
            {/* Explosão a partir do centro da tela */}
            <ConfettiCannon
                ref={explosionRef}
                count={50}
                origin={{ x: width / 2, y: height / 2 }}
                autoStart={false}
                fadeOut={true}
                fallSpeed={2000}
                explosionSpeed={500}
            />

            {/* Chuva de confetes caindo do topo */}
            <ConfettiCannon
                ref={rainRef}
                count={100}
                origin={{ x: -10, y: 0 }}
                autoStart={false}
                fadeOut={true}
                fallSpeed={3000}
                explosionSpeed={0} // Sem explosão, apenas queda livre
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999, // Garante que fique acima de todos os outros elementos da UI
    },
});
