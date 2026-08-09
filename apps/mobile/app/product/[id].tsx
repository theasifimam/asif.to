import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { MOCK_PRODUCTS } from '../../data/products';
import { SHADOWS, useAppTheme, SIZES } from '../../constants/Theme';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { showToast } from '../../store/slices/toastSlice';

const { width, height } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors: theme } = useAppTheme();
  
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  const isFavorite = wishlistItems.some((item) => item.id === product?.id);

  const handleToggleWishlist = () => {
    if (!product) return;
    dispatch(toggleWishlist(product));
    dispatch(showToast({ 
      message: isFavorite ? "Removed from collection" : "Added to collection", 
      type: isFavorite ? 'info' : 'success' 
    }));
  };
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedReviewImages, setSelectedReviewImages] = useState<string[]>([]);
  
  const colors = [theme.text, '#8D8D8D', '#00D084', '#FF3B30'];
  const sizes = ['S', 'M', 'L', 'XL'];

  // Mock reviews
  const [reviewsList, setReviewsList] = useState([
    {
      id: '1',
      user: 'Sarah J.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      rating: 5,
      date: '2 days ago',
      description: 'The frames are incredibly light and the build quality is top-notch. Highly recommended!',
      images: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800']
    },
    {
      id: '2',
      user: 'Michael R.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      rating: 4,
      date: '1 week ago',
      description: 'Solid glasses, but the S size was slightly too small for my face.',
      images: []
    }
  ]);

  if (!product) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Product not found</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: Math.random().toString(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
    }));
    router.push('/cart');
  };

  const handleAddImage = () => {
    const newImage = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800';
    setSelectedReviewImages([...selectedReviewImages, newImage]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedReviewImages(selectedReviewImages.filter((_, i) => i !== index));
  };

  const handleSubmitReview = () => {
    if (userRating === 0) return;
    const newReview = {
      id: Date.now().toString(),
      user: 'You',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      rating: userRating,
      date: 'Just now',
      description: reviewText,
      images: selectedReviewImages
    };
    setReviewsList([newReview, ...reviewsList]);
    setReviewText('');
    setUserRating(0);
    setSelectedReviewImages([]);
  };

  const renderImageItem = ({ item }: { item: string }) => (
    <View style={styles.imageSlide}>
      <Image source={{ uri: item }} style={styles.heroImage} resizeMode="cover" />
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
      
      <View style={styles.mainContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header Actions Overlay */}
          <SafeAreaView style={styles.headerOverlay} edges={['top']}>
            <TouchableOpacity style={[styles.roundBtn, { backgroundColor: theme.card }]} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roundBtn, { backgroundColor: theme.card }]} 
              onPress={handleToggleWishlist}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? theme.destructive : theme.text}
              />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Multi-Image Slider Section */}
          <View style={styles.sliderContainer}>
            <Animated.FlatList
              data={product.images || [product.image]}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderImageItem}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false, listener: (e: any) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setActiveSlide(index);
                }}
              )}
              scrollEventThrottle={16}
            />
            {/* Pagination Dots */}
            <View style={styles.paginationDots}>
              {(product.images || [product.image]).map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dot, 
                    { backgroundColor: activeSlide === i ? theme.primary : theme.border },
                    activeSlide === i && { width: 24, backgroundColor: theme.primary }
                  ]} 
                />
              ))}
            </View>
          </View>

          {/* Product Information Card */}
          <View style={[styles.contentCard, { backgroundColor: theme.background }]}>
            <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />
            
            <View style={styles.mainInfo}>
              <View style={[styles.catBadge, { backgroundColor: theme.primarySoft }]}>
                <Text style={[styles.catLabel, { color: theme.primaryDark }]}>{product.category}</Text>
              </View>
              <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
              
              <View style={styles.priceRatingRow}>
                <Text style={[styles.priceTag, { color: theme.text }]}>₹{product.price}</Text>
                <View style={styles.ratingOverview}>
                  <Ionicons name="star" size={16} color={theme.rating} />
                  <Text style={[styles.ratingVal, { color: theme.text }]}>{product.rating}</Text>
                  <Text style={[styles.reviewCount, { color: theme.subtext }]}>({product.reviews} reviews)</Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Description */}
            <Text style={[styles.subSectionTitle, { color: theme.text }]}>Description</Text>
            <Text style={[styles.descriptionText, { color: theme.subtext }]}>
               Engineered with precision and styled for the modern trendsetter. These frames combine lightweight durability with an iconic aesthetic that works for any occasion.
            </Text>

            {/* Configuration Options - Bento Style */}
            <View style={styles.bentoConfigs}>
               <View style={[styles.bentoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.configTitle, { color: theme.text }]}>Frame Color</Text>
                  <View style={styles.colorPicks}>
                    {colors.map((c) => (
                      <TouchableOpacity
                        key={c}
                        onPress={() => setSelectedColor(c)}
                        style={[
                          styles.colorOption,
                          { backgroundColor: c },
                          selectedColor === c && { borderColor: theme.primary, borderWidth: 3 }
                        ]}
                      />
                    ))}
                  </View>
               </View>

               <View style={[styles.bentoBox, { backgroundColor: theme.card, borderColor: theme.border, flex: 0.8 }]}>
                  <Text style={[styles.configTitle, { color: theme.text }]}>Quantity</Text>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyOp}>
                       <Ionicons name="remove" size={18} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyVal, { color: theme.text }]}>{quantity}</Text>
                    <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyOp}>
                       <Ionicons name="add" size={18} color={theme.text} />
                    </TouchableOpacity>
                  </View>
               </View>
            </View>

            <View style={styles.sizeSection}>
                <Text style={[styles.subSectionTitle, { color: theme.text }]}>Available Sizes</Text>
                <View style={styles.sizeSelection}>
                  {sizes.map(s => (
                    <TouchableOpacity 
                      key={s} 
                      onPress={() => setSelectedSize(s)}
                      style={[
                        styles.sizePill, 
                        { backgroundColor: theme.card, borderColor: theme.border },
                        selectedSize === s && { backgroundColor: theme.primary, borderColor: theme.primary }
                      ]}
                    >
                      <Text style={[
                        styles.sizePillText, 
                        { color: theme.text },
                        selectedSize === s && { color: theme.background }
                      ]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border, marginTop: 40 }]} />

            {/* Reviews Section */}
            <View style={styles.reviewsArea}>
              <View style={styles.reviewsHeader}>
                <Text style={[styles.subSectionTitle, { color: theme.text }]}>Customer Reviews</Text>
                <TouchableOpacity>
                  <Text style={{ color: theme.primary, fontSize: 13, fontWeight: 'bold' }}>See All</Text>
                </TouchableOpacity>
              </View>
              {reviewsList.map(review => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewMeta}>
                    <Image source={{ uri: review.avatar }} style={styles.reviewUserAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reviewUser, { color: theme.text }]}>{review.user}</Text>
                      <View style={styles.starsRow}>
                         {[1,2,3,4,5].map(s => (
                           <Ionicons key={s} name="star" size={10} color={s <= review.rating ? theme.rating : theme.border} />
                         ))}
                      </View>
                    </View>
                    <Text style={[styles.reviewDate, { color: theme.subtext }]}>{review.date}</Text>
                  </View>
                  <Text style={[styles.reviewText, { color: theme.text }]}>{review.description}</Text>
                </View>
              ))}
            </View>

            <View style={{ height: 160 }} />
          </View>
        </ScrollView>

        {/* Dynamic Action Bar */}
        <View style={styles.footerContainer}>
          <TouchableOpacity 
            style={[styles.fullCartBtn, { backgroundColor: theme.primary }]}
            onPress={handleAddToCart}
            activeOpacity={0.9}
          >
            <View style={[styles.cartIconCircle, { backgroundColor: theme.background }]}>
               <Ionicons name="bag-add" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.cartBtnText, { color: theme.background }]}>Add to Basket</Text>
            <Text style={[styles.cartBtnPrice, { color: theme.background }]}>₹{product.price * quantity}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  roundBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  sliderContainer: {
    height: height * 0.5,
    width: width,
    backgroundColor: '#F5F5F5',
  },
  imageSlide: {
    width: width,
    height: height * 0.5,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
  },
  contentCard: {
    marginTop: -40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 12,
    flex: 1,
    minHeight: height * 0.6,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.5,
  },
  mainInfo: {
    marginBottom: 32,
  },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  catLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  productName: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 16,
    lineHeight: 38,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceTag: {
    fontSize: 28,
    fontWeight: '900',
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingVal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewCount: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  subSectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 32,
  },
  bentoConfigs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  bentoBox: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  configTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    opacity: 0.7,
  },
  colorPicks: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyOp: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyVal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sizeSection: {
    marginBottom: 10,
  },
  sizeSelection: {
    flexDirection: 'row',
    gap: 12,
  },
  sizePill: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizePillText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewsArea: {
    marginTop: 10,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewCard: {
    marginBottom: 24,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  reviewUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    paddingTop: 10,
  },
  fullCartBtn: {
    height: 72,
    borderRadius: 36,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    ...SHADOWS.deep,
  },
  cartIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtnText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cartBtnPrice: {
    fontSize: 18,
    fontWeight: '900',
    paddingRight: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
