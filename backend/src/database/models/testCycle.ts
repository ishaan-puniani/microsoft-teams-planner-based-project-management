/// File is generated from https://studio.fabbuilder.com - testCase

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('testCycle');
  } catch (error) {
    // continue, because model doesnt exist
  }

  const TestCycleSchema = new Schema(
    {
      title: {
        type: String,
      },
      testResults:[
        {
          testCase:  {
            type: Schema.Types.ObjectId,
            ref: 'testCase',
          },
          result:{
            type: String,// PASS | FAIL 
          },
          outcome:{
            type: String
          },
          testedBy: {
            type: Schema.Types.ObjectId,
            ref: 'user',
          },
        }
      ],
      leadBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
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

  TestCycleSchema.index(
    { importHash: 1, tenant: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  TestCycleSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  TestCycleSchema.set('toJSON', {
    getters: true,
  });

  TestCycleSchema.set('toObject', {
    getters: true,
  });

  return database.model('testCycle', TestCycleSchema);
};
/// File is generated from https://studio.fabbuilder.com - testCycle
