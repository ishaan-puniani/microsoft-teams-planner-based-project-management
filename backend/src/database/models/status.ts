/// File is generated from https://studio.fabbuilder.com - status

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('status');
  } catch (error) {
    // continue, because model doesnt exist
  }

  const StatusSchema = new Schema(
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

  StatusSchema.index(
    { importHash: 1, tenant: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  StatusSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  StatusSchema.set('toJSON', {
    getters: true,
  });

  StatusSchema.set('toObject', {
    getters: true,
  });

  return database.model('status', StatusSchema);
};
/// File is generated from https://studio.fabbuilder.com - status
