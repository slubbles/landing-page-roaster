import { Webhooks } from "@polar-sh/nextjs";
import { loadRoast, saveRoast } from '../../../../lib/storage.js';
import { generateProAnalysis } from '../../../../lib/roast-engine.js';
import { updateSubscription, getOrCreateUser } from '../../../../lib/user-storage.js';

export const maxDuration = 60;

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,

  // ── One-time purchase (legacy $29) ──────────────
  onOrderPaid: async (payload) => {
    const order = payload.data;
    const metadata = order.metadata || {};
    const roastId = metadata.roastId;
    
    console.log(`[Polar] Order paid: ${order.id}, roastId: ${roastId}, amount: ${order.total_amount / 100}`);

    if (!roastId) {
      console.error('[Polar] No roastId in order metadata — cannot generate PRO analysis');
      return;
    }

    const result = await loadRoast(roastId);
    if (!result) {
      console.error(`[Polar] Roast ${roastId} not found in storage`);
      return;
    }

    if (result.proAnalysis) {
      console.log(`[Polar] Roast ${roastId} already has PRO analysis — skipping`);
      return;
    }

    const scrapedData = {
      pageData: result.pageData || {},
      mobileData: result.mobileData || {},
      performance: result.performance || {},
      diagnostics: result.diagnostics || {},
      screenshots: result.screenshots || {},
    };

    try {
      console.log(`[Polar] Generating PRO analysis for roast ${roastId}...`);
      const proAnalysis = await generateProAnalysis(scrapedData, result.roast);
      result.proAnalysis = proAnalysis;
      result.upgradedAt = new Date().toISOString();
      await saveRoast(roastId, result);
      console.log(`[Polar] PRO analysis saved for roast ${roastId}`);
    } catch (err) {
      console.error(`[Polar] Failed to generate PRO analysis for ${roastId}:`, err.message);
    }
  },

  // ── Subscription created ────────────────────────
  onSubscriptionCreated: async (payload) => {
    const sub = payload.data;
    const email = sub.metadata?.userEmail || sub.customer?.email;

    console.log(`[Polar] Subscription created: ${sub.id}, email: ${email}, status: ${sub.status}`);

    if (!email) {
      console.error('[Polar] No email found in subscription — cannot activate user');
      return;
    }

    try {
      await updateSubscription(email, {
        status: sub.status === 'active' ? 'active' : sub.status,
        subscriptionId: sub.id,
      });
      console.log(`[Polar] User ${email} subscription activated`);
    } catch (err) {
      console.error(`[Polar] Failed to activate subscription for ${email}:`, err.message);
    }
  },

  // ── Subscription updated (renewal, plan change) ─
  onSubscriptionUpdated: async (payload) => {
    const sub = payload.data;
    const email = sub.metadata?.userEmail || sub.customer?.email;

    console.log(`[Polar] Subscription updated: ${sub.id}, email: ${email}, status: ${sub.status}`);

    if (!email) return;

    try {
      await updateSubscription(email, {
        status: sub.status === 'active' ? 'active' : sub.status,
        subscriptionId: sub.id,
      });
      console.log(`[Polar] User ${email} subscription updated to ${sub.status}`);
    } catch (err) {
      console.error(`[Polar] Failed to update subscription for ${email}:`, err.message);
    }
  },

  // ── Subscription revoked (payment failed, canceled) ─
  onSubscriptionRevoked: async (payload) => {
    const sub = payload.data;
    const email = sub.metadata?.userEmail || sub.customer?.email;

    console.log(`[Polar] Subscription revoked: ${sub.id}, email: ${email}`);

    if (!email) return;

    try {
      await updateSubscription(email, {
        status: 'expired',
        subscriptionId: sub.id,
      });
      console.log(`[Polar] User ${email} subscription revoked`);
    } catch (err) {
      console.error(`[Polar] Failed to revoke subscription for ${email}:`, err.message);
    }
  },
});
