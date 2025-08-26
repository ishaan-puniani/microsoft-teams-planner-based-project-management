/// File is generated from https://studio.fabbuilder.com -

const models = [
  require('./tenant').default,
  require('./auditLog').default,
  require('./settings').default,
  require('./user').default,
  require('./module').default,
  require('./requirement').default,
  require('./testPlan').default,
  require('./testSuite').default,
  require('./testCase').default,
  require('./task').default,
  require('./status').default,
  require('./tag').default,
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
