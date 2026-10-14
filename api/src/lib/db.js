const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database(process.env.COSMOS_DB || 'compliance');

module.exports = {
  employees: database.container('employees'),       // pk: /id
  progress: database.container('progress'),         // pk: /id  (id = employeeId)
  certificates: database.container('certificates')  // pk: /employeeId
};
