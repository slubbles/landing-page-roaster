import { Webhooks } from "@polar-sh/nextjs";
import { loadRoast, saveRoast } from '../../../../lib/storage.js';
import { generateProAnalysis } from '../../../../lib/roast-engine.js';

export const maxDuration = 60;

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  onOrderPaid: async (payload) => {
    const order = payload.data;
    const metadata = order.metadata || {};
    const roastId = metadata.roastId;
    
    console.log(`[Polar] Order paid: ${order.id}, roastId: ${roastId}, amount: ${order.total_amount / 100}`);

    if (!roastId) {
      console.error('[Polar] No roastId in order metadata — cannot generate PRO analysis');
      return;
    }

    // Load the existing roast
    const result = await loadRoast(roastId);
    if (!result) {
      console.error(`[Polar] Roast ${roastId} not found in storage`);
      return;
    }

    // Already has PRO analysis? Skip.
    if (result.proAnalysis) {
      console.log(`[Polar] Roast ${roastId} already has PRO analysis — skipping`);
      return;
    }

    // Build scrapedData from the stored result (enough for the PRO prompt)
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
      
      // Save updated result with PRO analysis
      result.proAnalysis = proAnalysis;
      result.upgradedAt = new Date().toISOString();
      await saveRoast(roastId, result);
      
      console.log(`[Polar] PRO analysis saved for roast ${roastId}`);
    } catch (err) {
      console.error(`[Polar] Failed to generate PRO analysis for ${roastId}:`, err.message);
    }
  },
});
