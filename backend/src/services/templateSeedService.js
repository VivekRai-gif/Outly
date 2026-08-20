import Template from '../models/Template.js';

export const SYSTEM_TEMPLATES = [
  // ==================== INTERNSHIP (7 Templates) ====================
  {
    title: 'Internship — Email 1',
    category: 'Internship',
    subject: 'Application for {{role}} Internship',
    body: 'Hi {{name}},\n\nI am a student at {{company}} and just applied for the {{role}} internship. I have worked on relevant projects and am eager to bring that experience to your team.\n\nThank you,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Internship — Email 2',
    category: 'Internship',
    subject: 'Interested in Interning at {{company}}',
    body: 'Hello {{name}},\n\nI am currently studying {{role}} and would love to intern with {{company}}. I have attached my resume highlighting my relevant experience in the field.\n\nHappy to share more if helpful.\n\nThanks,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Internship — Email 3',
    category: 'Internship',
    subject: 'Summer Internship Application — {{name}}',
    body: 'Hi {{name}},\n\nI recently submitted my application for the summer internship program at {{company}}. As a student focused on {{role}}, I am excited about learning from your engineering team.\n\nLet me know if you need anything else.\n\nRegards,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Internship — Email 4',
    category: 'Internship',
    subject: 'Following Up — {{role}} Application',
    body: 'Hi {{name}},\n\nI applied for the {{role}} internship last week and wanted to check in. I am particularly interested in {{company}} and believe my coursework and project background are a strong fit.\n\nThank you,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Internship — Email 5',
    category: 'Internship',
    subject: 'Aspiring {{role}} Intern',
    body: 'Hello {{name}},\n\nI am reaching out after applying for the {{role}} role at {{company}}. I have built practical skills through coursework and personal projects, and would love to contribute to your goals.\n\nThanks,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Internship — Email 6',
    category: 'Internship',
    subject: 'Engineering Intern Application for {{company}}',
    body: 'Hi {{name}},\n\nI am reaching out to express my enthusiastic interest in interning at {{company}} for the {{role}} position. My technical background aligns directly with your team\'s mission.\n\nBest regards,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Internship — Email 7',
    category: 'Internship',
    subject: 'Student Interested in {{company}} — {{role}}',
    body: 'Hi {{name}},\n\nI am studying {{role}} and recently applied for the internship at {{company}}. I would love the chance to learn from your team and contribute wherever I can.\n\nThank you,\nVivek Rai',
    isSystem: true,
  },

  // ==================== JOB APPLICATION (7 Templates) ====================
  {
    title: 'Job Application — Email 1',
    category: 'Job Application',
    subject: 'Application for {{role}} at {{company}}',
    body: 'Hi {{name}},\n\nI am reaching out regarding the {{role}} opportunity at {{company}}. I would appreciate the opportunity to connect and discuss how my skills align with your goals.\n\nRegards,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Job Application — Email 2',
    category: 'Job Application',
    subject: 'Enthusiastic {{role}} Candidate for {{company}}',
    body: 'Hello {{name}},\n\nI am excited to submit my candidacy for the {{role}} position at {{company}}. My experience in software engineering directly matches your team\'s tech stack.\n\nBest regards,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Job Application — Email 3',
    category: 'Job Application',
    subject: 'Experienced {{role}} Interested in {{company}}',
    body: 'Hi {{name}},\n\nHaving followed {{company}}\'s growth, I am thrilled to apply for the {{role}} opening. I bring relevant project experience and a strong work ethic.\n\nThank you,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Job Application — Email 4',
    category: 'Job Application',
    subject: 'Application Submission: {{role}} — Vivek Rai',
    body: 'Hello {{name}},\n\nI have officially submitted my application for {{role}} at {{company}}. I would love the chance to speak with your hiring team.\n\nRegards,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Job Application — Email 5',
    category: 'Job Application',
    subject: 'Following Up on My Application for {{role}}',
    body: 'Hi {{name}},\n\nI submitted my application for the {{role}} position at {{company}} last week and wanted to confirm if any additional materials are required.\n\nBest,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Job Application — Email 6',
    category: 'Job Application',
    subject: 'Why I am Eager to Join {{company}} as {{role}}',
    body: 'Hello {{name}},\n\nMy passion for building scalable solutions makes the {{role}} role at {{company}} an ideal match. I look forward to connecting.\n\nThanks,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Job Application — Email 7',
    category: 'Job Application',
    subject: '{{role}} Application — Vivek Rai',
    body: 'Hi {{name}},\n\nReaching out to express my keen interest in the {{role}} opening at {{company}}. Resume and project portfolio attached for your review.\n\nSincerely,\nVivek Rai',
    isSystem: true,
  },

  // ==================== REFERRAL (7 Templates) ====================
  {
    title: 'Referral — Email 1',
    category: 'Referral',
    subject: 'Referral Inquiry for {{role}} at {{company}}',
    body: 'Hi {{name}},\n\nI am preparing to apply for the {{role}} opening at {{company}}. Given your background, I wanted to reach out and see if you\'d be open to providing a referral.\n\nBest,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Referral — Email 2',
    category: 'Referral',
    subject: 'Employee Referral Request — {{role}} Position',
    body: 'Hello {{name}},\n\nI saw the {{role}} opening at {{company}} and believe my technical background is a great fit. Would you be willing to refer me?\n\nThanks,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Referral — Email 3',
    category: 'Referral',
    subject: 'Mutual Interest in {{company}} — {{role}} Referral',
    body: 'Hi {{name}},\n\nI admire {{company}}\'s work. If you are open to referring a qualified {{role}} candidate, I would love to share my resume.\n\nBest regards,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Referral — Email 4',
    category: 'Referral',
    subject: 'Quick Question About Referral at {{company}}',
    body: 'Hi {{name}},\n\nHope you\'re doing well! Would you be comfortable submitting an internal referral for the {{role}} role at {{company}}?\n\nRegards,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Referral — Email 5',
    category: 'Referral',
    subject: 'Seeking Referral for {{role}} at {{company}}',
    body: 'Hello {{name}},\n\nI am applying for {{role}} at {{company}} and would be super grateful for a referral if you have a moment.\n\nThanks,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Referral — Email 6',
    category: 'Referral',
    subject: '{{company}} Connection — {{role}} Application',
    body: 'Hi {{name}},\n\nReaching out to see if you\'d be open to referring me for the {{role}} position at {{company}}.\n\nBest,\nVivek Rai',
    isSystem: true,
  },
  {
    title: 'Referral — Email 7',
    category: 'Referral',
    subject: 'Intro Request: {{role}} Role at {{company}}',
    body: 'Hi {{name}},\n\nI am very excited about {{company}}\'s engineering team and applied for {{role}}. Appreciate any referral support!\n\nThanks,\nVivek Rai',
    isSystem: true,
  },
];

/**
 * Seed system templates cleanly (removes deprecated categories and seeds 7 templates each for Internship, Job Application, and Referral)
 */
export async function seedSystemTemplates() {
  try {
    // Delete existing system templates to re-seed streamlined list
    await Template.deleteMany({ isSystem: true });
    console.log('[Template Seed] Seeding 21 streamlined system email templates across Internship, Job Application, and Referral...');
    await Template.insertMany(SYSTEM_TEMPLATES);
    console.log('✓ Successfully seeded 21 system templates (7 Internship, 7 Job Application, 7 Referral)!');
  } catch (error) {
    console.error('[Template Seed Error]:', error.message);
  }
}
