/// File is generated from https://studio.fabbuilder.com - task

import mongoose from 'mongoose';

import FileSchema from './schemas/fileSchema';
const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('task');
  } catch (error) {
    // continue, because model doesnt exist
  }

  const TaskSchema = new Schema(
    {
      title: {
        type: String,
      },

      description: {
        type: String,
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
      estimatedStart: {
        type: Date,
      },

      estimatedEnd: {
        type: Date,
      },

      workStart: {
        type: Date,
      },

      workEnd: {
        type: Date,
      },

      template: {
        type: Schema.Types.ObjectId,
        ref: 'taskTemplate',
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
    { timestamps: true, strictPopulate: false },
  );

  TaskSchema.index(
    { importHash: 1, tenant: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  TaskSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  TaskSchema.set('toJSON', {
    getters: true,
  });

  TaskSchema.set('toObject', {
    getters: true,
  });

  return database.model('task', TaskSchema);
};
/// File is generated from https://studio.fabbuilder.com - task
