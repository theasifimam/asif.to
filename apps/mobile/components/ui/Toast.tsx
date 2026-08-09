import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { hideToast } from '../../store/slices/toastSlice';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, SHADOWS } from '../../constants/Theme';

const { width } = Dimensions.get('window');

const Toast = () => {
  const dispatch = useDispatch();
  const { message, visible, type } = useSelector((state: RootState) => state.toast);
  const { colors: theme } = useAppTheme();
  
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible && message) {
      // Animation In
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        // Auto-close timer
        const timer = setTimeout(() => {
          // Animation Out
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 20, duration: 400, useNativeDriver: true }),
          ]).start(() => dispatch(hideToast()));
        }, 2200);
        return () => clearTimeout(timer);
      });
    }
  }, [visible, message]);

  if (!visible || !message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle-outline';
      case 'error': return 'alert-circle-outline';
      case 'info': return 'information-circle-outline';
      default: return 'information-circle-outline';
    }
  };

  const getThemeColor = () => {
    switch (type) {
      case 'success': return theme.primary;
      case 'error': return theme.destructive;
      case 'info': return theme.primary;
      default: return theme.primary;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity, 
          transform: [{ translateY }], 
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        SHADOWS.soft,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: getThemeColor() + '15' }]}>
        <Ionicons name={getIcon() as any} size={20} color={getThemeColor()} />
      </View>
      <Text style={[styles.message, { color: theme.text }]} numberOfLines={1}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
});

export default Toast;
