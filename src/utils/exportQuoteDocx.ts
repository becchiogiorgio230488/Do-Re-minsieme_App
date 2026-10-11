import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  ShadingType,
} from 'docx';
import { SchoolQuote } from '../types';
import { formatDateLong, formatCurrency } from './dateHelpers';

/**
 * Generates an editable Microsoft Word (.docx) document from a SchoolQuote
 * and triggers an automatic browser download.
 */
export async function exportQuoteToWord(quote: SchoolQuote): Promise<void> {
  const isPerItem = quote.openLessonsScope === 'per_item' || quote.items.some((it) => it.hasOpenLesson);
  const isGlobal = quote.openLessonsScope === 'global' || (!quote.openLessonsScope && quote.hasOpenLessons && !isPerItem);

  const globalOpenLessonHasCost = Boolean(
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

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 dxa
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Letterhead header
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'DO-RE-MINSIEME',
                bold: true,
                size: 32, // 16pt
                color: 'E11D48', // Rose-600
                font: 'Arial',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: 'Scuola di Canto e Propedeutica Musicale',
                bold: true,
                size: 22, // 11pt
                color: '0F172A',
                font: 'Arial',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'Laboratori e Corsi Didattico-Musicali nelle Scuole',
                italics: true,
                size: 18, // 9pt
                color: '64748B',
                font: 'Arial',
              }),
            ],
          }),

          // Thin separator line table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      bottom: { style: BorderStyle.SINGLE, size: 16, color: 'E11D48' },
                      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    },
                    children: [new Paragraph({ spacing: { after: 100 } })],
                  }),
                ],
              }),
            ],
          }),

          // Quote title & Reference box
          new Paragraph({
            spacing: { before: 240, after: 120 },
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: `PREVENTIVO PROPOSTA PROGETTUALE: ${quote.quoteNumber}`,
                bold: true,
                size: 28, // 14pt
                color: '0F172A',
                font: 'Arial',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Data Emissione: `,
                bold: true,
                size: 20,
                color: '475569',
                font: 'Arial',
              }),
              new TextRun({
                text: `${formatDateLong(quote.date)}   |   `,
                size: 20,
                color: '334155',
                font: 'Arial',
              }),
              new TextRun({
                text: `Validità Offerta: `,
                bold: true,
                size: 20,
                color: '475569',
                font: 'Arial',
              }),
              new TextRun({
                text: `${quote.validityDays || 60} giorni`,
                size: 20,
                color: '334155',
                font: 'Arial',
              }),
            ],
          }),

          // Recipient Box Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                    },
                    children: [
                      new Paragraph({
                        spacing: { after: 60 },
                        children: [
                          new TextRun({
                            text: 'DESTINATARIO:',
                            bold: true,
                            size: 16,
                            color: '64748B',
                            font: 'Arial',
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [
                          new TextRun({
                            text: quote.schoolName,
                            bold: true,
                            size: 22,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                      ...(quote.schoolAddress
                        ? [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: quote.schoolAddress,
                                  size: 18,
                                  color: '475569',
                                  font: 'Arial',
                                }),
                              ],
                            }),
                          ]
                        : []),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                    margins: { top: 160, bottom: 160, left: 200, right: 200 },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                    },
                    children: [
                      new Paragraph({
                        spacing: { after: 60 },
                        children: [
                          new TextRun({
                            text: 'ALLA CORTESE ATTENZIONE DI:',
                            bold: true,
                            size: 16,
                            color: '64748B',
                            font: 'Arial',
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [
                          new TextRun({
                            text: quote.contactPerson || 'Dirigente Scolastico / Coordinatrice',
                            bold: true,
                            size: 20,
                            color: '0F172A',
                            font: 'Arial',
                          }),
                        ],
                      }),
                      ...(quote.contactEmail
                        ? [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: `Email: ${quote.contactEmail}`,
                                  size: 18,
                                  color: '475569',
                                  font: 'Arial',
                                }),
                              ],
                            }),
                          ]
                        : []),
                      ...(quote.contactPhone
                        ? [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: `Telefono: ${quote.contactPhone}`,
                                  size: 18,
                                  color: '475569',
                                  font: 'Arial',
                                }),
                              ],
                            }),
                          ]
                        : []),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Project Title & Scope
          new Paragraph({
            spacing: { before: 280, after: 100 },
            children: [
              new TextRun({
                text: 'OGGETTO E OBIETTIVI DEL LABORATORIO',
                bold: true,
                size: 20,
                color: 'E11D48',
                font: 'Arial',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: quote.projectTitle,
                bold: true,
                size: 24,
                color: '0F172A',
                font: 'Arial',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: quote.description,
                size: 20,
                color: '334155',
                font: 'Arial',
              }),
            ],
          }),

          // Items Table Title
          new Paragraph({
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: 'ARTICOLAZIONE E PIANO ECONOMICO DEL PERCORSO',
                bold: true,
                size: 20,
                color: '0F172A',
                font: 'Arial',
              }),
            ],
          }),

          // Table of items
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header Row
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: '0F172A', type: ShadingType.CLEAR, color: 'auto' },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Fascia d\'Età / Articolazione',
                            bold: true,
                            size: 18,
                            color: 'FFFFFF',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    shading: { fill: '0F172A', type: ShadingType.CLEAR, color: 'auto' },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: 'N° Lezioni',
                            bold: true,
                            size: 18,
                            color: 'FFFFFF',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 17, type: WidthType.PERCENTAGE },
                    shading: { fill: '0F172A', type: ShadingType.CLEAR, color: 'auto' },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: 'Tariffa / Lez.',
                            bold: true,
                            size: 18,
                            color: 'FFFFFF',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 18, type: WidthType.PERCENTAGE },
                    shading: { fill: '0F172A', type: ShadingType.CLEAR, color: 'auto' },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: 'Subtotale',
                            bold: true,
                            size: 18,
                            color: 'FFFFFF',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Data rows
              ...quote.items.map(
                (item, index) => {
                  const itemHasOpen = Boolean(item.hasOpenLesson);
                  const itemOpenCost = itemHasOpen && item.includeOpenLessonCost ? (Number(item.openLessonCost) || 0) : 0;

                  return new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        shading: {
                          fill: index % 2 === 0 ? 'FFFFFF' : 'F8FAFC',
                          type: ShadingType.CLEAR,
                          color: 'auto',
                        },
                        margins: { top: 120, bottom: 120, left: 160, right: 160 },
                        borders: {
                          bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
                          top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                        },
                        children: [
                          new Paragraph({
                            spacing: { after: 40 },
                            children: [
                              new TextRun({
                                text: item.ageGroup,
                                bold: true,
                                size: 19,
                                color: '0F172A',
                                font: 'Arial',
                              }),
                            ],
                          }),
                          ...(item.notes
                            ? [
                                new Paragraph({
                                  spacing: { after: itemHasOpen ? 40 : 0 },
                                  children: [
                                    new TextRun({
                                      text: item.notes,
                                      size: 16,
                                      color: '64748B',
                                      italics: true,
                                      font: 'Arial',
                                    }),
                                  ],
                                }),
                              ]
                            : []),
                          ...(isPerItem && itemHasOpen
                            ? [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: '• Lezione Aperta con le famiglie: ',
                                      bold: true,
                                      size: 16,
                                      color: 'B45309', // Amber-700
                                      font: 'Arial',
                                    }),
                                    new TextRun({
                                      text: `${item.openLessonDetails || 'Incontro finale di condivisione'} `,
                                      size: 16,
                                      color: '78350F',
                                      font: 'Arial',
                                    }),
                                    new TextRun({
                                      text: itemOpenCost > 0 ? `(+ € ${itemOpenCost.toFixed(2)})` : `(Inclusa nel monte ore)`,
                                      bold: true,
                                      size: 16,
                                      color: itemOpenCost > 0 ? 'E11D48' : '047857',
                                      font: 'Arial',
                                    }),
                                  ],
                                }),
                              ]
                            : []),
                        ],
                      }),
                      new TableCell({
                        width: { size: 15, type: WidthType.PERCENTAGE },
                        shading: {
                          fill: index % 2 === 0 ? 'FFFFFF' : 'F8FAFC',
                          type: ShadingType.CLEAR,
                          color: 'auto',
                        },
                        margins: { top: 120, bottom: 120, left: 160, right: 160 },
                        borders: {
                          bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
                          top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: `${item.numLessons}`,
                                bold: true,
                                size: 19,
                                color: '334155',
                                font: 'Arial',
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 17, type: WidthType.PERCENTAGE },
                        shading: {
                          fill: index % 2 === 0 ? 'FFFFFF' : 'F8FAFC',
                          type: ShadingType.CLEAR,
                          color: 'auto',
                        },
                        margins: { top: 120, bottom: 120, left: 160, right: 160 },
                        borders: {
                          bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
                          top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                text: `€ ${item.pricePerLesson.toFixed(2)}`,
                                size: 19,
                                color: '334155',
                                font: 'Arial',
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 18, type: WidthType.PERCENTAGE },
                        shading: {
                          fill: index % 2 === 0 ? 'FFFFFF' : 'F8FAFC',
                          type: ShadingType.CLEAR,
                          color: 'auto',
                        },
                        margins: { top: 120, bottom: 120, left: 160, right: 160 },
                        borders: {
                          bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
                          top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({
                                text: `€ ${item.total.toFixed(2)}`,
                                bold: true,
                                size: 19,
                                color: '0F172A',
                                font: 'Arial',
                              }),
                            ],
                          }),
                          ...(isPerItem && itemHasOpen && itemOpenCost > 0
                            ? [
                                new Paragraph({
                                  alignment: AlignmentType.RIGHT,
                                  children: [
                                    new TextRun({
                                      text: `+ € ${itemOpenCost.toFixed(2)} lez.`,
                                      size: 15,
                                      color: 'E11D48',
                                      font: 'Arial',
                                    }),
                                  ],
                                }),
                              ]
                            : []),
                        ],
                      }),
                    ],
                  });
                }
              ),

              // Open Lesson Row (if GLOBAL)
              ...(isGlobal && quote.hasOpenLessons
                ? [
                    new TableRow({
                      children: [
                        new TableCell({
                          width: { size: 50, type: WidthType.PERCENTAGE },
                          shading: { fill: 'FEF3C7', type: ShadingType.CLEAR, color: 'auto' }, // amber-100
                          margins: { top: 120, bottom: 120, left: 160, right: 160 },
                          borders: {
                            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'F59E0B' },
                            top: { style: BorderStyle.SINGLE, size: 2, color: 'F59E0B' },
                            left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                            right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          },
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: 'Lezione Aperta conclusiva unica con le Famiglie',
                                  bold: true,
                                  size: 19,
                                  color: '78350F',
                                  font: 'Arial',
                                }),
                              ],
                            }),
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: quote.openLessonsDetails || '1 lezione aperta finale di condivisione per ciascun gruppo alla presenza dei genitori.',
                                  size: 16,
                                  italics: true,
                                  color: '92400E',
                                  font: 'Arial',
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          width: { size: 15, type: WidthType.PERCENTAGE },
                          shading: { fill: 'FEF3C7', type: ShadingType.CLEAR, color: 'auto' },
                          margins: { top: 120, bottom: 120, left: 160, right: 160 },
                          borders: {
                            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'F59E0B' },
                            top: { style: BorderStyle.SINGLE, size: 2, color: 'F59E0B' },
                            left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                            right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          },
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [
                                new TextRun({
                                  text: 'Collettiva',
                                  size: 17,
                                  color: '78350F',
                                  font: 'Arial',
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          width: { size: 17, type: WidthType.PERCENTAGE },
                          shading: { fill: 'FEF3C7', type: ShadingType.CLEAR, color: 'auto' },
                          margins: { top: 120, bottom: 120, left: 160, right: 160 },
                          borders: {
                            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'F59E0B' },
                            top: { style: BorderStyle.SINGLE, size: 2, color: 'F59E0B' },
                            left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                            right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          },
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.RIGHT,
                              children: [
                                new TextRun({
                                  text: globalOpenLessonHasCost ? `Costo extra` : `Inclusa`,
                                  size: 17,
                                  bold: true,
                                  color: '78350F',
                                  font: 'Arial',
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          width: { size: 18, type: WidthType.PERCENTAGE },
                          shading: { fill: 'FEF3C7', type: ShadingType.CLEAR, color: 'auto' },
                          margins: { top: 120, bottom: 120, left: 160, right: 160 },
                          borders: {
                            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'F59E0B' },
                            top: { style: BorderStyle.SINGLE, size: 2, color: 'F59E0B' },
                            left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                            right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                          },
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.RIGHT,
                              children: [
                                new TextRun({
                                  text: globalOpenLessonHasCost
                                    ? `+ € ${Number(quote.openLessonsCost).toFixed(2)}`
                                    : '€ 0,00 (Inclusa)',
                                  bold: true,
                                  size: 19,
                                  color: '78350F',
                                  font: 'Arial',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ]
                : []),
            ],
          }),

          // Materials included section
          ...(quote.materialsIncluded
            ? [
                new Paragraph({
                  spacing: { before: 200, after: 60 },
                  children: [
                    new TextRun({
                      text: 'MATERIALI E STRUMENTARIO DIDATTICO:',
                      bold: true,
                      size: 18,
                      color: '475569',
                      font: 'Arial',
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { after: 200 },
                  children: [
                    new TextRun({
                      text: quote.materialsIncluded,
                      size: 19,
                      color: '1E293B',
                      font: 'Arial',
                    }),
                  ],
                }),
              ]
            : []),

          // Notes if any
          ...(quote.notes
            ? [
                new Paragraph({
                  spacing: { before: 100, after: 60 },
                  children: [
                    new TextRun({
                      text: 'NOTE ED INDICAZIONI OPERATIVE:',
                      bold: true,
                      size: 18,
                      color: '475569',
                      font: 'Arial',
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { after: 200 },
                  children: [
                    new TextRun({
                      text: quote.notes,
                      size: 19,
                      color: '1E293B',
                      font: 'Arial',
                    }),
                  ],
                }),
              ]
            : []),

          // Grand Total Callout Box
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 65, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FFF1F2', type: ShadingType.CLEAR, color: 'auto' }, // Rose-50
                    margins: { top: 180, bottom: 180, left: 240, right: 240 },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 8, color: 'E11D48' },
                      bottom: { style: BorderStyle.SINGLE, size: 8, color: 'E11D48' },
                      left: { style: BorderStyle.SINGLE, size: 8, color: 'E11D48' },
                      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'TOTALE COMPLESSIVO PREVENTIVO',
                            bold: true,
                            size: 22,
                            color: '881337',
                            font: 'Arial',
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: isPerItem && perItemTotalOpenCost > 0
                              ? `Include lezioni dei gruppi + quote lezioni aperte per fasce (+ € ${perItemTotalOpenCost.toFixed(2)})`
                              : globalOpenLessonHasCost
                              ? `Include tutte le lezioni delle fasce d'età + costo lezione aperta unica (€ ${Number(quote.openLessonsCost).toFixed(2)})`
                              : quote.hasOpenLessons
                              ? `Include tutte le lezioni previste e le lezioni aperte con le famiglie (comprese nel pacchetto)`
                              : `Include tutte le lezioni previste per le sezioni`,
                            size: 16,
                            color: '9F1239',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FFF1F2', type: ShadingType.CLEAR, color: 'auto' },
                    margins: { top: 180, bottom: 180, left: 240, right: 240 },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 8, color: 'E11D48' },
                      bottom: { style: BorderStyle.SINGLE, size: 8, color: 'E11D48' },
                      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      right: { style: BorderStyle.SINGLE, size: 8, color: 'E11D48' },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: formatCurrency(quote.totalAmount),
                            bold: true,
                            size: 32, // 16pt bold
                            color: 'E11D48',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Signatures section
          new Paragraph({
            spacing: { before: 600, after: 100 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                        children: [
                          new TextRun({
                            text: 'Per Do-Re-MInsieme',
                            italics: true,
                            size: 20,
                            color: '334155',
                            font: 'Arial',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: '__________________________________',
                            size: 18,
                            color: '94A3B8',
                            font: 'Arial',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: 'Il Responsabile Didattico / Docente',
                            bold: true,
                            size: 16,
                            color: '64748B',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                        children: [
                          new TextRun({
                            text: 'Per Accettazione (Scuola)',
                            italics: true,
                            size: 20,
                            color: '334155',
                            font: 'Arial',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: '__________________________________',
                            size: 18,
                            color: '94A3B8',
                            font: 'Arial',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: 'Timbro della Scuola e Firma del Dirigente',
                            bold: true,
                            size: 16,
                            color: '64748B',
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  // Generate and download .docx file
  const blob = await Packer.toBlob(doc);
  const cleanNum = quote.quoteNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
  const cleanSchool = (quote.schoolName || 'Scuola')
    .slice(0, 30)
    .replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `Preventivo_${cleanNum}_${cleanSchool}.docx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
