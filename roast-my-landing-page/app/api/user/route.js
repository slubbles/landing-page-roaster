import { auth } from '../../../auth';
import { getUser } from '../../../lib/user-storage';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ subscribed: false, user: null });
    }

    const user = await getUser(session.user.email);

    return Response.json({
      subscribed: user?.subscriptionStatus === 'active',
      user: user
        ? {
            email: user.email,
            name: user.name,
            subscriptionStatus: user.subscriptionStatus,
            roastCount: user.roastIds?.length || 0,
          }
        : null,
    });
  } catch (err) {
    console.error('[API/user] Error:', err.message);
    return Response.json({ subscribed: false, user: null }, { status: 500 });
  }
}
