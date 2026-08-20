/**
 * Template variable replacement helper
 * Replaces {{name}}, {{email}}, {{company}}, {{role}} with target contact data
 */
export function renderTemplate(templateStr, contact = {}) {
  if (!templateStr || typeof templateStr !== 'string') {
    return '';
  }

  const nameVal = contact.name || 'there';
  const emailVal = contact.email || '';
  const companyVal = contact.company || 'your company';
  const roleVal = contact.role || 'the open position';

  return templateStr
    .replace(/\{\{\s*name\s*\}\}/gi, nameVal)
    .replace(/\{\{\s*email\s*\}\}/gi, emailVal)
    .replace(/\{\{\s*company\s*\}\}/gi, companyVal)
    .replace(/\{\{\s*role\s*\}\}/gi, roleVal);
}

export const TEMPLATE_VARIABLES = [
  { tag: '{{name}}', label: 'Contact Name', fallback: 'Rahul Sharma' },
  { tag: '{{email}}', label: 'Email Address', fallback: 'rahul@example.com' },
  { tag: '{{company}}', label: 'Company Name', fallback: 'ABC Technologies' },
  { tag: '{{role}}', label: 'Job Role / Title', fallback: 'Software Engineer Intern' },
];
