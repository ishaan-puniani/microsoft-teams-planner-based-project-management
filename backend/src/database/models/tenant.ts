/// File is generated from https://studio.fabbuilder.com - tenant

import mongoose from 'mongoose';
import Plans from '../../security/plans';

const plans = Plans.values;
const Schema = mongoose.Schema;

export default (database) => {
  try {
    return database.model('tenant');
  } catch (error) {
    // continue, because model doesnt exist
  }

  const TenantSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
        maxlength: 255,
      },
      url: { type: String, maxlength: 1024 },
      // msPlanner: {
      //   MS_TENANT_ID: {
      //     type: String
      //   },
      //   MS_CLIENT_ID: {
      //     type: String
      //   },
      //   MS_CLIENT_SECRET: {
      //     type: String
      //   },
      //   MS_SCOPE: {
      //     type: String
      //   },
      // },
      /** Encrypted msPlanner config; decrypted when loading tenant. */
      msPlannerEncrypted: { type: String },
      plan: {
        type: String,
        required: true,
        enum: [plans.free, plans.growth, plans.enterprise],
        default: plans.free,
      },
      planStatus: {
        type: String,
        required: true,
        enum: ['active', 'cancel_at_period_end', 'error'],
        default: 'active',
      },
      planStripeCustomerId: {
        type: String,
      },
      planUserId: {
        type: String,
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      importHash: { type: String, maxlength: 255 },
    },
    { timestamps: true },
  );

  TenantSchema.index(
    { importHash: 1 },
    {
      unique: true,
      partialFilterExpression: {
        importHash: { $type: 'string' },
      },
    },
  );

  // Global schema validations
  validate: [
    {
      validator: function () {
        // Global document validation logic
        return true;
      },
      message: 'Document validation failed',
    },
  ];
  TenantSchema.virtual('id').get(function () {
    // @ts-ignore
    return this._id.toHexString();
  });

  TenantSchema.set('toJSON', {
    getters: true,
  });

  TenantSchema.set('toObject', {
    getters: true,
  });

  return database.model('tenant', TenantSchema);
};
/// File is generated from https://studio.fabbuilder.com - tenant
