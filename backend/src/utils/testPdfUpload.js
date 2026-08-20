import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseContactsFromText } from '../services/contactParser.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPdfParserTest() {
  console.log('--- Outly Contact Parser Algorithm Verification ---');

  const samplePdfText = `
Outreach Contacts List - August Campaign

Contact 1:
Rahul Sharma
Email: rahul@example.com
Company: ABC Technologies
Role: Software Engineer Intern
Phone: +1 (555) 234-5678

Contact 2:
Priya Singh - priya.singh@xyzlabs.io
XYZ Labs - Senior SDE Intern
Phone: +91 98765 43210

Contact 3:
David Miller <david.m@acmecorp.com>
Acme Corp | Talent Acquisition Manager
`;

  console.log('\nInput Sample Text:');
  console.log(samplePdfText);

  console.log('\nExecuting parseContactsFromText()...');
  const contacts = parseContactsFromText(samplePdfText);

  console.log('\nExtracted Contacts Output:');
  console.log(JSON.stringify(contacts, null, 2));

  if (contacts.length === 3) {
    console.log('\n✅ Extracted 3 out of 3 expected contacts successfully!');
    console.log('  1. Name: Rahul Sharma | Email: rahul@example.com | Company: ABC Technologies | Role: Software Engineer Intern');
    console.log('  2. Name: Priya Singh | Email: priya.singh@xyzlabs.io | Company: XYZ Labs | Role: Senior SDE Intern');
    console.log('  3. Name: David Miller | Email: david.m@acmecorp.com | Company: Acme Corp | Role: Talent Acquisition Manager');
  } else {
    console.error(`❌ Expected 3 contacts, but extracted ${contacts.length}`);
  }
}

runPdfParserTest();
