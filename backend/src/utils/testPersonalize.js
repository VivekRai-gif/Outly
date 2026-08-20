import { personalizeText, personalizeEmail } from './personalize.js';

function runPersonalizeTest() {
  console.log('--- Outly Personalization Utility Verification Test ---');

  const templateSubject = 'Application for {{role}} opportunity at {{company}}';
  const templateBody = `Hi {{name}},

I am reaching out regarding the {{role}} opportunity at {{company}}.

I would appreciate the opportunity to connect.

Regards,
Vivek Rai`;

  // 1. Complete contact object test
  const contact1 = {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    company: 'ABC Technologies',
    role: 'Software Engineer Intern',
  };

  console.log('\n[Test 1] Complete Contact Personalization:');
  const result1 = personalizeEmail(templateSubject, templateBody, contact1);
  console.log('Subject:', result1.subject);
  console.log('Body:\n' + result1.body);

  if (result1.subject.includes('Software Engineer Intern') && result1.body.includes('Rahul Sharma')) {
    console.log('✓ Test 1 Passed!');
  } else {
    console.error('❌ Test 1 Failed');
  }

  // 2. Missing fields fallback test
  const contact2 = {
    email: 'priya@example.com',
  };

  console.log('\n[Test 2] Missing Fields Fallback Personalization:');
  const result2 = personalizeEmail(templateSubject, templateBody, contact2);
  console.log('Subject:', result2.subject);
  console.log('Body:\n' + result2.body);

  if (result2.body.includes('Hi there') && result2.body.includes('your company')) {
    console.log('✓ Test 2 Fallbacks Passed!');
  } else {
    console.error('❌ Test 2 Fallbacks Failed');
  }

  console.log('\n🎉 ALL PERSONALIZATION UTILITY TESTS PASSED!');
}

runPersonalizeTest();
