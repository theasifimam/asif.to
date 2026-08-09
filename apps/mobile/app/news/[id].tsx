import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');

const ARTICLE = {
  id: '1',
  title: 'How Meaningful Is Prediabetes for Older Adults?',
  summary: 'A new study indicates that the condition might be less of a worry than once believed.',
  category: 'Health',
  author: {
    name: 'Michael S.',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80'
  },
  time: '2 h',
  views: '376',
  image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80', // Older woman image
  contentTitle: 'Candidate Biden Called Saudi',
  content: "Capture the beauty that catches your eye with a mirrorless camera that you don't want to lose. Capture the beauty that catches your eye with a mirrorless camera that you don't want to lose. Capture the beauty that catches your eye with a mirrorless camera that you don't want to lose.",
};

const SUGGESTED = [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1576091160550-217359f49f4c?auto=format&fit=crop&w=400&q=80'
];

export default function ArticleDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Image source={{ uri: ARTICLE.image }} style={styles.headerImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
            style={styles.gradient}
          />
          
          <SafeAreaView style={styles.headerOverlay} edges={['top']}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.titleInfo}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{ARTICLE.category}</Text>
                </View>
                <Text style={styles.title}>{ARTICLE.title}</Text>
                <Text style={styles.summary}>{ARTICLE.summary}</Text>
            </View>
          </SafeAreaView>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
            {/* Meta Row */}
            <View style={styles.metaRow}>
                <View style={styles.authorPill}>
                    <Image source={{ uri: ARTICLE.author.image }} style={styles.authorImg} />
                    <Text style={styles.authorName}>{ARTICLE.author.name}</Text>
                </View>
                
                <View style={styles.metaCapsule}>
                    <Ionicons name="time-outline" size={18} color="#999" />
                    <Text style={styles.metaText}>{ARTICLE.time}</Text>
                </View>

                <View style={styles.metaCapsule}>
                    <Ionicons name="eye-outline" size={18} color="#999" />
                    <Text style={styles.metaText}>{ARTICLE.views}</Text>
                </View>
            </View>

            {/* Article Content */}
            <View style={styles.mainContent}>
                <Text style={styles.contentTitle}>{ARTICLE.contentTitle}</Text>
                <Text style={styles.bodyText}>{ARTICLE.content}</Text>
            </View>

            {/* Suggested Images */}
            <View style={styles.suggestedContainer}>
                {SUGGESTED.map((img, idx) => (
                    <Image key={idx} source={{ uri: img }} style={styles.suggestedImage} />
                ))}
            </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    width: width,
    height: height * 0.55,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 25,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleInfo: {
    gap: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  summary: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -35,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 60,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 35,
  },
  authorPill: {
    backgroundColor: '#121212',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
    gap: 8,
  },
  authorImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  authorName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  metaCapsule: {
    backgroundColor: '#F7F7F7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 6,
    minWidth: 70,
    justifyContent: 'center',
  },
  metaText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  mainContent: {
    marginBottom: 25,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#666',
  },
  suggestedContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  suggestedImage: {
    flex: 1,
    height: 120,
    borderRadius: 20,
  }
});
