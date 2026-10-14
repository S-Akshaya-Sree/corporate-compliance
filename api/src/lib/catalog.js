// Training catalog + quiz answer keys. Answer keys stay on the server.
const MODULES = [
  { id: 'workplace-safety', title: 'Workplace Safety', icon: '🦺', desc: 'OSHA-aligned safety fundamentals for daily operations.', minutes: 25 },
  { id: 'data-privacy', title: 'Data Privacy', icon: '🔒', desc: 'Handling personal and customer data responsibly.', minutes: 30 },
  { id: 'cybersecurity', title: 'Cybersecurity Basics', icon: '🛡️', desc: 'Passwords, phishing and safe use of company devices.', minutes: 20 },
  { id: 'code-of-conduct', title: 'Code of Conduct', icon: '⚖️', desc: 'Ethics, integrity and professional standards.', minutes: 20, dueInDays: 3 },
  { id: 'anti-harassment', title: 'Anti-Harassment', icon: '🤝', desc: 'Recognising and reporting workplace harassment.', minutes: 35, dueInDays: 9 }
];

const QUIZ = {
  passingScore: 60,
  questions: [
    { id: 'q1', category: 'Workplace Safety', text: 'What is the first step you should take when you notice a workplace safety hazard?', options: ['Ignore it if it does not affect you directly', 'Report it immediately to your supervisor or safety officer', 'Wait for someone else to report it', 'Fix it yourself without training'], answer: 1 },
    { id: 'q2', category: 'Data Privacy', text: 'Under standard corporate data privacy policy, employee and customer personal data should be:', options: ['Shared freely between departments for convenience', 'Stored on personal devices for easy access', 'Collected, used, and stored only as necessary and protected accordingly', 'Kept indefinitely with no review'], answer: 2 },
    { id: 'q3', category: 'Cybersecurity', text: 'Which of the following is the safest practice for handling work account passwords?', options: ['Reuse the same password across all personal and work accounts', 'Use a unique, strong password and enable multi-factor authentication', 'Write the password on a sticky note on your monitor', 'Share it with a trusted colleague in case you forget it'], answer: 1 },
    { id: 'q4', category: 'Code of Conduct', text: 'If you become aware of a conflict of interest involving a business decision you are part of, you should:', options: ['Say nothing and proceed as usual', 'Disclose it promptly according to company policy', 'Only mention it if someone asks directly', 'Resolve it privately without informing anyone'], answer: 1 },
    { id: 'q5', category: 'Anti-Harassment', text: 'What is the appropriate action if you witness workplace harassment?', options: ['Assume it is not your concern and stay silent', 'Confront the person aggressively yourself', 'Report the incident through the designated HR or compliance channel', 'Discuss it only with friends outside the company'], answer: 2 }
  ]
};

module.exports = { MODULES, QUIZ };
