import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Button, Card, Paragraph, Title } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../services/i18nService';

const { width } = Dimensions.get('window');

const keys = [
  { key: 'symptoms', titleKey: 'onboarding.symptomsTitle', textKey: 'onboarding.symptomsText' },
  { key: 'appointments', titleKey: 'onboarding.appointmentsTitle', textKey: 'onboarding.appointmentsText' },
  { key: 'alerts', titleKey: 'onboarding.alertsTitle', textKey: 'onboarding.alertsText' },
] as const;

const DOT_SIZE = 8;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState(0);

  const goNext = () => {
    const next = index + 1;
    if (next < slides.length) {
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    } else {
      finish();
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const pos = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(pos);
        }}
      >
        {keys.map((s) => (
          <View key={s.key} style={{ width, padding: 24 }}>
            <Card style={{ flex: 1, justifyContent: 'center' }}>
              <Card.Content>
                <Title style={styles.title}>{t(s.titleKey)}</Title>
                <Paragraph style={styles.text}>{t(s.textKey)}</Paragraph>
              </Card.Content>
            </Card>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {keys.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: i === index ? 1 : 0.3, width: i === index ? DOT_SIZE * 2 : DOT_SIZE },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button mode="text" onPress={finish}>
          {t('onboarding.skip')}
        </Button>
        <Button mode="contained" onPress={goNext}>
          {index === keys.length - 1 ? t('onboarding.start') : t('common.next')}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, marginBottom: 12 },
  text: { fontSize: 16, lineHeight: 22 },
  dots: {
    position: 'absolute',
    bottom: 72,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#1976d2',
    marginHorizontal: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default OnboardingScreen;


