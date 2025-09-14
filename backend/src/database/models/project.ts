/// File is generated from https://studio.fabbuilder.com - project

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('project');
  } catch (error) {
    // continue, because model doesnt exist
  }

  const ProjectSchema = new Schema(
    {
      name: {
        type: String,
      },

      description: {
        type: String,
      },

      code: {
        type: String,
        required: true,
        length: 4,
      },

      counter: {
        type: Number,
        default: 0,
      },

      startDate: {
        type: Date,
      },

      endDate: {
        type: Date,
      },

      status: {
        type: String,
      },

      priority: {
        type: String,
      },

      epicTemplate: {
        type: Schema.Types.ObjectId,
        ref: 'taskTemplate',
      },

      userStoryTemplate: {
        type: Schema.Types.ObjectId,
        ref: 'taskTemplate',
      },

      taskTemplate: {
        type: Schema.Types.ObjectId,
        ref: 'taskTemplate',
      },

      bugTemplate: {
        type: Schema.Types.ObjectId,
        ref: 'taskTemplate',
      },

      subtaskTemplate: {
        type: Schema.Types.ObjectId,
        ref: 'taskTemplate',
      },

      testPlanTemplate: {
        type: Schema.Types.ObjectId,
        ref: 'taskTemplate',
      },

      testCaseTemplate: {
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
    { timestamps: true },
  );

  ProjectSchema.index(
    { importHash: 1, tenant: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  ProjectSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  ProjectSchema.set('toJSON', {
    getters: true,
  });

  ProjectSchema.set('toObject', {
    getters: true,
  });

  return database.model('project', ProjectSchema);
};
/// File is generated from https://studio.fabbuilder.com - project
