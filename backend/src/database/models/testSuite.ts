/// File is generated from https://studio.fabbuilder.com - testSuite

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('testSuite');
  } catch (error) {
    // continue, because model doesnt exist
  }

  const TestSuiteSchema = new Schema(
    {
      name: {
        type: String,
      },

      tenant: {
        type: Schema.Types.ObjectId,
        ref: 'tenant',
        required: true,
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      importHash: { type: String },
    },
    { timestamps: true },
  );

  TestSuiteSchema.index(
    { importHash: 1, tenant: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  TestSuiteSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  TestSuiteSchema.set('toJSON', {
    getters: true,
  });

  TestSuiteSchema.set('toObject', {
    getters: true,
  });

  return database.model('testSuite', TestSuiteSchema);
};
/// File is generated from https://studio.fabbuilder.com - testSuite
