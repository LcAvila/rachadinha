
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../core/constants/constants';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface ChartData {
    label: string;
    value: number;
}

interface SpendingChartProps {
    data: ChartData[];
}

export const SpendingChart = ({ data }: SpendingChartProps) => {
    if (data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Sem dados para exibir</Text>
            </View>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const maxHeight = 150;

    return (
        <View style={styles.container}>
            <View style={styles.chartArea}>
                {data.map((item, index) => {
                    const height = maxValue > 0 ? (item.value / maxValue) * maxHeight : 0;
                    return (
                        <View key={index} style={styles.barContainer}>
                            <Animated.View
                                entering={FadeInUp.delay(index * 50)}
                                style={[styles.bar, { height: height || 4 }]}
                            />
                            <Text style={styles.label}>{item.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 16,
        // shadow/elevation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    emptyContainer: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
    },
    chartArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 180,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    bar: {
        width: '40%',
        backgroundColor: COLORS.primary,
        borderRadius: 6,
        minHeight: 4,
    },
    label: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    }
});
