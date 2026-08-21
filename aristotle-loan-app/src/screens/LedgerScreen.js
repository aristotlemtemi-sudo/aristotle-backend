import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import API from '../api/client';

export default function LedgerScreen() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/loans');
      setLedger(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch ledger records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction Ledger</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={ledger}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View>
                <Text style={styles.name}>{item.borrower_name}</Text>
                <Text style={styles.date}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amount}>TZS {item.amount}</Text>
                <Text style={styles.status}>{item.status || 'PENDING'}</Text>
              </View>
            </View>
          )}
          onRefresh={fetchLedger}
          refreshing={loading}
          ListEmptyComponent={<Text style={styles.emptyText}>No records in ledger.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 15, fontWeight: '600' },
  date: { fontSize: 12, color: '#888', marginTop: 2 },
  amount: { fontSize: 15, fontWeight: 'bold', color: '#007bff' },
  status: { fontSize: 12, color: '#555', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#888' },
});