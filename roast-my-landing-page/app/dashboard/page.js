import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import { getOrCreateUser } from '../../lib/user-storage';
import { loadRoast } from '../../lib/storage';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Dashboard — PageRoast',
  description: 'Your roast history and subscription status.',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  // Load user profile
  const user = await getOrCreateUser(session.user.email, {
    name: session.user.name,
    image: session.user.image,
  });

  // Load summaries of roasts (just scores and URLs — not full data)
  const roastSummaries = [];
  for (const roastId of (user.roastIds || []).slice(-50).reverse()) {
    try {
      const roast = await loadRoast(roastId);
      if (roast) {
        roastSummaries.push({
          id: roast.id,
          url: roast.url,
          score: roast.roast?.overallScore,
          verdict: roast.roast?.verdict,
          isPro: !!roast.proAnalysis,
          createdAt: roast.createdAt,
        });
      }
    } catch {
      // Skip broken roasts
    }
  }

  return (
    <DashboardClient
      user={user}
      session={session}
      roasts={roastSummaries}
    />
  );
}
