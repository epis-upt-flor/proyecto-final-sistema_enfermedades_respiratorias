/**
 * SimpleChart Component
 * 
 * Componente simple para gráficos de analytics clínicos usando react-native-chart-kit
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 32; // Padding lateral

interface SimpleChartProps {
  title: string;
  subtitle?: string;
  type: 'line' | 'bar' | 'pie';
  data: any;
  height?: number;
  showLegend?: boolean;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  title,
  subtitle,
  type,
  data,
  height = 220,
  showLegend = true,
}) => {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#1976d2',
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            width={chartWidth}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withDots={true}
            withShadow={false}
          />
        );
      case 'bar':
        return (
          <BarChart
            data={data}
            width={chartWidth}
            height={height}
            chartConfig={chartConfig}
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            showValuesOnTopOfBars={true}
            fromZero={true}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={data}
            width={chartWidth}
            height={height}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
            absolute={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>{title}</Title>
        {subtitle && <Paragraph style={styles.subtitle}>{subtitle}</Paragraph>}
        <View style={styles.chartContainer}>
          {renderChart()}
        </View>
        {showLegend && type === 'pie' && data.legend && (
          <View style={styles.legend}>
            {data.legend.map((item: any, index: number) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: item.color || '#1976d2' },
                  ]}
                />
                <Paragraph style={styles.legendText}>{item.name}</Paragraph>
              </View>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

