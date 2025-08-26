/// File is generated from https://studio.fabbuilder.com - module

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('module');
  } catch (error) {
    // continue, because model doesnt exist
  }

  const ModuleSchema = new Schema(
    {
      title: {
        type: String,
      },

      details: {
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

  ModuleSchema.index(
    { importHash: 1, tenant: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  ModuleSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  ModuleSchema.set('toJSON', {
    getters: true,
  });

  ModuleSchema.set('toObject', {
    getters: true,
  });

  return database.model('module', ModuleSchema);
};
/// File is generated from https://studio.fabbuilder.com - module
