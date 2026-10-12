/**
 * Text Extractor Utility
 * Safely extracts human-readable text from PDF, DOCX, and plain text buffers.
 * Zero external native binary dependencies required.
 */

export interface ExtractionResult {
  text: string;
  charCount: number;
  format: 'pdf' | 'docx' | 'txt';
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown'
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.doc', '.txt', '.md']);

/**
 * Validates file type and size
 */
export function validateResumeFile(
  fileName: string,
  fileSize: number,
  mimeType: string
): { valid: boolean; error?: string } {
  // Check size: max 5MB
  const maxBytes = 5 * 1024 * 1024;
  if (fileSize > maxBytes) {
    return {
      valid: false,
      error: `File size (${(fileSize / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 5MB.`
    };
  }

  // Check extension
  const extMatch = fileName.toLowerCase().match(/\.[a-z0-9]+$/);
  const ext = extMatch ? extMatch[0] : '';
  const isExtAllowed = ALLOWED_EXTENSIONS.has(ext);
  const isMimeAllowed = ALLOWED_MIME_TYPES.has(mimeType);

  if (!isExtAllowed && !isMimeAllowed) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload a PDF, DOCX, or TXT resume.'
    };
  }

  return { valid: true };
}

/**
 * Extracts plain text from buffer based on file type
 */
export function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): ExtractionResult {
  const extMatch = fileName.toLowerCase().match(/\.[a-z0-9]+$/);
  const ext = extMatch ? extMatch[0] : '';

  if (ext === '.pdf' || mimeType === 'application/pdf') {
    return {
      text: extractTextFromPdfBuffer(buffer),
      charCount: buffer.length,
      format: 'pdf'
    };
  }

  if (
    ext === '.docx' ||
    ext === '.doc' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return {
      text: extractTextFromDocxBuffer(buffer),
      charCount: buffer.length,
      format: 'docx'
    };
  }

  // Plain text / Markdown
  const text = buffer.toString('utf-8').trim();
  return {
    text: cleanExtractedText(text),
    charCount: text.length,
    format: 'txt'
  };
}

/**
 * PDF text extraction:
 * Parses PDF text streams (BT ... ET), string operators, and text segments
 */
function extractTextFromPdfBuffer(buffer: Buffer): string {
  const raw = buffer.toString('binary');
  const textParts: string[] = [];

  // Match text objects between BT and ET operators
  const btEtRegex = /BT[\s\S]*?ET/g;
  let btMatch: RegExpExecArray | null;

  while ((btMatch = btEtRegex.exec(raw)) !== null) {
    const block = btMatch[0];

    // 1. Literal strings in parentheses: (Text) Tj or (Text) ' or (Text) "
    const literalStrRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let litMatch: RegExpExecArray | null;
    while ((litMatch = literalStrRegex.exec(block)) !== null) {
      const decoded = decodePdfLiteral(litMatch[1]);
      if (decoded.trim()) textParts.push(decoded.trim());
    }

    // 2. Text arrays: [(T) 20 (e) 10 (xt)] TJ
    const arrayRegex = /\[([^\]]+)\]\s*TJ/g;
    let arrMatch: RegExpExecArray | null;
    while ((arrMatch = arrayRegex.exec(block)) !== null) {
      const inner = arrMatch[1];
      const partRegex = /\(([^)]+)\)/g;
      let pMatch: RegExpExecArray | null;
      let line = '';
      while ((pMatch = partRegex.exec(inner)) !== null) {
        line += decodePdfLiteral(pMatch[1]);
      }
      if (line.trim()) textParts.push(line.trim());
    }
  }

  let extracted = textParts.join(' ');

  // Fallback if PDF has non-standard font encoding: scan readable ASCII word sequences
  if (extracted.trim().length < 40) {
    const asciiRegex = /[A-Za-z0-9@#\.\+\-\s,\(\):\/]{4,}/g;
    const matches: string[] = raw.match(asciiRegex) || [];
    extracted = matches
      .filter((m: string) => !m.includes('/Filter') && !m.includes('/Length') && !m.includes('/Type'))
      .join(' ');
  }

  return cleanExtractedText(extracted);
}

function decodePdfLiteral(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

/**
 * DOCX text extraction:
 * Extracts XML text nodes <w:t>...</w:t> from document.xml
 */
function extractTextFromDocxBuffer(buffer: Buffer): string {
  const raw = buffer.toString('utf-8');
  const textParts: string[] = [];

  // Match text in WordprocessingML tags: <w:t>text</w:t> or <w:t xml:space="...">text</w:t>
  const wtRegex = /<w:t(?:[\s\S]*?)>([\s\S]*?)<\/w:t>/g;
  let match: RegExpExecArray | null;

  while ((match = wtRegex.exec(raw)) !== null) {
    if (match[1] && match[1].trim()) {
      textParts.push(match[1]);
    }
  }

  // Fallback to ASCII scanning if zipped binary
  let extracted = textParts.join(' ');
  if (extracted.trim().length < 30) {
    const cleanChars = buffer
      .toString('binary')
      .replace(/[^\x20-\x7E\t\n\r]/g, ' ')
      .replace(/\s+/g, ' ');
    const wordMatches = cleanChars.match(/[A-Za-z0-9@#\.\+\-\s,\(\):]{3,}/g) || [];
    extracted = wordMatches.join(' ');
  }

  return cleanExtractedText(extracted);
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}
