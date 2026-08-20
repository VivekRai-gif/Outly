import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');

/**
 * Job title/role keywords
 */
const ROLE_KEYWORDS = [
  'software engineer', 'sde', 'developer', 'intern', 'manager', 'director', 'lead',
  'designer', 'analyst', 'consultant', 'recruiter', 'founder', 'co-founder',
  'ceo', 'cto', 'vp', 'head of', 'architect', 'specialist', 'talent acquisition',
  'engineer', 'coordinator', 'associate', 'executive'
];

/**
 * Company keywords
 */
const COMPANY_KEYWORDS = [
  'inc', 'corp', 'corporation', 'llc', 'labs', 'technologies', 'technology',
  'tech', 'ltd', 'limited', 'solutions', 'systems', 'group', 'studio',
  'university', 'capital', 'ventures', 'services', 'ai', 'co', 'agency'
];

function cleanText(text) {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

function nameFromEmail(email) {
  if (!email || !email.includes('@')) return '';
  const username = email.split('@')[0];
  const parts = username.split(/[._-]/).filter(p => p.length > 0 && isNaN(p));
  if (parts.length === 0) return '';
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

export function parseContactsFromText(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Pre-clean mailto: prefixes and obfuscations
  let cleanedText = text
    .replace(/mailto:/gi, '')
    .replace(/\s*\[at\]\s*/gi, '@')
    .replace(/\s*\(at\)\s*/gi, '@')
    .replace(/\s*\[dot\]\s*/gi, '.')
    .replace(/\s*\(dot\)\s*/gi, '.');

  const lines = cleanedText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  
  const emailMatches = [];
  const seenEmails = new Set();

  lines.forEach((line, lineIndex) => {
    const matches = line.match(emailRegex);
    if (matches) {
      matches.forEach(email => {
        const normalizedEmail = email.toLowerCase().trim();
        if (!seenEmails.has(normalizedEmail)) {
          seenEmails.add(normalizedEmail);
          emailMatches.push({ email: normalizedEmail, line, lineIndex });
        }
      });
    }
  });

  const parsedContacts = emailMatches.map(({ email, line, lineIndex }) => {
    let name = '';
    let company = '';
    let role = '';
    let phone = '';

    // Context window: up to 2 lines before and 2 lines after
    const startIdx = Math.max(0, lineIndex - 2);
    const endIdx = Math.min(lines.length - 1, lineIndex + 2);
    const rawContextLines = lines.slice(startIdx, endIdx + 1);
    const contextLines = rawContextLines.filter((l, idx) => {
      const actualLineIdx = startIdx + idx;
      if (actualLineIdx === lineIndex) return true;
      return !emailRegex.test(l);
    });

    // 1. Phone extraction within context window
    for (const ctxLine of contextLines) {
      const pMatches = ctxLine.match(phoneRegex);
      if (pMatches) {
        for (const pm of pMatches) {
          if (pm.replace(/\D/g, '').length >= 7) {
            phone = pm.trim();
            break;
          }
        }
      }
      if (phone) break;
    }

    // 2. Name extraction
    let emailLineClean = line.replace(emailRegex, '').replace(phoneRegex, '').replace(/^(email|contact|name)\s*:\s*/i, '').replace(/[-|<>()]/g, ' ').trim();
    emailLineClean = cleanText(emailLineClean);

    if (emailLineClean && emailLineClean.length >= 2 && emailLineClean.length < 40 && !/\d/.test(emailLineClean) && !/^(email|phone|company|role)$/i.test(emailLineClean)) {
      name = emailLineClean;
    } else {
      for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 2); i--) {
        const prevLine = lines[i];
        if (!prevLine || prevLine.includes('@')) continue;
        
        let candidate = prevLine.replace(/^(name|contact|person)\s*:\s*/i, '').trim();
        if (/^(email|phone|company|role|contact|contact \d+)$/i.test(candidate)) continue;

        const words = candidate.split(/\s+/);
        if (
          words.length >= 1 &&
          words.length <= 4 &&
          !/\d/.test(candidate) &&
          !ROLE_KEYWORDS.some(r => candidate.toLowerCase().includes(r)) &&
          !COMPANY_KEYWORDS.some(c => candidate.toLowerCase().includes(c))
        ) {
          name = cleanText(candidate);
          break;
        }
      }
    }

    if (!name || /^(email|phone|contact|role)$/i.test(name)) {
      name = nameFromEmail(email);
    }

    // 3. Role & Company Extraction
    for (const ctxLine of contextLines) {
      const lower = ctxLine.toLowerCase();
      const matchedRole = ROLE_KEYWORDS.find(keyword => lower.includes(keyword));
      
      if (matchedRole) {
        let cleanRoleLine = ctxLine.replace(emailRegex, '').replace(phoneRegex, '').trim();
        cleanRoleLine = cleanRoleLine.replace(/^(role|title|position|job)\s*:\s*/i, '');

        if (/\s+(at|-|\|)\s+/i.test(cleanRoleLine)) {
          const parts = cleanRoleLine.split(/\s+(?:at|-|\|)\s+/i);
          if (parts.length >= 2) {
            role = cleanText(parts[0]);
            company = cleanText(parts.slice(1).join(' '));
            break;
          }
        }

        if (!role && cleanRoleLine.length > 0 && cleanRoleLine.length < 60) {
          role = cleanText(cleanRoleLine);
        }
      }
    }

    if (!company) {
      for (const ctxLine of contextLines) {
        const lower = ctxLine.toLowerCase();
        const hasCompanyKeyword = COMPANY_KEYWORDS.some(kw => lower.includes(kw));
        const hasCompanyLabel = /^(company|organization|org|works at)\s*:\s*/i.test(ctxLine);

        if ((hasCompanyKeyword || hasCompanyLabel) && !lower.includes(email) && ctxLine !== role) {
          let cleanCompanyLine = ctxLine.replace(emailRegex, '').replace(phoneRegex, '').trim();
          cleanCompanyLine = cleanCompanyLine.replace(/^(company|organization|org|works at)\s*:\s*/i, '');
          if (cleanCompanyLine.length > 0 && cleanCompanyLine.length < 60) {
            company = cleanText(cleanCompanyLine);
            break;
          }
        }
      }
    }

    return {
      name: name || nameFromEmail(email) || 'Extracted Contact',
      email,
      company: company || '',
      role: role || '',
      phone: phone || '',
      status: 'pending',
    };
  });

  return parsedContacts;
}

