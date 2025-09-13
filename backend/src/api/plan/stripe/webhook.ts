import { getConfig } from '../../../config';
import TenantService from '../../../services/tenantService';
import Plans from '../../../security/plans';
import ApiResponseHandler from '../../apiResponseHandler';
import lodash from 'lodash';
import Stripe from 'stripe';

export default async (req, res) => {
  try {
    const stripeClient = new Stripe(
      getConfig().PLAN_STRIPE_SECRET_KEY,
    );

    const event = stripeClient.webhooks.constructEvent(
      req.rawBody,
      req.headers['stripe-signature'],
      getConfig().PLAN_STRIPE_WEBHOOK_SIGNING_SECRET,
    );

    if (event.type === 'checkout.session.completed') {
      let data = event.data.object;
      data = await stripeClient.checkout.sessions.retrieve(
        data.id,
        { expand: ['line_items'] },
      );

      const stripePriceId = lodash.get(
        data,
        'line_items.data[0].price.id',
      );

      if (!stripePriceId) {
        throw new Error(
          'line_items.data[0].price.id NULL!',
        );
      }

      const plan =
        Plans.selectPlanByStripePriceId(stripePriceId);
      const planStripeCustomerId = data.customer;

      await new TenantService(req).updatePlanStatus(
        planStripeCustomerId,
        plan,
        'active',
      );
    }

    if (event.type === 'customer.subscription.updated') {
      const data = event.data.object;

      const stripePriceId = lodash.get(
        data,
        'items.data[0].price.id',
      );
      const plan =
        Plans.selectPlanByStripePriceId(stripePriceId);
      const planStripeCustomerId = data.customer;

      if (Plans.selectPlanStatus(data) === 'canceled') {
        await new TenantService(req).updatePlanToFree(
          planStripeCustomerId,
        );
      } else {
        await new TenantService(req).updatePlanStatus(
          planStripeCustomerId,
          plan,
          Plans.selectPlanStatus(data),
        );
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const data = event.data.object;

      const planStripeCustomerId = data.customer;

      await new TenantService(req).updatePlanToFree(
        planStripeCustomerId,
      );
    }

    return ApiResponseHandler.success(req, res, {
      received: true,
    });
  } catch (error) {
    return ApiResponseHandler.error(req, res, error);
  }
};
