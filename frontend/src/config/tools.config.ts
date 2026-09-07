export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'pdf' | 'images' | 'documents' | 'ai';
  iconName: string;
  inputFormats: string[];
  outputFormat: string;
  accept: string;
  multipleFiles?: boolean;
  requiresOptions?: boolean;
  apiEndpoint: string;
  seoTitle: string;
  seoDescription: string;
  howToSteps: string[];
  limitations: string[];
  faqs: ToolFaq[];
}

export const TOOLS_CONFIG: Record<string, ToolConfig> = {
  'pdf-to-word': {
    id: 'pdf-to-word',
    name: 'PDF to Word Converter',
    tagline: 'Convert PDF documents into editable Microsoft Word files.',
    description: 'Transform PDF documents into fully editable Word (.docx) files while preserving headings, paragraphs, tables, images, and formatting structure.',
    category: 'pdf',
    iconName: 'FileText',
    inputFormats: ['PDF'],
    outputFormat: 'DOCX',
    accept: '.pdf,application/pdf',
    apiEndpoint: '/api/v1/convert/pdf-to-word',
    seoTitle: 'PDF to Word Converter — Free Online | Pick Your Document',
    seoDescription: 'Convert PDF files to editable Word (.docx) documents online instantly. High accuracy formatting preservation and 100% secure.',
    howToSteps: [
      'Upload your PDF file using the drop zone or file browser.',
      'Click Convert to start the automated PDF to Word transformation.',
      'Download your formatted, fully editable DOCX file immediately.'
    ],
    limitations: [
      'Scanned PDFs without text layers will extract text using layout reconstruction algorithms.',
      'Extremely complex layered vector graphics may experience minor alignment shifts.'
    ],
    faqs: [
      {
        question: 'Will my converted Word document be fully editable?',
        answer: 'Yes! Text, tables, headings, and paragraphs are converted into standard editable Word elements.'
      },
      {
        question: 'Are my uploaded PDF files safe?',
        answer: 'All uploaded files are processed securely in temporary isolated memory and automatically deleted after processing.'
      }
    ]
  },
  'word-to-pdf': {
    id: 'word-to-pdf',
    name: 'Word to PDF Converter',
    tagline: 'Convert DOCX and DOC documents into clean, non-alterable PDF files.',
    description: 'Convert Microsoft Word documents into universal PDF format with crisp text layout rendering and high fidelity font display.',
    category: 'documents',
    iconName: 'FileUp',
    inputFormats: ['DOCX', 'DOC'],
    outputFormat: 'PDF',
    accept: '.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword',
    apiEndpoint: '/api/v1/convert/word-to-pdf',
    seoTitle: 'Word to PDF Converter — Free Online | Pick Your Document',
    seoDescription: 'Convert Microsoft Word (.docx) files into clean, professional PDF documents instantly online.',
    howToSteps: [
      'Select and upload your DOCX file.',
      'Click Convert to execute the server layout engine.',
      'Download your generated PDF document.'
    ],
    limitations: [
      'Embedded proprietary macros (.docm) are converted cleanly without active execution.'
    ],
    faqs: [
      {
        question: 'Can I convert multiple Word documents?',
        answer: 'Yes, you can convert Word files sequentially or convert batch documents seamlessly.'
      }
    ]
  },
  'pdf-to-text': {
    id: 'pdf-to-text',
    name: 'PDF to Text Extractor',
    tagline: 'Extract all readable textual content from PDF pages.',
    description: 'Instantly pull clean raw text from PDF documents page by page into a readable text file or editable web editor.',
    category: 'pdf',
    iconName: 'AlignLeft',
    inputFormats: ['PDF'],
    outputFormat: 'TXT',
    accept: '.pdf,application/pdf',
    apiEndpoint: '/api/v1/convert/pdf-to-text',
    seoTitle: 'PDF to Text Extractor — Free Online | Pick Your Document',
    seoDescription: 'Extract raw text content from PDF documents page by page. Download TXT output instantly.',
    howToSteps: [
      'Upload the target PDF file.',
      'Start text extraction.',
      'Copy extracted text directly or download as a .txt file.'
    ],
    limitations: [
      'If the PDF is a scanned image with no text layer, try using our Image to Text (OCR) tool.'
    ],
    faqs: [
      {
        question: 'Does this tool support multi-page PDFs?',
        answer: 'Yes, page markers (e.g. --- Page 1 ---) separate each extracted page.'
      }
    ]
  },
  'image-to-text': {
    id: 'image-to-text',
    name: 'Image to Text (OCR)',
    tagline: 'Extract typed or printed text from images using Optical Character Recognition.',
    description: 'Use advanced OCR algorithms to read images (JPG, PNG, WebP), extract embedded text into an interactive editor, copy text, or export TXT.',
    category: 'images',
    iconName: 'ScanText',
    inputFormats: ['JPG', 'PNG', 'WEBP'],
    outputFormat: 'TXT',
    accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp',
    apiEndpoint: '/api/v1/convert/image-to-text',
    seoTitle: 'Image to Text Converter (OCR) — Free Online | Pick Your Document',
    seoDescription: 'Extract text from JPG, PNG, and WebP images online using fast OCR. Copy or download extracted text immediately.',
    howToSteps: [
      'Upload an image containing text.',
      'Run Optical Character Recognition.',
      'Edit, copy, or download the extracted plain text.'
    ],
    limitations: [
      'High contrast and clear font resolution yield maximum extraction accuracy.'
    ],
    faqs: [
      {
        question: 'Can I edit the text after extraction?',
        answer: 'Yes! The extracted text is displayed in a live editable text area with copy-to-clipboard functionality.'
      }
    ]
  },
  'image-to-pdf': {
    id: 'image-to-pdf',
    name: 'Image to PDF Converter',
    tagline: 'Combine single or multiple images into a clean single PDF file.',
    description: 'Upload JPG, PNG, or WebP images, adjust sequence, and combine them into a single high quality PDF document.',
    category: 'images',
    iconName: 'ImagePlus',
    inputFormats: ['JPG', 'PNG', 'WEBP'],
    outputFormat: 'PDF',
    accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp',
    multipleFiles: true,
    apiEndpoint: '/api/v1/convert/image-to-pdf',
    seoTitle: 'Image to PDF Converter — Combine Images Online | Pick Your Document',
    seoDescription: 'Convert JPG, PNG, and WebP images into a single clean PDF document online for free.',
    howToSteps: [
      'Upload one or more image files.',
      'Reorder uploaded images into desired page sequence.',
      'Click Convert to generate the consolidated PDF.'
    ],
    limitations: [
      'Supported formats: JPG, JPEG, PNG, WebP up to 50MB per batch.'
    ],
    faqs: [
      {
        question: 'Can I reorder my images before creating the PDF?',
        answer: 'Yes, drag or move image thumbnails to set exact page sequence.'
      }
    ]
  },
  'pdf-to-jpg': {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG Converter',
    tagline: 'Render PDF document pages into high resolution JPEG images.',
    description: 'Convert every page of a PDF file into crisp JPEG graphics. Download individual images or a single compressed ZIP bundle.',
    category: 'pdf',
    iconName: 'Image',
    inputFormats: ['PDF'],
    outputFormat: 'JPG / ZIP',
    accept: '.pdf,application/pdf',
    apiEndpoint: '/api/v1/convert/pdf-to-jpg',
    seoTitle: 'PDF to JPG Converter — Convert PDF Pages to Images | Pick Your Document',
    seoDescription: 'Extract PDF pages as high quality JPEG images online. Download as single JPG or full ZIP archive.',
    howToSteps: [
      'Upload your PDF document.',
      'Start page rendering.',
      'Download rendered JPG images or ZIP archive.'
    ],
    limitations: [
      'Renders pages at 150 DPI for optimal balance of resolution and file size.'
    ],
    faqs: [
      {
        question: 'How are multi-page PDFs delivered?',
        answer: 'Single page PDFs download directly as a JPG file; multi-page PDFs download as a neat ZIP archive.'
      }
    ]
  },
  'merge-pdf': {
    id: 'merge-pdf',
    name: 'Merge PDF Files',
    tagline: 'Combine multiple PDF documents into one organized file.',
    description: 'Upload 2 or more PDF documents, reorder files into your preferred order, and merge them into a single unified PDF.',
    category: 'pdf',
    iconName: 'Combine',
    inputFormats: ['PDF'],
    outputFormat: 'PDF',
    accept: '.pdf,application/pdf',
    multipleFiles: true,
    apiEndpoint: '/api/v1/pdf/merge',
    seoTitle: 'Merge PDF Files — Combine PDFs Online | Pick Your Document',
    seoDescription: 'Merge multiple PDF documents into one single PDF file online. Fast, secure, drag-and-drop merging.',
    howToSteps: [
      'Upload two or more PDF files.',
      'Drag or arrange the files in your preferred sequence.',
      'Click Merge PDFs to combine into a single document.'
    ],
    limitations: [
      'Encrypted PDFs require decryption before merging.'
    ],
    faqs: [
      {
        question: 'Is there a limit on how many PDFs I can merge?',
        answer: 'You can merge up to 20 PDF files in a single operation under the standard limit.'
      }
    ]
  },
  'split-pdf': {
    id: 'split-pdf',
    name: 'Split PDF Document',
    tagline: 'Extract page ranges or split a PDF into separate files.',
    description: 'Separate PDF pages into custom page ranges (e.g. 1-3, 5, 8-10) or extract every single page into separate downloadable PDF files.',
    category: 'pdf',
    iconName: 'Scissors',
    inputFormats: ['PDF'],
    outputFormat: 'PDF / ZIP',
    accept: '.pdf,application/pdf',
    requiresOptions: true,
    apiEndpoint: '/api/v1/pdf/split',
    seoTitle: 'Split PDF Document — Extract PDF Pages Online | Pick Your Document',
    seoDescription: 'Split PDF files by page ranges or extract all pages into separate PDFs online.',
    howToSteps: [
      'Upload the PDF file you wish to split.',
      'Enter page ranges (e.g., 1-3, 5, 8-10) or leave blank to split all pages.',
      'Click Split PDF and download your resulting files.'
    ],
    limitations: [
      'Page numbers must be within total page count of the source document.'
    ],
    faqs: [
      {
        question: 'How do I specify page ranges?',
        answer: 'Use commas and hyphens, for example: "1-3, 5, 7-10".'
      }
    ]
  },
  'compress-pdf': {
    id: 'compress-pdf',
    name: 'Compress PDF File',
    tagline: 'Reduce PDF file size without sacrificing readability.',
    description: 'Optimize font structures, stream compression, and raster image resolution to shrink heavy PDF document file size for easier sharing.',
    category: 'pdf',
    iconName: 'Minimize2',
    inputFormats: ['PDF'],
    outputFormat: 'PDF',
    accept: '.pdf,application/pdf',
    apiEndpoint: '/api/v1/pdf/compress',
    seoTitle: 'Compress PDF File — Reduce PDF Size Online | Pick Your Document',
    seoDescription: 'Shrink PDF file size online while maintaining crisp readability. View percentage size reduction.',
    howToSteps: [
      'Upload your large PDF file.',
      'Click Compress PDF to trigger stream and image optimization.',
      'View total size reduction percentage and download your compressed PDF.'
    ],
    limitations: [
      'Already highly compressed vector-only PDFs may yield smaller percentage reductions.'
    ],
    faqs: [
      {
        question: 'Will compression degrade text quality?',
        answer: 'No! Text and vector graphics remain 100% sharp and readable.'
      }
    ]
  },
  'pdf-summary': {
    id: 'pdf-summary',
    name: 'AI PDF Summary',
    tagline: 'Generate instant key insights, summaries, action items, and terms.',
    description: 'Use artificial intelligence to extract PDF text, analyze document structure, and output a clean breakdown of Summary, Key Points, Important Terms, Action Items, and Review Questions.',
    category: 'ai',
    iconName: 'Sparkles',
    inputFormats: ['PDF'],
    outputFormat: 'JSON / Summary',
    accept: '.pdf,application/pdf',
    apiEndpoint: '/api/v1/ai/pdf-summary',
    seoTitle: 'AI PDF Summary — Summarize PDF Documents Online | Pick Your Document',
    seoDescription: 'Extract AI document summaries, key points, action items, and important terms from PDF files instantly.',
    howToSteps: [
      'Upload your PDF document.',
      'Click Generate AI Summary.',
      'Review structured insights across summary cards, copy key points, or export JSON breakdown.'
    ],
    limitations: [
      'PDF text must be extractable (scanned PDFs can be pre-processed with OCR).'
    ],
    faqs: [
      {
        question: 'What structured sections does the AI summary provide?',
        answer: 'You get Executive Summary, Key Points, Important Terms, Action Items, and Questions to Review.'
      }
    ]
  }
};

export const TOOL_CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'pdf', label: 'PDF Utilities' },
  { id: 'images', label: 'Image Utilities' },
  { id: 'documents', label: 'Document Converters' },
  { id: 'ai', label: 'AI Tools' },
];