export async function extractContactsFromPdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    let rawText = '';
    let numPages = 1;

    // Try pdf-parse v1 / v2 APIs
    try {
      if (typeof pdfParseModule === 'function') {
        const parsedData = await pdfParseModule(dataBuffer);
        rawText = parsedData.text || '';
        numPages = parsedData.numpages || 1;
      } else if (pdfParseModule && typeof pdfParseModule.PDFParse === 'function') {
        const instance = new pdfParseModule.PDFParse({ data: dataBuffer });
        const textResult = await instance.getText();
        rawText = typeof textResult === 'string' ? textResult : (textResult?.text || textResult?.pages?.map(p => p.text).join('\n') || '');
        numPages = textResult?.pages?.length || textResult?.numpages || 1;
      } else if (pdfParseModule && typeof pdfParseModule.default === 'function') {
        const parsedData = await pdfParseModule.default(dataBuffer);
        rawText = parsedData.text || '';
        numPages = parsedData.numpages || 1;
      }
    } catch (parseErr) {
      console.warn('[PDF Parser Notice] Standard stream parsing failed, using binary buffer fallback:', parseErr.message);
    }

    let contacts = parseContactsFromText(rawText);

    // Fallback: If no text or contacts extracted from stream, scan raw PDF buffer string
    if (contacts.length === 0) {
      const bufferText = dataBuffer.toString('latin1');
      contacts = parseContactsFromText(bufferText);
    }

    return {
      textLength: rawText.length,
      numPages,
      contactsCount: contacts.length,
      contacts,
    };
  } catch (error) {
    console.error('[PDF Parser Error]:', error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}
