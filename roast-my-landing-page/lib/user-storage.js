/**
 * USER STORAGE
 *
 * Stores user profiles (subscription status, roast history) in Vercel Blob.
 * Keyed by SHA-256 hash of email for safe filenames.
 */

import crypto from 'crypto';

const HAS_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

function emailHash(email) {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

/**
 * Load user profile by email
 */
export async function getUser(email) {
  if (!email) return null;
  const key = emailHash(email);

  if (HAS_BLOB) {
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: `users/${key}.json` });
      if (!blobs.length) return null;
      const res = await fetch(blobs[0].url);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  // Local filesystem fallback
  try {
    const { readFile } = await import('fs/promises');
    const path = await import('path');
    const raw = await readFile(path.join(process.cwd(), 'data', 'users', `${key}.json`), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save (upsert) user profile
 */
export async function saveUser(email, data) {
  if (!email) return;
  const key = emailHash(email);

  const payload = { ...data, email: email.toLowerCase().trim(), updatedAt: new Date().toISOString() };

  if (HAS_BLOB) {
    const { put } = await import('@vercel/blob');
    await put(`users/${key}.json`, JSON.stringify(payload), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
    return;
  }

  // Local filesystem fallback
  const { writeFile, mkdir } = await import('fs/promises');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'data', 'users');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${key}.json`), JSON.stringify(payload, null, 2));
}

/**
 * Get or create a user profile
 */
export async function getOrCreateUser(email, defaults = {}) {
  let user = await getUser(email);
  if (!user) {
    user = {
      email: email.toLowerCase().trim(),
      name: defaults.name || null,
      image: defaults.image || null,
      subscriptionStatus: null,
      subscriptionId: null,
      subscribedAt: null,
      roastIds: [],
      createdAt: new Date().toISOString(),
    };
    await saveUser(email, user);
  }
  return user;
}

/**
 * Add a roast ID to a user's history
 */
export async function addRoastToUser(email, roastId) {
  const user = await getOrCreateUser(email);
  if (!user.roastIds.includes(roastId)) {
    user.roastIds.push(roastId);
    await saveUser(email, user);
  }
  return user;
}

/**
 * Check if user has an active subscription
 */
export async function isSubscribed(email) {
  const user = await getUser(email);
  return user?.subscriptionStatus === 'active';
}

/**
 * Update subscription status
 */
export async function updateSubscription(email, { status, subscriptionId }) {
  const user = await getOrCreateUser(email);
  user.subscriptionStatus = status;
  user.subscriptionId = subscriptionId || user.subscriptionId;
  if (status === 'active' && !user.subscribedAt) {
    user.subscribedAt = new Date().toISOString();
  }
  await saveUser(email, user);
  return user;
}
