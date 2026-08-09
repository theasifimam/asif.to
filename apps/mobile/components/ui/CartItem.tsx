import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, SHADOWS, useAppTheme } from '../../constants/Theme';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export const CartItem = ({
  name,
  price,
  quantity,
  image,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemProps) => {
  const { colors: theme } = useAppTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.card }]}>
      <View style={[styles.imageWrapper, { backgroundColor: theme.accent }]}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.categorySub, { color: theme.subtext }]}>Modern Eyewear</Text>
          </View>
          <TouchableOpacity onPress={onRemove} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color={theme.destructive} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <Text style={[styles.price, { color: theme.text }]}>₹{price}</Text>

          <View style={[styles.stepperPill, { backgroundColor: theme.accent }]}>
            <TouchableOpacity onPress={onDecrement} style={[styles.stepBtn, { backgroundColor: theme.background }]}>
              <Ionicons name="remove" size={18} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.quantityNum, { color: theme.text }]}>{quantity}</Text>
            <TouchableOpacity onPress={onIncrement} style={[styles.stepBtn, { backgroundColor: theme.background }]}>
              <Ionicons name="add" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#F7F8FA',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
    height: 90,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  categorySub: {
    fontSize: 12,
    color: '#8D8D8D',
  },
  deleteBtn: {
    padding: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 25,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  quantityNum: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginHorizontal: 12,
  },
});
