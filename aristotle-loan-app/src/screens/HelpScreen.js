import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';

const manualContent = {
  en: {
    title: 'User Manual',
    subtitle: 'How to use the Aristotle Loan App',
    sections: [
      {
        icon: '📝',
        heading: '1. Loan Application (Borrower)',
        steps: [
          'Navigate to the "Apply" tab from the bottom navigation bar.',
          'Enter borrower full name, requested principal amount, duration, and purpose.',
          'Click "Submit Request" to record the application to the system.',
        ],
      },
      {
        icon: '✅',
        heading: '2. Admin Approval Dashboard (Admin)',
        steps: [
          'Navigate to the "Admin" tab to review pending requests.',
          'Tap "Approve" or "Reject" to instantly update the loan status.',
        ],
      },
      {
        icon: '📒',
        heading: '3. Transaction Ledger',
        steps: [
          'Open the "Ledger" tab to audit historical records, timestamps, and current statuses.',
          'Swipe down to refresh data at any time.',
        ],
      },
    ],
  },
  sw: {
    title: 'Mwongozo wa Mtumiaji',
    subtitle: 'Jinsi ya kutumia Aristotle Loan App',
    sections: [
      {
        icon: '📝',
        heading: '1. Kuomba Mkopo (Mkopaji)',
        steps: [
          'Fungua sehemu ya "Apply" kwenye mwamba wa chini wa uratibu (bottom navigation).',
          'Jaza jina kamili, kiasi cha mkopo, muda wa marejesho, na sababu ya mkopo.',
          'Bonyeza "Submit Request" kutuma maombi kwenye mfumo.',
        ],
      },
      {
        icon: '✅',
        heading: '2. Deski la Idhini (Admin)',
        steps: [
          'Ingia sehemu ya "Admin" kuona maombi yote.',
          'Bonyeza "Approve" kukubali au "Reject" kukataa mkopo. Hali itabadilika papo hapo.',
        ],
      },
      {
        icon: '📒',
        heading: '3. Daftari la Kumbukumbu (Ledger)',
        steps: [
          'Fungua sehemu ya "Ledger" kuona historia ya miamala, tarehe, na hali ya marejesho.',
          'Vuta skrini chini wakati wowote kusasisha (refresh) orodha.',
        ],
      },
    ],
  },
};

export default function HelpScreen() {
  const [lang, setLang] = useState('en');
  const { width } = useWindowDimensions();
  const content = lang === 'en' ? manualContent.en : manualContent.sw;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Language Toggle */}
        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
            onPress={() => setLang('en')}
          >
            <Text style={[styles.langBtnText, lang === 'en' && styles.langBtnTextActive]}>
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, lang === 'sw' && styles.langBtnActive]}
            onPress={() => setLang('sw')}
          >
            <Text style={[styles.langBtnText, lang === 'sw' && styles.langBtnTextActive]}>
              Kiswahili
            </Text>
          </TouchableOpacity>
        </View>

        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerIcon}>📘</Text>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>
        </View>

        {/* Sections */}
        {content.sections.map((section, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{section.icon}</Text>
              <Text style={styles.cardHeading}>{section.heading}</Text>
            </View>
            <View style={styles.stepList}>
              {section.steps.map((step, stepIdx) => (
                <View key={stepIdx} style={styles.stepRow}>
                  <View style={[styles.stepNumber, { width: 26, height: 26 }]}>
                    <Text style={styles.stepNumberText}>{stepIdx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {lang === 'en'
              ? '💡 Tip: Pull down on any list to refresh the latest data.'
              : '💡 Kidokezo: Vuta skrini chini kwenye orodha yoyote kupata data mpya.'}
          </Text>
        </View>
      </ScrollView>
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
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  langBtnActive: { backgroundColor: '#3B82F6' },
  langBtnText: { color: '#94A3B8', fontWeight: '600', fontSize: 14 },
  langBtnTextActive: { color: '#FFFFFF' },
  headerCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: { fontSize: 44, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 6, textAlign: 'center' },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIcon: { fontSize: 22, marginRight: 10 },
  cardHeading: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', flex: 1 },
  stepList: { gap: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepNumber: {
    backgroundColor: '#3B82F6',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  stepText: { flex: 1, fontSize: 14, lineHeight: 21, color: '#CBD5E1' },
  footer: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  footerText: { color: '#86EFAC', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});