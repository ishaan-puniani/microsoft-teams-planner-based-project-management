/// File is generated from https://studio.fabbuilder.com - taskTemplate

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('taskTemplate');
  } catch (error) {
    // continue, because model doesnt exist
  }

  const TaskTemplateSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },

      description: {
        type: String,
      },

      type: {
        type: String,
        required: true,
        enum: ['EPIC', 'USER_STORY', 'TASK', 'BUG', 'SUBTASK'],
      },

      fields: [{
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: ['TEXT', 'NUMBER', 'DATE', 'SELECT', 'TEXTAREA', 'BOOLEAN'],
        },
        required: {
          type: Boolean,
          default: false,
        },
        options: [String], // For SELECT type
        defaultValue: Schema.Types.Mixed,
      }],

      workflow: {
        states: [{
          name: {
            type: String,
            required: true,
          },
          color: {
            type: String,
            default: '#007bff',
          },
          isInitial: {
            type: Boolean,
            default: false,
          },
          isFinal: {
            type: Boolean,
            default: false,
          },
        }],
        transitions: [{
          from: {
            type: String,
            required: true,
          },
          to: {
            type: String,
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
        }],
      },

      isActive: {
        type: Boolean,
        default: true,
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

  TaskTemplateSchema.index(
    { importHash: 1, tenant: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  TaskTemplateSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  TaskTemplateSchema.set('toJSON', {
    getters: true,
  });

  TaskTemplateSchema.set('toObject', {
    getters: true,
  });

  return database.model('taskTemplate', TaskTemplateSchema);
};
/// File is generated from https://studio.fabbuilder.com - taskTemplate
