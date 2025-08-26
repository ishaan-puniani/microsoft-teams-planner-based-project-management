/// File is generated from https://studio.fabbuilder.com - testPlan

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('testPlan');
  } catch (error) {
    // continue, because model doesnt exist
  }

  const TestPlanSchema = new Schema(
    {
      title: {
        type: String,
      },

      scope: {
        type: String,
      },

      objective: {
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

  TestPlanSchema.index(
    { importHash: 1, tenant: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  TestPlanSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  TestPlanSchema.set('toJSON', {
    getters: true,
  });

  TestPlanSchema.set('toObject', {
    getters: true,
  });

  return database.model('testPlan', TestPlanSchema);
};
/// File is generated from https://studio.fabbuilder.com - testPlan
