import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, style, ...rest }: InputProps) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput style={[styles.input, error && styles.inputError, style]} placeholderTextColor="#999" {...rest} />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { marginBottom: 5, fontSize: 14, fontWeight: '500', color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: { borderColor: 'red' },
  errorText: { color: 'red', fontSize: 12, marginTop: 4 },
});
