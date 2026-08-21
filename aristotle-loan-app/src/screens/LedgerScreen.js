import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import API from '../api/client';

const STATUS_COLORS = {
  PENDING: '#FFC107',
  APPROVED: '#28A745',
  REJECTED: '#DC3545',
};

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

export default function LedgerScreen() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const { width } = useWindowDimensions();

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/loans');
      setLedger(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch ledger records. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const filteredLedger = ledger.filter((entry) => {
    const statusMatch =
      activeFilter === 'All' ||
      (entry.status || 'PENDING').toUpperCase() === activeFilter.toUpperCase();
    const searchMatch =
      searchQuery.trim() === '' ||
      (entry.borrower_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const getStatusStyle = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    return {
      backgroundColor: STATUS_COLORS[s] || STATUS_COLORS.PENDING,
      color: s === 'PENDING' ? '#000' : '#FFF',
    };
  };

  const formatAmount = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return String(value ?? '');
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const StatusBadge = ({ status }) => {
    const style = getStatusStyle(status);
    return (
      <View style={[styles.statusBadge, { backgroundColor: style.backgroundColor }]}>
        <Text style={[styles.statusBadgeText, { color: style.color }]}>{status || 'PENDING'}</Text>
      </View>
    );
  };

  const renderLedgerItem = ({ item }) => {
    const status = (item.status || 'PENDING').toUpperCase();

    return (
      <View style={styles.card}>
        {/* Top row: avatar + name + status */}
        <View style={styles.cardTopRow}>
          <View style={styles.avatarCircle}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>
                {(item.borrower_name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.cardLeft}>
            <Text style={styles.name} numberOfLines={1}>
              {item.borrower_name}
            </Text>
            <Text style={styles.id}>#{item.id}</Text>
          </View>
          <StatusBadge status={status} />
        </View>

        {/* Amount + date */}
        <View style={styles.amountRow}>
          <Text style={styles.amount}>TZS {formatAmount(item.amount)}</Text>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>

        {/* Purpose if available */}
        {item.purpose ? (
          <Text style={styles.purpose} numberOfLines={2}>
            {item.purpose}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transaction Ledger</Text>
        <Text style={styles.subtitle}>Audit historical loan records</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by borrower name..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Results Count */}
      <Text style={styles.resultCount}>
        {filteredLedger.length} {filteredLedger.length === 1 ? 'record' : 'records'}
        {activeFilter !== 'All' ? ` • ${activeFilter}` : ''}
      </Text>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading ledger records...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLedger}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLedgerItem}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchLedger}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📒</Text>
              <Text style={styles.emptyText}>
                {searchQuery || activeFilter !== 'All'
                  ? 'No records match your search / filter.'
                  : 'No records in the ledger yet. Pull down to refresh.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingTop: 16 },
  header: { paddingHorizontal: 16, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    color: '#F8FAFC',
    fontSize: 14,
  },
  clearBtn: { padding: 4 },
  clearBtnText: { color: '#94A3B8', fontSize: 14, fontWeight: 'bold' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#FFFFFF' },
  resultCount: {
    color: '#64748B',
    fontSize: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94A3B8', marginTop: 12, fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInner: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
  cardLeft: { flex: 1 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#F8FAFC' },
  id: { fontSize: 11, color: '#64748B', marginTop: 2 },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  amount: { fontSize: 16, fontWeight: 'bold', color: '#34D399' },
  date: { fontSize: 11, color: '#64748B' },
  purpose: { fontSize: 13, color: '#94A3B8', marginTop: 4, lineHeight: 19 },
  emptyContainer: { alignItems: 'center', paddingTop: 50 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: '#94A3B8', fontSize: 14, textAlign: 'center' },
});