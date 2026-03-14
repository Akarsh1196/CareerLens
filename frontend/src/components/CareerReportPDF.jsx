import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Helvetica',
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { marginBottom: 30, borderBottom: '2 solid #3b82f6', paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#171717' },
  subtitle: { fontSize: 14, color: '#737373', marginTop: 5 },
  section: { marginTop: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2563eb', marginBottom: 10 },
  text: { fontSize: 12, color: '#404040', lineHeight: 1.5, marginBottom: 5 },
  boldText: { fontSize: 12, fontWeight: 'bold', color: '#171717' },
  card: { padding: 10, border: '1 solid #e5e5e5', borderRadius: 4, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  listItem: { flexDirection: 'row', marginBottom: 5 },
  bullet: { width: 15, fontSize: 12 },
  listText: { fontSize: 12, color: '#404040', flex: 1, lineHeight: 1.5 }
});

export const CareerReportPDF = ({ report, user }) => (
  <Document>
    {/* Page 1: Identity & Setup */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>CareerLens Compass Report</Text>
        <Text style={styles.subtitle}>Prepared for: {user?.email} | {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Career Identity</Text>
        <Text style={styles.text}>{report.career_identity}</Text>
        <Text style={styles.text}>{report.career_identity_description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>The Insight Gap</Text>
        <Text style={styles.text}>{report.misalignment_insight}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shadow Career</Text>
        <Text style={styles.text}>{report.shadow_career}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Career Matches</Text>
        {report.top_matches.map((match, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.boldText}>{match.title}</Text>
              <Text style={styles.text}>{match.percentage}% Match</Text>
            </View>
            <Text style={styles.text}>{match.explanation}</Text>
          </View>
        ))}
      </View>
    </Page>

    {/* Page 2: Roadmap & Execution */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Execution Plan: {report.top_matches[0]?.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>The Skill Bridge</Text>
        <Text style={styles.text}>What transfers: {report.skill_bridge}</Text>
        <Text style={styles.text}>What's missing: {report.skill_gap}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>12-Month Roadmap</Text>
        {report.roadmap.map((phase, i) => (
          <View key={i} style={{ marginBottom: 15 }}>
            <Text style={styles.boldText}>{phase.month_range}: {phase.title}</Text>
            {phase.action_items.map((item, j) => (
              <View key={j} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
