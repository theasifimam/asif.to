import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, useAppTheme } from '../../constants/Theme';
import { useRouter } from 'expo-router';
import { MOCK_NEWS } from '../../data/news';

export default function BookmarksScreen() {
  const { colors: theme } = useAppTheme();
  const router = useRouter();

  const savedNews = MOCK_NEWS.slice(0, 2); // Mocking saved items

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Bookmarks</Text>
        </View>

        {savedNews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={80} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>No saved articles yet.</Text>
          </View>
        ) : (
          <FlatList
            data={savedNews}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.newsItemContainer} 
                activeOpacity={0.8}
                onPress={() => router.push(`/news/${item.id}`)}
              >
                <Image source={{ uri: item.image }} style={styles.newsItemImage} />
                <View style={styles.newsItemContent}>
                  <Text style={[styles.newsItemCategory, { color: theme.subtext }]}>{item.category}</Text>
                  <Text style={[styles.newsItemTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.newsItemMeta}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="time-outline" size={14} color={theme.subtext} />
                      <Text style={[styles.newsItemDate, { color: theme.subtext }]}>{item.date}</Text>
                    </View>
                    <TouchableOpacity>
                       <Ionicons name="bookmark" size={20} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 10, paddingBottom: 20 },
  title: { fontSize: 32, fontWeight: '700' },
  listContent: { paddingBottom: 120 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, marginTop: 20 },
  newsItemContainer: { flexDirection: 'row', paddingHorizontal: SIZES.paddingHorizontal, marginBottom: 20, gap: 15 },
  newsItemImage: { width: 100, height: 100, borderRadius: 16 },
  newsItemContent: { flex: 1, justifyContent: 'center' },
  newsItemCategory: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 6 },
  newsItemTitle: { fontSize: 17, fontWeight: '700', lineHeight: 24, marginBottom: 10 },
  newsItemMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  newsItemDate: { fontSize: 13 },
});
