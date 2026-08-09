import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, SHADOWS } from '../../constants/Theme';

const { width } = Dimensions.get('window');

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isDestructive?: boolean;
}

export const ConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  icon = "help-circle-outline",
  isDestructive = false,
}: ConfirmModalProps) => {
  const { colors: theme } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.card }]}>
          <View style={[styles.iconBox, { backgroundColor: isDestructive ? 'rgba(255, 59, 48, 0.1)' : theme.accent }]}>
             <Ionicons 
                name={icon} 
                size={32} 
                color={isDestructive ? '#FF3B30' : theme.text} 
             />
          </View>
          
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.subtext }]}>{message}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.cancelBtn, { borderColor: theme.border }]} 
              onPress={onClose}
            >
              <Text style={[styles.btnText, { color: theme.subtext }]}>{cancelLabel}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.btn, 
                styles.confirmBtn, 
                { backgroundColor: isDestructive ? '#FF3B30' : theme.text }
              ]} 
              onPress={onConfirm}
            >
              <Text style={[styles.btnText, { color: isDestructive ? '#FFF' : theme.background }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: width - 48,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    ...SHADOWS.deep,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  confirmBtn: {
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
