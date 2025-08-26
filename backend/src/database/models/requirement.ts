/// File is generated from https://studio.fabbuilder.com - requirement

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('requirement');
  } catch (error) {
    // continue, because model doesnt exist
  }

  const RequirementSchema = new Schema(
    {
      title: {
        type: String,
      },

      background: {
        type: String,
      },

      acceptanceCriteria: {
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

  RequirementSchema.index(
    { importHash: 1, tenant: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  RequirementSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  RequirementSchema.set('toJSON', {
    getters: true,
  });

  RequirementSchema.set('toObject', {
    getters: true,
  });

  return database.model('requirement', RequirementSchema);
};
/// File is generated from https://studio.fabbuilder.com - requirement
