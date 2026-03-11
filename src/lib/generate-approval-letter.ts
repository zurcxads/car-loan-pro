import { jsPDF } from 'jspdf';
import { formatCurrency, formatAPR, formatDate } from './format-utils';

interface ApprovalLetterData {
  firstName: string;
  lastName: string;
  lenderName: string;
  approvedAmount: number;
  apr: number;
  termMonths: number;
  monthlyPayment: number;
  expiresAt: string;
  conditions: string[];
}

export function generateApprovalLetter(data: ApprovalLetterData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('Auto Loan Pro', 20, y);
  y += 10;

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text('Pre-Approval Letter', 20, y);

  // Date - top right
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(formatDate(new Date().toISOString()), pageWidth - 20, 20, { align: 'right' });

  y += 20;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 15;

  // Borrower block
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Prepared for: ${data.firstName} ${data.lastName}`, 20, y);
  y += 20;

  // Body paragraph
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const bodyText = `This letter confirms that ${data.firstName} ${data.lastName} has been pre-approved for auto financing through Auto Loan Pro's lender network. The following terms have been conditionally approved pending final vehicle selection and verification of information provided.`;
  const bodyLines = doc.splitTextToSize(bodyText, pageWidth - 40);
  doc.text(bodyLines, 20, y);
  y += bodyLines.length * 6 + 15;

  // Terms table
  const terms = [
    ['Lending Institution', data.lenderName],
    ['Pre-Approved Amount', `Up to ${formatCurrency(data.approvedAmount)}`],
    ['Annual Percentage Rate', formatAPR(data.apr)],
    ['Loan Term', `${data.termMonths} months`],
    ['Est. Monthly Payment', formatCurrency(data.monthlyPayment)],
    ['Valid Through', formatDate(data.expiresAt)],
  ];

  doc.setFillColor(245, 245, 245);
  terms.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      doc.rect(20, y - 4, pageWidth - 40, 10, 'F');
    }
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(label, 25, y + 2);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(value, pageWidth - 25, y + 2, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 10;
  });

  y += 10;

  // Conditions
  if (data.conditions.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text('Conditions:', 20, y);
    y += 8;
    doc.setFontSize(10);
    data.conditions.forEach(condition => {
      doc.text(`  - ${condition}`, 25, y);
      y += 6;
    });
    y += 10;
  }

  // Footer
  y = Math.max(y + 20, 240);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const footerText = 'This pre-approval is not a guarantee of final loan terms. Final approval subject to lender underwriting. Auto Loan Pro NMLS #000000';
  const footerLines = doc.splitTextToSize(footerText, pageWidth - 40);
  doc.text(footerLines, 20, y);

  // Download
  const fileName = `AutoLoanPro_Approval_${data.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
