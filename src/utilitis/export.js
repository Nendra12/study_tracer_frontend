const pad = (n) => String(n).padStart(2, '0');

const getTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

const sanitizeFilePart = (value) => {
  return String(value || '')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '_');
};

export const createExportFileName = (prefix, extension) => {
  const safePrefix = sanitizeFilePart(prefix) || 'export';
  return `${safePrefix}_${getTimestamp()}.${extension}`;
};

export const downloadBlobFile = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const escapeCsvCell = (cell) => {
  const value = String(cell ?? '');
  return `"${value.replace(/"/g, '""')}"`;
};

const countDelimiterOutsideQuotes = (line, delimiter) => {
  let inQuotes = false;
  let count = 0;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === delimiter) {
      count += 1;
    }
  }

  return count;
};

const detectCsvDelimiter = (lines) => {
  const sample = lines.find((line) => line.trim().length > 0) || '';
  const commaCount = countDelimiterOutsideQuotes(sample, ',');
  const semicolonCount = countDelimiterOutsideQuotes(sample, ';');

  if (semicolonCount > commaCount) return ';';
  return ',';
};

const parseCsvLine = (line, delimiter) => {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === delimiter) {
      fields.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  fields.push(current);
  return fields;
};

const normalizeCsvText = (rawContent) => {
  const withoutBom = String(rawContent ?? '').replace(/^\uFEFF/, '');
  const allLines = withoutBom.split(/\r?\n/);

  while (allLines.length > 0 && allLines[0].trim().toLowerCase().startsWith('sep=')) {
    allLines.shift();
  }

  if (allLines.length === 0) {
    return 'sep=;\n';
  }

  const sourceDelimiter = detectCsvDelimiter(allLines);
  const normalizedRows = allLines.map((line) => {
    if (line === '') return '';
    const cells = parseCsvLine(line, sourceDelimiter);
    return cells.map(escapeCsvCell).join(';');
  });

  return ['sep=;', ...normalizedRows].join('\n');
};

export const buildCsvContent = (headers, rows) => {
  const matrix = [headers, ...rows];
  return ['sep=;', ...matrix.map((row) => row.map(escapeCsvCell).join(';'))].join('\n');
};

export const downloadCsv = ({ headers, rows, prefix }) => {
  const content = buildCsvContent(headers, rows);
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const fileName = createExportFileName(prefix, 'csv');
  downloadBlobFile(blob, fileName);
};

const readBlobLikeAsText = async (payload) => {
  if (payload instanceof Blob) {
    return payload.text();
  }
  if (typeof payload === 'string') {
    return payload;
  }
  if (payload instanceof ArrayBuffer) {
    return new TextDecoder('utf-8').decode(payload);
  }
  if (ArrayBuffer.isView(payload)) {
    return new TextDecoder('utf-8').decode(payload);
  }
  return String(payload ?? '');
};

export const downloadCsvFromPayload = async ({ payload, prefix }) => {
  const rawText = await readBlobLikeAsText(payload);
  const normalizedText = normalizeCsvText(rawText);
  const blob = new Blob(['\uFEFF' + normalizedText], { type: 'text/csv;charset=utf-8;' });
  const fileName = createExportFileName(prefix, 'csv');
  downloadBlobFile(blob, fileName);
};
