import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../data/products';
import { useAppTheme, SIZES, SHADOWS, COLORS } from '../../constants/Theme';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onLike: () => void;
  style?: any;
}

export const ProductCard = ({ product, onPress, onLike, style }: ProductCardProps) => {
  const { colors: theme } = useAppTheme();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isFavorite = wishlistItems.some((item) => item.id === product.id);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.imageContainer, { backgroundColor: theme.background }]}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity 
          style={[styles.favoriteButton, { backgroundColor: theme.card }]} 
          onPress={(e) => {
            e.stopPropagation();
            onLike();
          }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? theme.destructive : theme.text}
          />
        </TouchableOpacity>

        <View style={[styles.pricePill, { backgroundColor: theme.primary }]}>
          <Text style={[styles.priceText, { color: theme.background }]}>₹{product.price}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{product.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={[styles.ratingText, { color: theme.subtext }]}>{product.rating}</Text>
            <Ionicons name="star" size={12} color={theme.rating} />
          </View>
        </View>
        <Text style={[styles.categorySubtext, { color: theme.subtext }]}>{product.category}'s Top</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginBottom: 24,
    width: '100%',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    borderRadius: 24,
    backgroundColor: COLORS.background,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // ...SHADOWS.soft,
  },
  pricePill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    paddingTop: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.tertiary,
    fontWeight: '500',
  },
  categorySubtext: {
    fontSize: 12,
    color: COLORS.tertiary,
  },
});
