const { app } = require('@azure/functions');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { employees, progress, certificates } = require('../lib/db');
const { sign, authenticate, json, unauthorized } = require('../lib/auth');
const { MODULES, QUIZ } = require('../lib/catalog');

const getProgress = async empId => {
  const { resource } = await progress.item(empId, empId).read();
  return resource || { id: empId, started: {}, completed: {} };
};
const statusOf = (p, id) => (p.completed[id] ? 'completed' : p.started[id] ? 'in-progress' : 'not-started');

/* POST /api/login  { employeeId, password } */
app.http('login', {
  methods: ['POST'], authLevel: 'anonymous', route: 'login',
  handler: async request => {
    const { employeeId, password } = await request.json().catch(() => ({}));
    if (!employeeId || !password) return json(400, { error: 'Enter your employee ID and password.' });
    const id = String(employeeId).trim().toUpperCase();
    const { resource: emp } = await employees.item(id, id).read();
    // same message for unknown user and wrong password (no account enumeration)
    if (!emp || !(await bcrypt.compare(password, emp.passwordHash))) return json(401, { error: 'Employee ID or password is incorrect.' });
    return json(200, { token: sign(emp), user: { id: emp.id, name: emp.name, email: emp.email, department: emp.department, role: emp.role || 'employee' } });
  }
});

/* GET /api/me  -> profile, modules with status, notifications */
app.http('me', {
  methods: ['GET'], authLevel: 'anonymous', route: 'me',
  handler: async request => {
    const user = authenticate(request); if (!user) return unauthorized();
    const { resource: emp } = await employees.item(user.sub, user.sub).read();
    const p = await getProgress(user.sub);
    const day = 864e5;
    const modules = MODULES.map(m => ({
      ...m, status: statusOf(p, m.id),
      dueDate: m.dueInDays ? new Date(Date.now() + m.dueInDays * day).toISOString() : null
    }));
    const notifications = modules.filter(m => m.dueDate && m.status !== 'completed').map((m, i) => ({ id: i, text: `${m.title} is due soon.` }));
    return json(200, { user: { id: emp.id, name: emp.name, email: emp.email, department: emp.department, role: emp.role || 'employee' }, modules, notifications });
  }
});

/* POST /api/modules/{id}/start */
app.http('startModule', {
  methods: ['POST'], authLevel: 'anonymous', route: 'modules/{id}/start',
  handler: async request => {
    const user = authenticate(request); if (!user) return unauthorized();
    const id = request.params.id;
    if (!MODULES.some(m => m.id === id)) return json(404, { error: 'Module not found.' });
    const p = await getProgress(user.sub);
    if (!p.started[id]) { p.started[id] = new Date().toISOString(); await progress.items.upsert(p); }
    return json(200, { ok: true });
  }
});

/* GET /api/quiz/{moduleId}  (answers are never sent)
   POST /api/quiz/{moduleId} { answers: { q1: 1, ... } } */
app.http('quiz', {
  methods: ['GET', 'POST'], authLevel: 'anonymous', route: 'quiz/{moduleId}',
  handler: async request => {
    const user = authenticate(request); if (!user) return unauthorized();
    const moduleId = request.params.moduleId;
    const mod = MODULES.find(m => m.id === moduleId);
    if (!mod) return json(404, { error: 'Module not found.' });

    if (request.method === 'GET') {
      return json(200, {
        moduleId, passingScore: QUIZ.passingScore,
        questions: QUIZ.questions.map(({ answer, ...q }) => q)
      });
    }

    const { answers } = await request.json().catch(() => ({}));
    if (!answers || QUIZ.questions.some(q => !Number.isInteger(answers[q.id]))) return json(400, { error: 'Answer all questions before submitting.' });
    const correct = QUIZ.questions.filter(q => answers[q.id] === q.answer).length;
    const total = QUIZ.questions.length;
    const score = Math.round((correct / total) * 100);
    const passed = score >= QUIZ.passingScore;
    let certificate = null;

    if (passed) {
      const p = await getProgress(user.sub);
      p.completed[moduleId] = { score, date: new Date().toISOString() };
      await progress.items.upsert(p);

      const certId = `${user.sub}_${moduleId}`;
      const { resource: existing } = await certificates.item(certId, user.sub).read();
      certificate = existing || {
        id: certId, employeeId: user.sub, employeeName: user.name, moduleId, moduleTitle: mod.title, score,
        completedOn: new Date().toISOString(),
        certificateId: `CCTP-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`
      };
      certificate.score = Math.max(certificate.score, score);
      await certificates.items.upsert(certificate);
    }
    return json(200, { score, passed, correct, total, certificate });
  }
});

/* GET /api/certificate/{moduleId} */
app.http('certificate', {
  methods: ['GET'], authLevel: 'anonymous', route: 'certificate/{moduleId}',
  handler: async request => {
    const user = authenticate(request); if (!user) return unauthorized();
    const { resource } = await certificates.item(`${user.sub}_${request.params.moduleId}`, user.sub).read();
    return resource ? json(200, resource) : json(404, { error: 'No certificate for this module yet.' });
  }
});

/* GET /api/admin/summary  (admin role only) */
app.http('adminSummary', {
  methods: ['GET'], authLevel: 'anonymous', route: 'admin/summary',
  handler: async request => {
    const user = authenticate(request); if (!user) return unauthorized();
    if (user.role !== 'admin') return json(403, { error: 'Admins only.' });
    const { resources: emps } = await employees.items.query('SELECT c.id, c.name, c.department FROM c').fetchAll();
    const { resources: progs } = await progress.items.query('SELECT c.id, c.completed FROM c').fetchAll();
    const byId = Object.fromEntries(progs.map(p => [p.id, Object.keys(p.completed || {}).length]));
    return json(200, { totalModules: MODULES.length, rows: emps.map(e => ({ ...e, completed: byId[e.id] || 0 })) });
  }
});
