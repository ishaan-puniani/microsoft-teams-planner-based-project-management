/// File is generated from https://studio.fabbuilder.com - tag

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('tag');
  } catch (error) {
    // continue, because model doesnt exist
  }

  const TagSchema = new Schema(
    {
      title: {
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

  TagSchema.index(
    { importHash: 1, tenant: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  TagSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  TagSchema.set('toJSON', {
    getters: true,
  });

  TagSchema.set('toObject', {
    getters: true,
  });

  return database.model('tag', TagSchema);
};
/// File is generated from https://studio.fabbuilder.com - tag
