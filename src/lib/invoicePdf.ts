import { jsPDF } from 'jspdf';

export interface InvoicePDFData {
  id: string;
  date: string;
  amount: number;
  method: string;
  trxId: string;
  userEmail: string;
  userName: string;
  packageName: string;
}

export function generateInvoicePDF(invoice: InvoicePDFData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Base Font
  doc.setFont('helvetica', 'normal');

  // Top Accent Bar (Elegant Indigo)
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 8, 'F');

  // Brand Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('BASAVARA', 15, 23);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('FIND APARTMENTS, MESS ROOMS & VERIFIED TUTORS', 15, 28);
  doc.text('Email: support@basavara.com | Web: www.basavara.com', 15, 32);

  // Status Badge (PAID)
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(150, 15, 45, 12, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PAID & APPROVED', 154, 22);

  // Invoice Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INVOICE', 15, 48);

  // Divider line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.line(15, 51, 195, 51);

  // Invoice Details & Bill To (2-column layout)
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE TO:', 15, 60);
  doc.text('INVOICE DETAILS:', 130, 60);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(9);
  doc.text(`Name: ${invoice.userName}`, 15, 66);
  doc.text(`Email: ${invoice.userEmail}`, 15, 71);

  doc.text(`Invoice No: INV-${invoice.id.toUpperCase()}`, 130, 66);
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 130, 71);

  // Table Header
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(15, 82, 180, 8, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, 82, 180, 8, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('DESCRIPTION', 18, 87);
  doc.text('PAYMENT GATEWAY', 88, 87);
  doc.text('TRANSACTION ID', 128, 87);
  doc.text('AMOUNT', 170, 87);

  // Table Row
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.text(invoice.packageName, 18, 97);
  doc.text(invoice.method ? invoice.method.toUpperCase() : 'N/A', 88, 97);
  doc.text(invoice.trxId || 'N/A', 128, 97);
  doc.text(`BDT ${invoice.amount}.00`, 170, 97);

  // Bottom line of table
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 103, 195, 103);

  // Total section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Total Paid:', 140, 112);
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text(`BDT ${invoice.amount}.00`, 170, 112);

  // Footer / Thanks
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Thank you for your subscription! Your active membership helps us keep BasaVara secure.', 15, 140);
  doc.text('If you have any billing queries, please contact billing@basavara.com', 15, 144);

  // Divider
  doc.line(15, 155, 195, 155);

  // System Seal
  doc.setFontSize(7);
  doc.text('This is an electronically generated document. No physical signature is required.', 15, 160);
  
  return doc;
}
