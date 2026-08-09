import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const FEATURED_STORY = {
  id: 'featured1',
  title: "'V.I.P. Immunization' for the Powerful and Their Cronies Rattles South America",
  badge: "News of the day",
  image: "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?auto=format&fit=crop&w=800&q=80"
};

const BREAKING_NEWS = [
  {
    id: 'b1',
    title: "Candidate Biden Called Saudi Arabia a 'Pariah.'",
    image: "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?auto=format&fit=crop&w=400&q=80",
    time: "4 hours ago",
    author: "By David E. Sanger"
  },
  {
    id: 'b2',
    title: "Rep. Marjorie Taylor Greene is facing...",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=400&q=80",
    time: "2 hours ago",
    author: "By Rachel Levine"
  }
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: FEATURED_STORY.image }} style={styles.heroImage} />

          {/* Gradient Overlay for better contrast */}
          <View style={styles.heroOverlay} />

          <SafeAreaView style={styles.heroSafeArea} edges={['top']}>
            <TouchableOpacity style={styles.menuIcon}>
              <Ionicons name="menu-outline" size={36} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.heroContent}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{FEATURED_STORY.badge}</Text>
              </View>
              <Text style={styles.heroTitle}>{FEATURED_STORY.title}</Text>

              <TouchableOpacity style={styles.learnMoreContainer} onPress={() => router.push(`/news/${FEATURED_STORY.id}`)}>
                <Text style={styles.learnMoreText}>Learn More</Text>
                <Ionicons name="arrow-forward-outline" size={24} color="#FFFFFF" style={styles.learnMoreIcon} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Breaking News Section */}
        <View style={styles.breakingSectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Breaking News</Text>
            <TouchableOpacity>
              <Text style={styles.moreText}>More</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsContainer}>
            {BREAKING_NEWS.map((item, index) => (
              <TouchableOpacity key={index} style={styles.newsCard} onPress={() => router.push(`/news/${item.id}`)}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardTime}>{item.time}</Text>
                <Text style={styles.cardAuthor}>{item.author}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 120, // Leave some room
  },
  heroContainer: {
    width: width,
    height: 520,
    position: 'relative',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroSafeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingBottom: 45,
  },
  menuIcon: {
    marginTop: 10,
    marginLeft: -4,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  badgeContainer: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 16,
  },
  learnMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMoreText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 6,
  },
  learnMoreIcon: {
    marginTop: 2,
  },
  breakingSectionContainer: {
    marginTop: 35,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  moreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  cardsContainer: {
    paddingHorizontal: 25,
    gap: 15,
  },
  newsCard: {
    width: width * 0.42,
  },
  cardImage: {
    width: '100%',
    height: 110,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 20,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 2,
  },
  cardAuthor: {
    fontSize: 13,
    color: '#999999',
  },
});
