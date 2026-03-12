/// File is generated from https://studio.fabbuilder.com -

const models = [
  require('./tenant').default,
  require('./auditLog').default,
  require('./settings').default,
  require('./user').default,
  require('./module').default,
  require('./project').default,
  require('./requirement').default,
  require('./testPlan').default,
  require('./testCycle').default,
  require('./testSuite').default,
  require('./task').default,
  require('./taskTemplate').default,
  require('./status').default,
  require('./tag').default,
  require('./scheduledEvent').default,
];

export default function init(database) {
  for (let model of models) {
    model(database);
  }

  return database;
}

export async function createCollections(database) {
  for (let model of models) {
    await model(database).createCollection();
  }

  return database;
}
/// File is generated from https://studio.fabbuilder.com -
