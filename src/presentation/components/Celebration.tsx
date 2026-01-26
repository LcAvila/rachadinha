
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width, height } = Dimensions.get('window');

export interface CelebrationHandle {
    start: () => void;
}

export const Celebration = forwardRef<CelebrationHandle, {}>((props, ref) => {
    const explosionRef = useRef<ConfettiCannon>(null);
    const rainRef = useRef<ConfettiCannon>(null);

    useImperativeHandle(ref, () => ({
        start: () => {
            explosionRef.current?.start();
            setTimeout(() => {
                rainRef.current?.start();
            }, 500);
        }
    }));

    return (
        <View style={styles.container} pointerEvents="none">
            {/* Explosion from center */}
            <ConfettiCannon
                ref={explosionRef}
                count={50}
                origin={{ x: width / 2, y: height / 2 }}
                autoStart={false}
                fadeOut={true}
                fallSpeed={2000}
                explosionSpeed={500}
            />

            {/* Rain from top */}
            <ConfettiCannon
                ref={rainRef}
                count={100}
                origin={{ x: -10, y: 0 }}
                autoStart={false}
                fadeOut={true}
                fallSpeed={3000}
                explosionSpeed={0} // No explosion, just fall
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
        zIndex: 9999, // Ensure it's on top
    },
});
