// Creates the Cosmos DB database, containers and demo employees.
// Run from /api:  COSMOS_CONNECTION_STRING="..." npm run seed
const { CosmosClient } = require('../api/node_modules/@azure/cosmos');
const bcrypt = require('../api/node_modules/bcryptjs');

(async () => {
  const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
  const { database } = await client.databases.createIfNotExists({ id: process.env.COSMOS_DB || 'compliance' });
  await database.containers.createIfNotExists({ id: 'employees', partitionKey: '/id' });
  await database.containers.createIfNotExists({ id: 'progress', partitionKey: '/id' });
  await database.containers.createIfNotExists({ id: 'certificates', partitionKey: '/employeeId' });

  const hash = await bcrypt.hash('ChangeMe!2026', 10);
  const people = [
    { id: 'EMP-45102', name: 'Jordan Sinclair', email: 'jordan.sinclair@company.com', department: 'Finance & Operations', role: 'admin' },
    { id: 'EMP-38811', name: 'Priya Raman', email: 'priya.raman@company.com', department: 'Engineering' },
    { id: 'EMP-40276', name: 'Marcus Webb', email: 'marcus.webb@company.com', department: 'Sales' }
  ];
  for (const p of people) await database.container('employees').items.upsert({ ...p, passwordHash: hash });

  // Jordan has already finished 3 modules (matches the demo)
  const now = new Date().toISOString();
  await database.container('progress').items.upsert({
    id: 'EMP-45102',
    started: { 'code-of-conduct': now },
    completed: {
      'workplace-safety': { score: 100, date: now },
      'data-privacy': { score: 100, date: now },
      'cybersecurity': { score: 100, date: now }
    }
  });
  console.log('Seeded. Demo login: EMP-45102 / ChangeMe!2026  (change this password!)');
})();
