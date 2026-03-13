/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ApprovalLetterData } from './approval-letter';

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 48,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: '2pt solid #E5E7EB',
    textAlign: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
  },
  qrCode: {
    position: 'absolute',
    top: 48,
    right: 48,
    width: 100,
    height: 100,
  },
  badge: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    fontSize: 10,
    fontWeight: 'bold',
    padding: '6pt 12pt',
    borderRadius: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 24,
  },
  approvalBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 8,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailValueHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  detailValueMedium: {
    fontSize: 14,
    fontWeight: 'semibold',
    color: '#111827',
  },
  codeSection: {
    paddingTop: 16,
    borderTop: '1pt solid #D1D5DB',
  },
  codeValue: {
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  conditionsList: {
    marginBottom: 24,
  },
  conditionItem: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 8,
    flexDirection: 'row',
  },
  bullet: {
    color: '#2563EB',
    marginRight: 8,
  },
  instructionsList: {
    marginBottom: 24,
  },
  instructionItem: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 8,
    flexDirection: 'row',
  },
  instructionNumber: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 24,
    flexDirection: 'row',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#78350F',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 9,
    color: '#92400E',
  },
  fineprint: {
    fontSize: 8,
    color: '#9CA3AF',
    marginBottom: 8,
    lineHeight: 1.4,
  },
  footer: {
    paddingTop: 16,
    borderTop: '1pt solid #E5E7EB',
    marginTop: 16,
  },
  footerText: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export const createApprovalLetterPDF = (data: ApprovalLetterData, qrCodeDataUrl?: string) => {
  const expirationDate = new Date(data.expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const issueDate = new Date(data.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Auto Loan Pro</Text>
          <Text style={styles.subtitle}>Pre-Approval Letter</Text>
        </View>

        {/* QR Code */}
        {qrCodeDataUrl && (
          <Image style={styles.qrCode} src={qrCodeDataUrl} />
        )}

        {/* Approval Badge */}
        <Text style={styles.badge}>✓ Approved</Text>

        {/* Greeting */}
        <Text style={styles.greeting}>
          Congratulations, {data.borrowerName}!
        </Text>
        <Text style={styles.description}>
          You have been pre-approved for an auto loan by {data.lenderName}.
        </Text>

        {/* Approval Details */}
        <View style={styles.approvalBox}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Approved Amount</Text>
              <Text style={styles.detailValue}>
                ${data.approvedAmount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>APR</Text>
              <Text style={styles.detailValueHighlight}>
                {data.apr.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Term</Text>
              <Text style={styles.detailValueMedium}>
                {data.termMonths} months
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Est. Monthly Payment</Text>
              <Text style={styles.detailValueMedium}>
                ${data.monthlyPayment.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.codeSection}>
            <Text style={styles.detailLabel}>Approval Code</Text>
            <Text style={styles.codeValue}>{data.approvalCode}</Text>
          </View>
        </View>

        {/* Date Information */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.fineprint}>
            Issue Date: {issueDate}
          </Text>
        </View>

        {/* Conditions */}
        {data.conditions.length > 0 && (
          <View style={styles.conditionsList}>
            <Text style={styles.sectionTitle}>Conditions:</Text>
            {data.conditions.map((condition, i) => (
              <View key={i} style={styles.conditionItem}>
                <Text style={styles.bullet}>•</Text>
                <Text>{condition}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsList}>
          <Text style={styles.sectionTitle}>How to Use This Pre-Approval:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text>Present this letter to any dealership when shopping for your vehicle</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text>The dealer will verify your approval code with {data.lenderName}</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text>Shop with confidence knowing your financing is secured</Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4.</Text>
            <Text>Final loan terms will be confirmed upon vehicle selection and final underwriting</Text>
          </View>
        </View>

        {/* Expiration Warning */}
        <View style={styles.warningBox}>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Valid Until</Text>
            <Text style={styles.warningText}>{expirationDate}</Text>
          </View>
        </View>

        {/* Fine Print */}
        <Text style={styles.fineprint}>
          This pre-approval certificate is issued by {data.lenderName} and is subject to final underwriting approval.
          The approved amount, APR, and monthly payment are estimates and may vary based on the actual vehicle selected,
          down payment, and trade-in value.
        </Text>
        <Text style={styles.fineprint}>
          Auto Loan Pro is a marketplace connecting borrowers with multiple lenders. This pre-approval does not constitute
          a commitment to lend. All loans are subject to credit approval and verification of information. APR is Annual
          Percentage Rate. Actual rate may vary based on creditworthiness and other factors.
        </Text>
        <Text style={styles.fineprint}>
          Application ID: {data.applicationId} | Offer ID: {data.offerId}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            autoloanpro.co | support@autoloanpro.co | NMLS ID: Pending
          </Text>
        </View>
      </Page>
    </Document>
  );
};
