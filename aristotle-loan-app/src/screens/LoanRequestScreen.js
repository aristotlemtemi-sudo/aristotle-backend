import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../api/client';

const INTEREST_RATE = 10; // Default 10% flat annual interest rate

const translations = {
  en: {
    screenTitle: 'Loan Application',
    submitLoanTitle: 'Submit Loan Request',
    bilingualLabel: 'Language / Lugha',
    borrowerNameLabel: 'Borrower Full Name',
    borrowerNamePlaceholder: 'e.g. Jane Mwangi',
    amountLabel: 'Loan Amount (TZS / USD)',
    amountPlaceholder: 'e.g. 500000',
    durationLabel: 'Duration (Months)',
    durationPlaceholder: 'e.g. 12',
    purposeLabel: 'Purpose / Notes',
    purposePlaceholder: 'Brief description of loan purpose...',
    calculateTitle: 'Estimated Repayment',
    principalLabel: 'Principal',
    interestLabel: 'Interest (10%)',
    totalPayableLabel: 'Total Payable',
    monthlyInstallmentLabel: 'Monthly Installment',
    submitButton: 'Submit Request',
    submitting: 'Submitting...',
    fillAll: 'Validation Error',
    fillAllMsg: 'Please fill in all required fields.',
    invalidAmount: 'Validation Error',
    invalidAmountMsg: 'Please enter a valid amount.',
    invalidDuration: 'Validation Error',
    invalidDurationMsg: 'Duration must be between 1 and 60 months.',
    successTitle: 'Success',
    successMsg: 'Loan request submitted successfully!',
    errorTitle: 'Submission Error',
    errorMsg: 'Failed to submit request. Please try again.',
    calcDisabled: 'Enter amount and duration to see the repayment estimate.',
  },
  sw: {
    screenTitle: 'Ombi la Mkopo',
    submitLoanTitle: 'Tuma Ombi la Mkopo',
    bilingualLabel: 'Language / Lugha',
    borrowerNameLabel: 'Jina Kamili la Mkopaji',
    borrowerNamePlaceholder: 'mf. Jane Mwangi',
    amountLabel: 'Kiasi cha Mkopo (TZS / USD)',
    amountPlaceholder: 'mf. 500000',
    durationLabel: 'Muda wa Marejesho (Miezi)',
    durationPlaceholder: 'mf. 12',
    purposeLabel: 'Sababu / Maelezo',
    purposePlaceholder: 'Maelezo mafupi ya madhumuni ya mkopo...',
    calculateTitle: 'Makadirio ya Marejesho',
    principalLabel: 'Msingi (Principal)',
    interestLabel: 'Riba (10%)',
    totalPayableLabel: 'Jumla ya Kulipa',
    monthlyInstallmentLabel: 'Malipo ya Mwezi',
    submitButton: 'Tuma Ombi',
    submitting: 'Inatuma...',
    fillAll: 'Hitilafu ya Uthibitisho',
    fillAllMsg: 'Tafadhali jaza sehemu zote zinazohitajika.',
    invalidAmount: 'Hitilafu ya Uthibitisho',
    invalidAmountMsg: 'Tafadhali ingiza kiasi sahihi.',
    invalidDuration: 'Hitilafu ya Uthibitisho',
    invalidDurationMsg: 'Muda lazima uwe kati ya miezi 1 na 60.',
    successTitle: 'Imefaulu',
    successMsg: 'Ombi la mkopo limetumwa kwa mafanikio!',
    errorTitle: 'Hitilafu ya Kutuma',
    errorMsg: 'Imeshindwa kutuma ombi. Tafadhali jaribu tena.',
    calcDisabled: 'Ingiza kiasi na muda kuona makadirio ya marejesho.',
  },
};

