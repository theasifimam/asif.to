import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Dimensions, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ProductCard } from '../components/ui/ProductCard';
import { MOCK_PRODUCTS, CATEGORIES } from '../data/products';
import { useAppTheme, SHADOWS, SIZES } from '../constants/Theme';

const { width } = Dimensions.get('window');

const SORT_OPTIONS = ['Newest', 'Price: Low', 'Price: High', 'Rating'];
const POPULAR_TAGS = ['Aviator', 'Vintage', 'Blue Light', 'Designer', 'Sports', 'Wayfarer'];
const INITIAL_RECENT = ['Classic Aviators', 'Men\'s Designer', 'Women\'s Blue Light'];

export default function SearchScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams();
  const { colors: theme } = useAppTheme();
  
  const [searchQuery, setSearchQuery] = useState((q as string) || '');
  const [activeSort, setActiveSort] = useState('Newest');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recentSearches, setRecentSearches] = useState(INITIAL_RECENT);
  const [isSearching, setIsSearching] = useState(false);

  // Animation for search results
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesQuery && matchesCategory;
  }).sort((a, b) => {
    if (activeSort === 'Price: Low') return a.price - b.price;
    if (activeSort === 'Price: High') return b.price - a.price;
    if (activeSort === 'Rating') return b.rating - a.rating;
    return 0; // Default Newest (mocked)
  });

  useEffect(() => {
    if (searchQuery.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [searchQuery]);

  const handleSearchCommit = (q: string) => {
    if (!q.trim()) return;
    if (!recentSearches.includes(q)) {
      setRecentSearches(prev => [q, ...prev.slice(0, 4)]);
    }
    setSearchQuery(q);
  };

  const removeRecent = (item: string) => {
    setRecentSearches(prev => prev.filter(q => q !== item));
  };

  const clearAllRecent = () => setRecentSearches([]);

  const renderHeader = () => (
    <View style={styles.headerContent}>
        {/* Search Bar Row */}
        <View style={styles.searchRow}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: theme.card }]} 
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <View style={[styles.searchInputContainer, { 
                backgroundColor: theme.card, 
                borderColor: isSearching ? theme.primary : theme.border,
                borderWidth: isSearching ? 1.5 : 1
            }]}>
                <Ionicons name="search" size={20} color={isSearching ? theme.primary : theme.subtext} style={styles.searchIcon} />
                <TextInput 
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Search spectacles..."
                  placeholderTextColor={theme.subtext}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearching(true)}
                  onBlur={() => setIsSearching(false)}
                  onSubmitEditing={() => handleSearchCommit(searchQuery)}
                  autoFocus={!q}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={theme.subtext} />
                    </TouchableOpacity>
                )}
            </View>
        </View>

        {searchQuery.length === 0 ? (
          /* Discovery Sections */
          <View style={styles.discoverySection}>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearAllRecent}>
                    <Text style={[styles.clearText, { color: theme.primary }]}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
                  {recentSearches.map((item, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[styles.recentChip, { backgroundColor: theme.card, borderColor: theme.border }]}
                      onPress={() => handleSearchCommit(item)}
                    >
                      <Ionicons name="time-outline" size={14} color={theme.subtext} />
                      <Text style={[styles.recentChipText, { color: theme.text }]}>{item}</Text>
                      <TouchableOpacity onPress={() => removeRecent(item)}>
                        <Ionicons name="close" size={14} color={theme.subtext} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Popular Tags */}
            <View style={styles.popularSection}>
              <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Popular Searches</Text>
              <View style={styles.tagsGrid}>
                {POPULAR_TAGS.map(tag => (
                  <TouchableOpacity 
                    key={tag} 
                    style={[styles.tagPill, { backgroundColor: theme.accent }]}
                    onPress={() => handleSearchCommit(tag)}
                  >
                    <Text style={[styles.tagText, { color: theme.primaryDark }]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Browse Categories */}
            <View style={styles.categoryDiscovery}>
               <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Browse Categories</Text>
               <View style={styles.bentoCategoryGrid}>
                  {CATEGORIES.filter(c => c !== 'All').slice(0, 4).map((cat, idx) => (
                    <TouchableOpacity 
                      key={cat} 
                      style={[
                        styles.bentoCat, 
                        { backgroundColor: idx % 2 === 0 ? theme.primarySoft : theme.card, borderColor: theme.border },
                        idx === 0 && { width: '60%' },
                        idx === 1 && { width: '35%' }
                      ]}
                      onPress={() => {
                        setSelectedCategory(cat);
                        setSearchQuery(cat);
                      }}
                    >
                       <Text style={[styles.bentoCatName, { color: theme.text }]}>{cat}</Text>
                       <Ionicons name="arrow-forward-circle-outline" size={20} color={theme.primary} style={styles.bentoIcon} />
                    </TouchableOpacity>
                  ))}
               </View>
            </View>
          </View>
        ) : (
          /* Search Results & Filters Section */
          <Animated.View style={[styles.resultsHeader, { opacity: fadeAnim }]}>
              {/* Sorting & Filter Horizontal Scroll */}
              <View style={styles.filterRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                      <TouchableOpacity 
                        style={[styles.filterActionBtn, { backgroundColor: theme.text }]}
                      >
                          <Ionicons name="options-outline" size={18} color={theme.background} />
                          <Text style={[styles.filterActionText, { color: theme.background }]}>Filters</Text>
                      </TouchableOpacity>
                      
                      <View style={[styles.divider, { backgroundColor: theme.border }]} />

                      {SORT_OPTIONS.map(opt => (
                          <TouchableOpacity 
                              key={opt}
                              onPress={() => setActiveSort(opt)}
                              style={[
                                  styles.sortPill, 
                                  { backgroundColor: theme.card, borderColor: theme.border },
                                  activeSort === opt && { backgroundColor: theme.accent, borderColor: theme.primary }
                              ]}
                          >
                              <Text style={[
                                  styles.sortPillText, 
                                  { color: activeSort === opt ? theme.primaryDark : theme.subtext }
                              ]}>{opt}</Text>
                          </TouchableOpacity>
                      ))}
                  </ScrollView>
              </View>

              <View style={styles.resultsInfo}>
                <Text style={[styles.resultsCount, { color: theme.subtext }]}>{filteredProducts.length} Results found</Text>
                <TouchableOpacity onPress={() => setSelectedCategory('All')}>
                  <Text style={[styles.clearFilterText, { color: theme.primary }]}>Clear All</Text>
                </TouchableOpacity>
              </View>
          </Animated.View>
        )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[theme.primarySoft, theme.background, theme.background, theme.primarySoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
        <FlatList
          data={searchQuery.length > 0 ? filteredProducts : []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Animated.View style={{ opacity: fadeAnim }}>
              <ProductCard 
                  product={item} 
                  style={styles.cardWrapper} 
                  onPress={() => router.push(`/product/${item.id}`)}
                  onLike={() => {}}
              />
            </Animated.View>
          )}
          ListEmptyComponent={
            searchQuery.length > 0 ? (
              <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={80} color={theme.border} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>No Results</Text>
                  <Text style={[styles.emptySub, { color: theme.subtext }]}>We couldn't find anything matching "{searchQuery}"</Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContent: {
    paddingTop: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  discoverySection: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentSection: {
    marginBottom: 32,
  },
  recentScroll: {
    gap: 10,
    paddingRight: 24,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
  },
  recentChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  popularSection: {
    marginBottom: 32,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryDiscovery: {
    marginBottom: 40,
  },
  bentoCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bentoCat: {
    height: 80,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    width: '48%',
  },
  bentoCatName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  bentoIcon: {
    alignSelf: 'flex-end',
  },
  resultsHeader: {
    paddingTop: 0,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
  },
  filterActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  filterActionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 4,
  },
  sortPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearFilterText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 40,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  cardWrapper: {
    width: (width - 48 - 16) / 2,
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  }
});
