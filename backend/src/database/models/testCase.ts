/// File is generated from https://studio.fabbuilder.com - testCase

import mongoose from 'mongoose';

import FileSchema from './schemas/fileSchema';
const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('testCase');
  } catch (error) {
    // continue, because model doesnt exist
  }

  const TestCaseSchema = new Schema(
    {
      title: {
        type: String,
      },

      description: {
        type: String,
      },

      steps: {
        type: Schema.Types.Mixed,
      },

      attachment: [FileSchema],

      leadBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },

      reviewedBy: {
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

  TestCaseSchema.index(
    { importHash: 1, tenant: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  TestCaseSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  TestCaseSchema.set('toJSON', {
    getters: true,
  });

  TestCaseSchema.set('toObject', {
    getters: true,
  });

  return database.model('testCase', TestCaseSchema);
};
/// File is generated from https://studio.fabbuilder.com - testCase
