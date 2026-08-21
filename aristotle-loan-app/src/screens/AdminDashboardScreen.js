import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import API from '../api/client';

const STATUS_COLORS = {
  PENDING: '#FFC107',
  APPROVED: '#28A745',
  REJECTED: '#DC3545',
};

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

export default function AdminDashboardScreen() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/loans');
      setLoans(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch loan requests. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleAction = async (id, status) => {
    try {
      setActionLoadingId(id);
      await API.put(`/api/loans/${id}`, { status });
      Alert.alert('Success', `Loan ${status} successfully.`);
      fetchLoans();
    } catch (error) {
      Alert.alert('Error', `Failed to update loan status to ${status}.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const statusMatch =
      activeFilter === 'All' ||
      (loan.status || 'PENDING').toUpperCase() === activeFilter.toUpperCase();
    const searchMatch =
      searchQuery.trim() === '' ||
      (loan.borrower_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const getStatusStyle = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    return { backgroundColor: STATUS_COLORS[s] || STATUS_COLORS.PENDING, color: s === 'PENDING' ? '#000' : '#FFF' };
  };

  const formatAmount = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return String(value ?? '');
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  const StatusBadge = ({ status }) => {
    const style = getStatusStyle(status);
    return (
      <View style={[styles.statusBadge, { backgroundColor: style.backgroundColor }]}>
        <Text style={[styles.statusBadgeText, { color: style.color }]}>
          {status || 'PENDING'}
        </Text>
      </View>
    );
  };

  const renderLoanItem = ({ item }) => {
    const status = (item.status || 'PENDING').toUpperCase();
    const isPending = status === 'PENDING';
    const isActionLoading = actionLoadingId === item.id;

    return (
      <View style={styles.card}>
        {/* Card header with avatar and status */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(item.borrower_name || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.borrowerName}>{item.borrower_name}</Text>
            <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
          </View>
          <StatusBadge status={status} />
        </View>

        {/* Amount */}
        <Text style={styles.amount}>TZS {formatAmount(item.amount)}</Text>

        {/* Purpose */}
        {item.purpose ? (
          <Text style={styles.purpose} numberOfLines={2}>
            {item.purpose}
          </Text>
        ) : null}

        {/* Action buttons */}
        {isPending && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn, isActionLoading && styles.btnDisabled]}
              onPress={() => handleAction(item.id, 'APPROVED')}
              disabled={isActionLoading}
              activeOpacity={0.8}
            >
              {isActionLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.approveBtnText}>✓ Approve</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn, isActionLoading && styles.btnDisabled]}
              onPress={() => handleAction(item.id, 'REJECTED')}
              disabled={isActionLoading}
              activeOpacity={0.8}
            >
              {isActionLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.rejectBtnText}>✕ Reject</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Review & manage loan requests</Text>
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
        {filteredLoans.length} {filteredLoans.length === 1 ? 'loan' : 'loans'}
        {activeFilter !== 'All' ? ` • ${activeFilter}` : ''}
      </Text>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading loan requests...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLoans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLoanItem}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchLoans}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🗂️</Text>
              <Text style={styles.emptyText}>
                {searchQuery || activeFilter !== 'All'
                  ? 'No loans match your search / filter.'
                  : 'No loan requests yet. Pull down to refresh.'}
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { color: '#3B82F6', fontSize: 17, fontWeight: 'bold' },
  headerInfo: { flex: 1 },
  borrowerName: { fontSize: 15, fontWeight: 'bold', color: '#F8FAFC' },
  timestamp: { fontSize: 11, color: '#64748B', marginTop: 2 },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  amount: { fontSize: 17, fontWeight: 'bold', color: '#34D399', marginBottom: 4 },
  purpose: { fontSize: 13, color: '#94A3B8', lineHeight: 19, marginBottom: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  approveBtn: { backgroundColor: '#28A745' },
  rejectBtn: { backgroundColor: '#DC3545' },
  approveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  rejectBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  btnDisabled: { opacity: 0.5 },
  emptyContainer: { alignItems: 'center', paddingTop: 50 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: '#94A3B8', fontSize: 14, textAlign: 'center' },
});