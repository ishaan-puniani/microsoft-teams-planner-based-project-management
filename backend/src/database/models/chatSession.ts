import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('chatSession');
  } catch (error) {
    // continue, because model doesn't exist
  }

  const ChatSessionSchema = new Schema(
    {
      tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'tenant',
        required: true,
      },
      tenant: {
        type: Schema.Types.ObjectId,
        ref: 'tenant',
        required: true,
      },
      eventUri: {
        // projectId in this context
        type: Schema.Types.ObjectId,
        ref: 'project',
        required: true,
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      },
      data: {
        request: {
          userInput: String,
        },
        response: {
          success: Boolean,
          message: String,
          error: String,
          suggestedTasksType: String,
          suggestedTasks: Schema.Types.Mixed,
        },
        tokensUsed: {
          type: Number,
          default: 0,
        },
      },
      history: [
        {
          request: {
            userInput: String,
          },
          response: {
            success: Boolean,
            message: String,
            error: String,
            suggestedTasksType: String,
            suggestedTasks: Schema.Types.Mixed,
          },
          tokensUsed: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
    {
      timestamps: true,
      collection: 'ai_chat_history',
    },
  );

  return database.model('chatSession', ChatSessionSchema);
};
