import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const CATEGORIES = ["Health", "Politics", "Art", "Food", "Science", "Tech"];

const DISCOVER_NEWS = [
  {
    id: 'd1',
    title: "Candidate Biden Called Saudi Arabia a 'Pariah.'",
    image: "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?auto=format&fit=crop&w=400&q=80",
    time: "4 hours ago",
    views: "376 views"
  },
  {
    id: 'd2',
    title: "A New Coronavirus Variant Is Spreading in New York",
    image: "https://images.unsplash.com/photo-1584483766114-2cea6fc6ceee?auto=format&fit=crop&w=400&q=80",
    time: "6 hours ago",
    views: "1006 views"
  },
  {
    id: 'd3',
    title: "Studies Examine Variant Surging in California",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=400&q=80",
    time: "10 hours ago",
    views: "106 views"
  },
  {
    id: 'd4',
    title: "A New Coronavirus Variant Is Spreading",
    image: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?auto=format&fit=crop&w=400&q=80",
    time: "12 hours ago",
    views: "234 views"
  }
];

export default function ExploreScreen() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const router = useRouter();

  const renderHeader = () => (
    <View style={styles.headerComponent}>
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="menu-outline" size={32} color="#000" />
      </TouchableOpacity>

      <Text style={styles.discoverTitle}>Discover</Text>
      <Text style={styles.discoverSubtitle}>News from all over the world</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput 
                placeholder="Search" 
                placeholderTextColor="#999"
                style={styles.searchInput}
            />
            <TouchableOpacity>
                <Ionicons name="options-outline" size={20} color="#999" />
            </TouchableOpacity>
        </View>
      </View>

      {/* Categories Row */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoryRow}
        renderItem={({ item }) => {
            const isActive = activeCategory === item;
            return (
                <TouchableOpacity 
                    style={styles.categoryTab} 
                    onPress={() => setActiveCategory(item)}
                >
                    <Text style={[styles.categoryTabText, isActive && styles.activeCategoryText]}>
                        {item}
                    </Text>
                    {isActive && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
            );
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <FlatList
          ListHeaderComponent={renderHeader}
          data={DISCOVER_NEWS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
                style={styles.newsItem} 
                activeOpacity={0.8}
                onPress={() => router.push(`/news/${item.id}`)}
            >
              <Image source={{ uri: item.image }} style={styles.newsImage} />
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color="#999" />
                        <Text style={styles.metaText}>{item.time}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="eye-outline" size={14} color="#999" />
                        <Text style={styles.metaText}>{item.views}</Text>
                    </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 100,
  },
  headerComponent: {
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  menuButton: {
    marginBottom: 20,
    marginLeft: -5,
  },
  discoverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  discoverSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  },
  searchContainer: {
    marginBottom: 30,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  categoryRow: {
    paddingBottom: 10,
    gap: 25,
    marginBottom: 20,
  },
  categoryTab: {
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 8,
  },
  categoryTabText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#BBB',
  },
  activeCategoryText: {
    color: '#000',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 3,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  newsItem: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    marginBottom: 25,
    gap: 15,
    alignItems: 'center',
  },
  newsImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  newsContent: {
    flex: 1,
    gap: 8,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  }
});
