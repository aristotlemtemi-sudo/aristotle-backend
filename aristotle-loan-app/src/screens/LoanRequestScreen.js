import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import API from '../api/client';

export default function LoanRequestScreen() {
  const [borrowerName, setBorrowerName] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!borrowerName || !amount || !purpose) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      await API.post('/api/loans', {
        borrower_name: borrowerName,
        amount: parseFloat(amount),
        purpose: purpose,
      });
      Alert.alert('Success', 'Loan request submitted successfully!');
      setBorrowerName('');
      setAmount('');
      setPurpose('');
    } catch (error) {
      Alert.alert('Submission Error', error.response?.data?.error || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Submit Loan Request</Text>

      <Text style={styles.label}>Borrower Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. John Doe"
        value={borrowerName}
        onChangeText={setBorrowerName}
      />

      <Text style={styles.label}>Loan Amount (TZS / USD)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 150000"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Purpose / Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Brief description..."
        multiline
        numberOfLines={4}
        value={purpose}
        onChangeText={setPurpose}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Request'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fa', flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1a1a1a', textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#007bff', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});