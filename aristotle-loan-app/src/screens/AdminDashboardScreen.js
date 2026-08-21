import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import API from '../api/client';

export default function AdminDashboardScreen() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/loans');
      setLoans(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch loan requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await API.put(`/api/loans/${id}`, { status });
      Alert.alert('Success', `Loan ${status} successfully.`);
      fetchLoans();
    } catch (error) {
      Alert.alert('Error', `Failed to update loan status to ${status}.`);
    }
  };

  const renderLoanItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.borrowerName}>{item.borrower_name}</Text>
        <Text style={[styles.statusBadge, item.status === 'APPROVED' ? styles.approved : item.status === 'REJECTED' ? styles.rejected : styles.pending]}>
          {item.status || 'PENDING'}
        </Text>
      </View>
      <Text style={styles.amount}>Amount: {item.amount}</Text>
      <Text style={styles.purpose}>{item.purpose}</Text>

      {(!item.status || item.status === 'PENDING') && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleAction(item.id, 'APPROVED')}>
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleAction(item.id, 'REJECTED')}>
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Loan Dashboard</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLoanItem}
          onRefresh={fetchLoans}
          refreshing={loading}
          ListEmptyComponent={<Text style={styles.emptyText}>No loan requests found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  borrowerName: { fontSize: 16, fontWeight: 'bold' },
  statusBadge: { fontSize: 12, fontWeight: 'bold', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4, color: '#fff', overflow: 'hidden' },
  pending: { backgroundColor: '#ffc107', color: '#000' },
  approved: { backgroundColor: '#28a745' },
  rejected: { backgroundColor: '#dc3545' },
  amount: { fontSize: 15, fontWeight: '600', marginVertical: 4, color: '#007bff' },
  purpose: { fontSize: 13, color: '#666', marginBottom: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  actionBtn: { flex: 0.48, padding: 10, borderRadius: 6, alignItems: 'center' },
  approveBtn: { backgroundColor: '#28a745' },
  rejectBtn: { backgroundColor: '#dc3545' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#888' },
});