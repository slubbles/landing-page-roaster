/**
 * STORAGE ADAPTER
 * 
 * Uses Vercel Blob in production (if BLOB_READ_WRITE_TOKEN set),
 * in-memory Map as fallback on Vercel without blob token,
 * filesystem in local dev.
 */

const HAS_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
const IS_VERCEL = !!process.env.VERCEL;

// In-memory fallback for serverless (ephemeral but works for same-request flows)
const memoryStore = new Map();

/**
 * Save a roast result
 */
export async function saveRoast(id, data) {
  if (HAS_BLOB) {
    const { put } = await import('@vercel/blob');
    await put(`roasts/${id}.json`, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  } else if (IS_VERCEL) {
    // No blob token yet — use /tmp filesystem (persists within same lambda container)
    const { writeFile, mkdir } = await import('fs/promises');
    const path = await import('path');
    const dir = path.join('/tmp', 'roasts');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${id}.json`), JSON.stringify(data));
    console.warn(`[storage] No BLOB_READ_WRITE_TOKEN — saved roast ${id} to /tmp (ephemeral)`);
  } else {
    // Local filesystem fallback
    const { writeFile, mkdir } = await import('fs/promises');
    const path = await import('path');
    const dir = path.join(process.cwd(), 'data', 'roasts');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${id}.json`), JSON.stringify(data, null, 2));
  }
}

/**
 * Load a roast result by ID
 */
export async function loadRoast(id) {
  // Sanitize ID — only alphanumeric
  if (!/^[a-f0-9]+$/.test(id)) return null;

  if (HAS_BLOB) {
    const { list } = await import('@vercel/blob');
    try {
      const { blobs } = await list({ prefix: `roasts/${id}.json` });
      if (!blobs.length) return null;
      const res = await fetch(blobs[0].url);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  } else if (IS_VERCEL) {
    // /tmp filesystem fallback
    try {
      const { readFile } = await import('fs/promises');
      const path = await import('path');
      const raw = await readFile(path.join('/tmp', 'roasts', `${id}.json`), 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  } else {
    // Local filesystem
    try {
      const { readFile } = await import('fs/promises');
      const path = await import('path');
      const raw = await readFile(path.join(process.cwd(), 'data', 'roasts', `${id}.json`), 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
