/**
 * Backend Email Personalization Utility
 * Safely replaces {{name}}, {{email}}, {{company}}, {{role}} with contact data
 * and graceful fallback values.
 */

export function personalizeText(templateStr, contact = {}) {
  if (!templateStr || typeof templateStr !== 'string') {
    return '';
  }

  const nameVal = contact.name && contact.name.trim() ? contact.name.trim() : 'there';
  const emailVal = contact.email && contact.email.trim() ? contact.email.trim() : '';
  const companyVal = contact.company && contact.company.trim() ? contact.company.trim() : 'your company';
  const roleVal = contact.role && contact.role.trim() ? contact.role.trim() : 'this position';

  return templateStr
    .replace(/\{\{\s*name\s*\}\}/gi, nameVal)
    .replace(/\{\{\s*email\s*\}\}/gi, emailVal)
    .replace(/\{\{\s*company\s*\}\}/gi, companyVal)
    .replace(/\{\{\s*role\s*\}\}/gi, roleVal);
}

export function personalizeEmail(subjectTemplate, bodyTemplate, contact = {}) {
  return {
    subject: personalizeText(subjectTemplate, contact),
    body: personalizeText(bodyTemplate, contact),
  };
}

export default {
  personalizeText,
  personalizeEmail,
};
