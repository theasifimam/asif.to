import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme, COLORS } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Precision\nVision.',
    subtitle: 'Expertly crafted frames tailored to your unique style and visual needs.',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
    color: '#E6FBF3'
  },
  {
    id: '2',
    title: 'Modern\nElegance.',
    subtitle: 'Discover our curated collection of designer eyewear for the perfect look.',
    image: 'https://images.unsplash.com/photo-1511499767390-90342f5b89a7?auto=format&fit=crop&q=80&w=800',
    color: '#F8FCFA'
  },
  {
    id: '3',
    title: 'Directly\nDelivered.',
    subtitle: 'Seamless shopping experience from our boutique directly to your doorstep.',
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800',
    color: '#EAF4EF'
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors: theme } = useAppTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/login');
    }
  };

  const skip = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.primarySoft, theme.background, theme.background]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.skipBtn} onPress={skip}>
            <Text style={[styles.skipText, { color: theme.subtext }]}>Skip</Text>
        </TouchableOpacity>

        <FlatList
          data={ONBOARDING_DATA}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <View style={styles.imageBox}>
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.subtitle, { color: theme.subtext }]}>{item.subtitle}</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.footer}>
            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {ONBOARDING_DATA.map((_, i) => {
                    const dotWidth = scrollX.interpolate({
                        inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                        outputRange: [10, 30, 10],
                        extrapolate: 'clamp',
                    });
                    const opacity = scrollX.interpolate({
                        inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });
                    return (
                        <Animated.View 
                            key={i} 
                            style={[
                                styles.dot, 
                                { width: dotWidth, opacity, backgroundColor: theme.primary }
                            ]} 
                        />
                    );
                })}
            </View>

            {/* CTA Button */}
            <TouchableOpacity 
                style={[styles.nextBtn, { backgroundColor: theme.text }]} 
                onPress={scrollToNext}
                activeOpacity={0.9}
            >
                <Text style={[styles.nextText, { color: theme.background }]}>
                    {currentIndex === ONBOARDING_DATA.length - 1 ? "Start Journey" : "Next Step"}
                </Text>
                <View style={[styles.iconCircle, { backgroundColor: theme.background }]}>
                    <Ionicons 
                      name={currentIndex === ONBOARDING_DATA.length - 1 ? "checkmark" : "arrow-forward"} 
                      size={20} 
                      color={theme.text} 
                    />
                </View>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignSelf: 'flex-end',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '700',
  },
  slide: {
    width: width,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  imageBox: {
    width: width * 0.85,
    height: height * 0.42,
    borderRadius: 40,
    overflow: 'hidden',
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    width: '100%',
    marginTop: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    maxWidth: '90%',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  pagination: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  nextBtn: {
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 32,
    paddingRight: 8,
  },
  nextText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
