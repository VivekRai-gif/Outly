import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseContactsFromText } from '../services/contactParser.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPdfTest() {
  console.log('--- Outly PDF Contact Extraction Verification ---');

  const rawText = `
    Sample PDF Outreach Directory
    Rahul Sharma - rahul.sharma@abctech.com - +1-555-0192
    Software Engineer Intern at ABC Technologies

    Priya Patel - priya.patel@acmecorp.io
    Acme Corp | Talent Acquisition Manager

    David Miller
    Email: david.miller@techsolutions.org
    Company: Tech Solutions Inc
    Role: Product Director
  `;

  const extracted = parseContactsFromText(rawText);
  console.log('Extracted Contacts:', JSON.stringify(extracted, null, 2));

  if (extracted.length === 3) {
    console.log('\n✅ PDF CONTACT EXTRACTION VERIFIED SUCCESSFULLY!');
  } else {
    console.error('\n❌ Extraction count mismatch:', extracted.length);
  }
}

runPdfTest();
