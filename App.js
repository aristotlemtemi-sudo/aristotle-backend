import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import NetInfo from '@react-native-community/netinfo';

// Initialize embedded local database for offline persistence
const db = SQLite.openDatabaseSync('aristotle_offline.db');

export default function App() {
  const [isConnected, setIsConnected] = useState(true);
  const [formData, setFormData] = useState({
    lender_name: 'Aristotle Enterprises',
    borrower_name: '',
    borrower_nida_passport: '',
    borrower_phone: '',
    borrower_address: '',
    principal_amount: '',
    interest_rate: '5',
    interest_type: 'Yearly',
    maturity_date: '2026-12-31',
    collateral_description: '',
    collateral_value: '',
    borrower_witness_name: '',
    borrower_witness_relationship: '',
    borrower_witness_phone: '',
    lender_witness_name: 'Mark Vance',
    lender_witness_relationship: 'Legal Officer',
    lender_witness_phone: '+255700000000'
  });

  useEffect(() => {
    // Create local queue table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS pending_loans (
        local_id TEXT PRIMARY KEY,
        payload TEXT,
        is_synced INTEGER DEFAULT 0
      );
    `);

    // Listen for network connectivity changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        syncQueueToServer();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalRepayment = () => {
    const p = parseFloat(formData.principal_amount) || 0;
    const r = parseFloat(formData.interest_rate) || 0;
    return p + (p * (r / 100));
  };

  const saveContractLocally = () => {
    if (!formData.borrower_name || !formData.principal_amount) {
      Alert.alert('Required Fields Missing', 'Please fill in Borrower details and Principal Amount.');
      return;
    }

    const localId = 'LOCAL-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const totalRepayment = calculateTotalRepayment();

    const payload = {
      local_id: localId,
      ...formData,
      total_repayment_sum: totalRepayment,
      borrower_passport_photo: 'BASE64_PHOTO_PLACEHOLDER',
      borrower_signature: 'BASE64_SIG_PLACEHOLDER',
      lender_signature: 'BASE64_SIG_PLACEHOLDER',
      official_stamp: 'BASE64_STAMP_PLACEHOLDER'
    };

    // Store in offline SQLite database
    db.runSync(
      'INSERT INTO pending_loans (local_id, payload, is_synced) VALUES (?, ?, 0);',
      [localId, JSON.stringify(payload)]
    );

    Alert.alert('Contract Saved Offline', 'Document stored on device cache. It will auto-sync and send email alerts once online.');

    if (isConnected) {
      syncQueueToServer();
    }
  };

  const syncQueueToServer = async () => {
    const rows = db.getAllSync('SELECT * FROM pending_loans WHERE is_synced = 0;');
    
    for (const row of rows) {
      try {
        const payloadData = JSON.parse(row.payload);
        const res = await fetch('https://YOUR-RENDER-BACKEND-URL.com/api/sync-loan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadData)
        });

        if (res.ok) {
          db.runSync('UPDATE pending_loans SET is_synced = 1 WHERE local_id = ?;', [row.local_id]);
        }
      } catch (err) {
        console.log('Sync postponed, host unavailable:', err);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Heritage Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ARISTOTLE ENTERPRISES</Text>
        <Text style={styles.headerSubtitle}>SOVEREIGN LOAN MANAGEMENT TERMINAL</Text>
        <View style={[styles.statusBadge, { backgroundColor: isConnected ? '#198754' : '#DC3545' }]}>
          <Text style={styles.statusText}>{isConnected ? '🌐 ONLINE / AUTO-SYNC' : '📡 OFFLINE MODE'}</Text>
        </View>
      </View>

      {/* Card 1: Borrower Profile */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>I. BORROWER PROFILE</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Full Legal Name" 
          value={formData.borrower_name} 
          onChangeText={v => handleInputChange('borrower_name', v)} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="NIDA / Passport Number" 
          value={formData.borrower_nida_passport} 
          onChangeText={v => handleInputChange('borrower_nida_passport', v)} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Telephone Number" 
          keyboardType="phone-pad" 
          value={formData.borrower_phone} 
          onChangeText={v => handleInputChange('borrower_phone', v)} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Physical Residential Address" 
          value={formData.borrower_address} 
          onChangeText={v => handleInputChange('borrower_address', v)} 
        />
      </View>

      {/* Card 2: Financial Terms */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>II. FINANCIAL COVENANTS</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Principal Amount (TZS)" 
          keyboardType="numeric" 
          value={formData.principal_amount} 
          onChangeText={v => handleInputChange('principal_amount', v)} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Interest Rate (%)" 
          keyboardType="numeric" 
          value={formData.interest_rate} 
          onChangeText={v => handleInputChange('interest_rate', v)} 
        />
        <Text style={styles.readOnlyText}>
          Total Due: TZS {calculateTotalRepayment().toLocaleString()}
        </Text>
      </View>

      {/* Card 3: Collateral */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>III. PLEDGED COLLATERAL</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Asset Description (Model / Reg No)" 
          value={formData.collateral_description} 
          onChangeText={v => handleInputChange('collateral_description', v)} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Estimated Market Value (TZS)" 
          keyboardType="numeric" 
          value={formData.collateral_value} 
          onChangeText={v => handleInputChange('collateral_value', v)} 
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={saveContractLocally}>
        <Text style={styles.buttonText}>🔒 EXECUTE & SAVE CONTRACT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F1EA', padding: 16 },
  header: { alignItems: 'center', marginVertical: 24, borderBottomWidth: 1, borderBottomColor: '#D4AF37', paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0A1128', letterSpacing: 1.5 },
  headerSubtitle: { fontSize: 10, color: '#D4AF37', marginTop: 4, letterSpacing: 1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  card: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D4AF37', padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 12, fontWeight: 'bold', color: '#0A1128', marginBottom: 12, letterSpacing: 1 },
  input: { borderWidth: 1, borderColor: '#CCC', padding: 10, marginBottom: 10, fontSize: 14, backgroundColor: '#F9F9F9' },
  readOnlyText: { fontSize: 14, fontWeight: 'bold', color: '#0A1128', marginTop: 4 },
  button: { backgroundColor: '#0A1128', borderWidth: 1, borderColor: '#D4AF37', padding: 16, alignItems: 'center', marginBottom: 40 },
  buttonText: { color: '#D4AF37', fontWeight: 'bold', letterSpacing: 1 }
});