import jsPDF from 'jspdf';
import { SchoolQuote } from '../types';
import { formatDateLong, formatCurrency } from './dateHelpers';

/**
 * Generates an official, high-resolution vector PDF document for a SchoolQuote
 * and automatically triggers a browser download.
 */
export function exportQuoteToPdf(quote: SchoolQuote): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  let y = 14;

  const isPerItem = quote.openLessonsScope === 'per_item' || quote.items.some((it) => it.hasOpenLesson);
  const isGlobal = quote.openLessonsScope === 'global' || (!quote.openLessonsScope && quote.hasOpenLessons && !isPerItem);

  const globalHasCost = Boolean(
    isGlobal &&
    quote.hasOpenLessons &&
    quote.includeOpenLessonCost &&
    quote.openLessonsCost &&
    quote.openLessonsCost > 0
  );

  const perItemTotalOpenCost = isPerItem
    ? quote.items.reduce((acc, it) => {
        if (it.hasOpenLesson && it.includeOpenLessonCost && it.openLessonCost) {
          return acc + (Number(it.openLessonCost) || 0);
        }
        return acc;
      }, 0)
    : 0;

  // Helper to ensure page bounds
  const checkNewPage = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 16;
      // Header mini-bar on subsequent pages
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`DO-RE-MINSIEME · Preventivo ${quote.quoteNumber} · ${quote.schoolName}`, marginX, y);
      y += 8;
    }
  };

  // ==========================================
  // 1. LETTERHEAD & HEADER
  // ==========================================
  // Brand name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(225, 29, 72); // Rose-600
  doc.text('DO-RE-MINSIEME', marginX, y);

  // Quote reference block on top right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('PREVENTIVO UFFICIALE', pageWidth - marginX, y - 2, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(quote.quoteNumber, pageWidth - marginX, y + 3, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Data: ${formatDateLong(quote.date)}`, pageWidth - marginX, y + 8, { align: 'right' });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Scuola di Canto e Propedeutica Musicale', marginX, y);

  y += 4.5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Laboratori e Corsi Didattico-Musicali nelle Scuole dell\'Infanzia e Primarie', marginX, y);

  y += 6;
  // Rose accent divider line
  doc.setDrawColor(225, 29, 72);
  doc.setLineWidth(0.8);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 6;

  // ==========================================
  // 2. RECIPIENT BOX
  // ==========================================
  const recipientBoxHeight = 26;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, contentWidth, recipientBoxHeight, 2, 2, 'FD');

  const halfWidth = contentWidth / 2;

  // Left: Destinatario
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DESTINATARIO:', marginX + 4, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(quote.schoolName, marginX + 4, y + 10.5);

  if (quote.schoolAddress) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(quote.schoolAddress, marginX + 4, y + 15);
  }

  // Right: Referente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ALLA CORTESE ATTENZIONE DI:', marginX + halfWidth + 4, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(quote.contactPerson || 'Dirigente Scolastico / Coordinatrice', marginX + halfWidth + 4, y + 10.5);

  let contactY = y + 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  if (quote.contactEmail) {
    doc.text(`Email: ${quote.contactEmail}`, marginX + halfWidth + 4, contactY);
    contactY += 4;
  }
  if (quote.contactPhone) {
    doc.text(`Tel: ${quote.contactPhone}`, marginX + halfWidth + 4, contactY);
  }

  y += recipientBoxHeight + 5;

  // ==========================================
  // 3. PROJECT TITLE & OBJECTIVES
  // ==========================================
  // Project title banner
  doc.setFillColor(255, 241, 242); // rose-50
  doc.setDrawColor(225, 29, 72); // rose-600
  doc.setLineWidth(0.6);
  doc.roundedRect(marginX, y, contentWidth, 11, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(225, 29, 72);
  doc.text('OGGETTO DELLA PROPOSTA:', marginX + 3.5, y + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(quote.projectTitle, marginX + 3.5, y + 8.5);

  y += 14;

  // Project description
  if (quote.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(quote.description, contentWidth);
    doc.text(descLines, marginX, y);
    y += descLines.length * 4.2 + 4;
  }

  // ==========================================
  // 4. ITEMIZED TABLE
  // ==========================================
  checkNewPage(40);

  // Table header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(marginX, y, contentWidth, 7.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Fascia d\'Età / Articolazione Percorso', marginX + 3, y + 5);
  doc.text('N° Lezioni', marginX + 96, y + 5, { align: 'center' });
  doc.text('Tariffa / Lez.', marginX + 138, y + 5, { align: 'right' });
  doc.text('Subtotale', pageWidth - marginX - 3, y + 5, { align: 'right' });

  y += 7.5;

  // Render Table rows
  quote.items.forEach((item, idx) => {
    const itemHasOpen = Boolean(item.hasOpenLesson);
    const itemOpenCost = itemHasOpen && item.includeOpenLessonCost ? (Number(item.openLessonCost) || 0) : 0;
    const isPerItemActive = isPerItem && itemHasOpen;

    // Calculate row height
    let rowHeight = 9.5;
    if (item.notes) rowHeight += 4;
    if (isPerItemActive) rowHeight += 6.5;

    checkNewPage(rowHeight);

    // Row background
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.rect(marginX, y, contentWidth, rowHeight, 'FD');

    let textY = y + 5;

    // Age group name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(item.ageGroup, marginX + 3, textY);

    // Lessons count
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`${item.numLessons} lezioni`, marginX + 96, textY, { align: 'center' });

    // Price per lesson
    doc.text(`€ ${item.pricePerLesson.toFixed(2)}`, marginX + 138, textY, { align: 'right' });

    // Subtotal
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(225, 29, 72);
    doc.text(`€ ${item.total.toFixed(2)}`, pageWidth - marginX - 3, textY, { align: 'right' });

    // Notes if present
    if (item.notes) {
      textY += 4;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(item.notes, marginX + 3, textY);
    }

    // Per-item Open Lesson line
    if (isPerItemActive) {
      textY += 4.5;
      doc.setFillColor(254, 243, 199); // amber-100
      doc.roundedRect(marginX + 3, textY - 3, contentWidth - 6, 4.5, 0.8, 0.8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(146, 64, 14); // amber-800
      doc.text('Lezione Aperta con le famiglie: ', marginX + 5, textY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 53, 15);
      const detailStr = item.openLessonDetails || 'Incontro finale di condivisione con genitori';
      doc.text(detailStr.slice(0, 75), marginX + 46, textY);

      doc.setFont('helvetica', 'bold');
      if (itemOpenCost > 0) {
        doc.setTextColor(225, 29, 72);
        doc.text(`+ € ${itemOpenCost.toFixed(2)} (nel tot)`, pageWidth - marginX - 5, textY, { align: 'right' });
      } else {
        doc.setTextColor(4, 120, 87); // emerald-700
        doc.text('Inclusa nel monte ore (€ 0)', pageWidth - marginX - 5, textY, { align: 'right' });
      }
    }

    y += rowHeight;
  });

  y += 4;

  // ==========================================
  // 5. OPEN LESSONS SUMMARY BOX (if applicable)
  // ==========================================
  if (isGlobal && quote.hasOpenLessons) {
    checkNewPage(16);
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.setLineWidth(0.4);
    doc.roundedRect(marginX, y, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 53, 15);
    doc.text('OPZIONE LEZIONE APERTA UNICA CON LE FAMIGLIE (per tutti i gruppi)', marginX + 3.5, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(globalHasCost ? 225 : 4, globalHasCost ? 29 : 120, globalHasCost ? 72 : 87);
    doc.text(
      globalHasCost ? `+ € ${Number(quote.openLessonsCost).toFixed(2)}` : 'Inclusa nel progetto (€ 0,00)',
      pageWidth - marginX - 3.5,
      y + 5,
      { align: 'right' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14);
    const openDetails = quote.openLessonsDetails || '1 lezione aperta finale di condivisione per ciascun gruppo alla presenza dei genitori.';
    doc.text(openDetails, marginX + 3.5, y + 10);

    y += 18;
  } else if (isPerItem && quote.items.some((it) => it.hasOpenLesson)) {
    checkNewPage(14);
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.4);
    doc.roundedRect(marginX, y, contentWidth, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 53, 15);
    doc.text('LEZIONI APERTE CON LE FAMIGLIE PER FASCIA D\'ETÀ', marginX + 3.5, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(perItemTotalOpenCost > 0 ? 225 : 4, perItemTotalOpenCost > 0 ? 29 : 120, perItemTotalOpenCost > 0 ? 72 : 87);
    doc.text(
      perItemTotalOpenCost > 0 ? `+ € ${perItemTotalOpenCost.toFixed(2)} (totale quote aperte)` : 'Tutte incluse nel progetto',
      pageWidth - marginX - 3.5,
      y + 5,
      { align: 'right' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14);
    const count = quote.items.filter((it) => it.hasOpenLesson).length;
    doc.text(`Previste lezioni aperte dedicate per ${count} sezioni/fasce d'età con la partecipazione delle famiglie.`, marginX + 3.5, y + 9.5);

    y += 16;
  }

  // ==========================================
  // 6. MATERIALS & DETAILS
  // ==========================================
  if (quote.materialsIncluded) {
    checkNewPage(12);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(marginX, y, contentWidth, 9, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Materiali e Strumentario: ', marginX + 3, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(quote.materialsIncluded.slice(0, 110), marginX + 38, y + 5.5);

    y += 12;
  }

  // Notes if any
  if (quote.notes) {
    checkNewPage(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Note: ', marginX, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(quote.notes, marginX + 10, y + 4);
    y += 8;
  }

  // ==========================================
  // 7. GRAND TOTAL BOX
  // ==========================================
  checkNewPage(20);

  doc.setFillColor(255, 241, 242); // rose-50
  doc.setDrawColor(225, 29, 72); // rose-600
  doc.setLineWidth(0.8);
  doc.roundedRect(marginX, y, contentWidth, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(136, 19, 55); // rose-900
  doc.text('TOTALE COMPLESSIVO PREVENTIVO', marginX + 4, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(159, 18, 57);
  let validityText = `Validità offerta: ${quote.validityDays || 60} giorni dalla data di emissione`;
  if (isPerItem && perItemTotalOpenCost > 0) {
    validityText = `Include lezioni corsi + quote lezioni aperte per fasce (+ € ${perItemTotalOpenCost.toFixed(2)}) · ${validityText}`;
  } else if (globalHasCost) {
    validityText = `Include lezioni corsi + lezione aperta unica (+ € ${Number(quote.openLessonsCost).toFixed(2)}) · ${validityText}`;
  }
  doc.text(validityText, marginX + 4, y + 11.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(225, 29, 72);
  doc.text(formatCurrency(quote.totalAmount), pageWidth - marginX - 4, y + 10.5, { align: 'right' });

  y += 24;

  // ==========================================
  // 8. SIGNATURES
  // ==========================================
  checkNewPage(26);

  const signBoxWidth = (contentWidth - 14) / 2;

  // Left: Scuola di Canto
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Per Do-Re-MInsieme', marginX + signBoxWidth / 2, y, { align: 'center' });

  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.setLineWidth(0.3);
  doc.line(marginX + 8, y + 12, marginX + signBoxWidth - 8, y + 12);

  doc.setLineDashPattern([], 0); // reset
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Il Responsabile Didattico / Docente', marginX + signBoxWidth / 2, y + 16, { align: 'center' });

  // Right: Scuola per accettazione
  const rightSignX = marginX + signBoxWidth + 14;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Per Accettazione (Scuola)', rightSignX + signBoxWidth / 2, y, { align: 'center' });

  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.setLineWidth(0.3);
  doc.line(rightSignX + 8, y + 12, rightSignX + signBoxWidth - 8, y + 12);

  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Timbro della Scuola e Firma del Dirigente', rightSignX + signBoxWidth / 2, y + 16, { align: 'center' });

  // Download the PDF file directly!
  const cleanNum = quote.quoteNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
  const cleanSchool = (quote.schoolName || 'Scuola').slice(0, 30).replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `Preventivo_${cleanNum}_${cleanSchool}.pdf`;

  doc.save(filename);
}
