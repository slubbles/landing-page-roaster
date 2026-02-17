export { auth as middleware } from './auth';

export const config = {
  // Only protect the dashboard — everything else is public
  matcher: ['/dashboard/:path*'],
};