export default function LoanRequestScreen() {
  const [lang, setLang] = useState('en');
  const [borrowerName, setBorrowerName] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

  // Auto interest & repayment calculation
  const calculation = useMemo(() => {
    const principal = parseFloat(amount);
    const months = parseInt(duration, 10);

    if (isNaN(principal) || principal <= 0 || isNaN(months) || months <= 0) {
      return null;
    }

    const interest = (principal * INTEREST_RATE) / 100;
    const totalPayable = principal + interest;
    const monthlyInstallment = totalPayable / months;

    return {
      principal,
      interest,
      totalPayable,
      monthlyInstallment,
    };
  }, [amount, duration]);

  const formatMoney = (value) => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSubmit = async () => {
    const principal = parseFloat(amount);
    const months = parseInt(duration, 10);

    if (!borrowerName.trim() || !amount || !duration || !purpose.trim()) {
      Alert.alert(t.fillAll, t.fillAllMsg);
      return;
    }

    if (isNaN(principal) || principal <= 0) {
      Alert.alert(t.invalidAmount, t.invalidAmountMsg);
      return;
    }

    if (isNaN(months) || months < 1 || months > 60) {
      Alert.alert(t.invalidDuration, t.invalidDurationMsg);
      return;
    }

    try {
      setLoading(true);
      await API.post('/api/loans', {
        borrower_name: borrowerName.trim(),
        amount: principal,
        purpose: purpose.trim(),
      });
      Alert.alert(t.successTitle, t.successMsg);
      setBorrowerName('');
      setAmount('');
      setDuration('');
      setPurpose('');
    } catch (error) {
      Alert.alert(t.errorTitle, error.response?.data?.error || t.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Language Toggle */}
          <View style={styles.langToggle}>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
              onPress={() => setLang('en')}
            >
              <Text style={[styles.langBtnText, lang === 'en' && styles.langBtnTextActive]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'sw' && styles.langBtnActive]}
              onPress={() => setLang('sw')}
            >
              <Text style={[styles.langBtnText, lang === 'sw' && styles.langBtnTextActive]}>Kiswahili</Text>
            </TouchableOpacity>
          </View>

          {/* Header Card */}
          <View style={styles.headerCard}>
            <Text style={styles.headerEmoji}>🏦</Text>
            <Text style={styles.title}>{t.submitLoanTitle}</Text>
            <Text style={styles.subtitle}>{t.screenTitle}</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.label}>{t.borrowerNameLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.borrowerNamePlaceholder}
              placeholderTextColor="#64748B"
              value={borrowerName}
              onChangeText={setBorrowerName}
            />

            <Text style={styles.label}>{t.amountLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.amountPlaceholder}
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.label}>{t.durationLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.durationPlaceholder}
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />

            <Text style={styles.label}>{t.purposeLabel}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t.purposePlaceholder}
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={purpose}
              onChangeText={setPurpose}
            />
          </View>

          {/* Repayment Calculator Card */}
          <View style={styles.calculatorCard}>
            <View style={styles.calculatorHeader}>
              <Text style={styles.calculatorIcon}>🧮</Text>
              <Text style={styles.calculatorTitle}>{t.calculateTitle}</Text>
            </View>

            {calculation ? (
              <View style={styles.calcGrid}>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>{t.principalLabel}</Text>
                  <Text style={styles.calcValue}>{formatMoney(calculation.principal)}</Text>
                </View>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>{t.interestLabel}</Text>
                  <Text style={styles.calcValueInterest}>+ {formatMoney(calculation.interest)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabelBold}>{t.totalPayableLabel}</Text>
                  <Text style={styles.calcValueBold}>{formatMoney(calculation.totalPayable)}</Text>
                </View>
                <View style={[styles.calcRow, styles.monthlyRow]}>
                  <Text style={styles.calcLabel}>{t.monthlyInstallmentLabel}</Text>
                  <Text style={styles.monthlyValue}>
                    {formatMoney(calculation.monthlyInstallment)}
                    <Text style={styles.monthlySuffix}>
                      {' '}{lang === 'en' ? '/mo' : '/mwezi'}
                    </Text>
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.calcDisabled}>{t.calcDisabled}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.buttonLoading}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={[styles.buttonText, { marginLeft: 8 }]}>{t.submitting}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{t.submitButton}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  container: { padding: 16, paddingBottom: 40 },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
  },
  langBtnActive: { backgroundColor: '#3B82F6' },
  langBtnText: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  langBtnTextActive: { color: '#FFFFFF' },
  headerCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerEmoji: { fontSize: 40, marginBottom: 6 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#CBD5E1', marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    color: '#F8FAFC',
    fontSize: 15,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  calculatorCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  calculatorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  calculatorIcon: { fontSize: 20, marginRight: 8 },
  calculatorTitle: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC' },
  calcGrid: { gap: 8 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calcLabel: { fontSize: 13, color: '#94A3B8' },
  calcLabelBold: { fontSize: 14, fontWeight: 'bold', color: '#F8FAFC' },
  calcValue: { fontSize: 14, fontWeight: '600', color: '#E2E8F0' },
  calcValueInterest: { fontSize: 14, fontWeight: '600', color: '#FCA5A5' },
  calcValueBold: { fontSize: 16, fontWeight: 'bold', color: '#34D399' },
  monthlyRow: { marginTop: 4 },
  monthlyValue: { fontSize: 18, fontWeight: 'bold', color: '#34D399' },
  monthlySuffix: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 2 },
  calcDisabled: { fontSize: 13, color: '#64748B', textAlign: 'center', paddingVertical: 8 },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonLoading: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});