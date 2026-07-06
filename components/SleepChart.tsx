import { StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/colors';

type DayData = {
  day: string;
  hours: number;
  score: number;
};

type Props = {
  data: DayData[];
};

export function SleepChart({ data }: Props) {
  const barData = data.map((d) => ({
    value: d.hours,
    label: d.day,
    frontColor: d.hours >= 7 ? Colors.primary : '#334155',
    topLabelComponent: () => (
      <ThemedText style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>
        {d.hours}
      </ThemedText>
    ),
  }));

  return (
    <View style={styles.wrapper}>
      <BarChart
        data={barData}
        barWidth={32}
        spacing={12}
        roundedTop
        hideRules
        hideYAxisText
        xAxisColor="#334155"
        yAxisColor="#334155"
        noOfSections={4}
        maxValue={12}
        isAnimated
        animationDuration={600}
      />
      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
        <ThemedText style={styles.legendText}>≥ 7 jam (target)</ThemedText>
        <View style={[styles.dot, { backgroundColor: '#334155', marginLeft: 12 }]} />
        <ThemedText style={styles.legendText}>Kurang</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#64748b' },
});
