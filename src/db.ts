/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Profile, AppSettings, PostDraft, DailyCount, HistoryItem, SavedTag } from './types';

const DB_NAME = 'XFreeDashboardDB';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Object stores
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('dailyCounts')) {
        db.createObjectStore('dailyCounts', { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('tags')) {
        db.createObjectStore('tags', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Settings and Profile Store Helpers
export async function getLocalStorageSettings(): Promise<AppSettings> {
  const db = await getDB();
  return new Promise((resolve) => {
    const transaction = db.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const req = store.get('app_settings');

    req.onsuccess = () => {
      if (req.result) {
        resolve(req.result.value);
      } else {
        // Defaults
        resolve({
          theme: 'dim',
          fontSize: 16,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          mobileNavStyle: 'drawer',
          dailyPostLimit: 50,
          dailyRepostLimit: 200,
          dailyReplyLimit: 500, // standard high limits
          dailyLikeLimit: 500,
          brandColor: '#1d9bf0',
          language: 'fr'
        });
      }
    };
    req.onerror = () => {
      resolve({
        theme: 'dim',
        fontSize: 16,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        mobileNavStyle: 'drawer',
        dailyPostLimit: 50,
        dailyRepostLimit: 200,
        dailyReplyLimit: 500,
        dailyLikeLimit: 500,
        brandColor: '#1d9bf0',
        language: 'fr'
      });
    };
  });
}

export async function saveLocalStorageSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');
    const req = store.put({ key: 'app_settings', value: settings });

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getLocalStorageProfile(): Promise<Profile> {
  const db = await getDB();
  return new Promise((resolve) => {
    const transaction = db.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const req = store.get('profile');

    req.onsuccess = () => {
      if (req.result) {
        resolve(req.result.value);
      } else {
        // Default professional placeholder avatar (SVG based)
        const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231DA1F2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;
        resolve({
          username: 'DemoUser',
          displayName: 'Dashboard Démo',
          avatar: defaultAvatar
        });
      }
    };
    req.onerror = () => {
      resolve({
        username: 'DemoUser',
        displayName: 'Dashboard Démo',
        avatar: ''
      });
    };
  });
}

export async function saveLocalStorageProfile(profile: Profile): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');
    const req = store.put({ key: 'profile', value: profile });

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Drafts Helpers
export async function getDrafts(): Promise<PostDraft[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('drafts', 'readonly');
    const store = transaction.objectStore('drafts');
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDraft(draft: PostDraft): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('drafts', 'readwrite');
    const store = transaction.objectStore('drafts');
    const req = store.put(draft);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('drafts', 'readwrite');
    const store = transaction.objectStore('drafts');
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Daily Limit Counters Helpers
export async function getDailyCounts(dateStr: string): Promise<DailyCount> {
  const db = await getDB();
  return new Promise((resolve) => {
    const transaction = db.transaction('dailyCounts', 'readonly');
    const store = transaction.objectStore('dailyCounts');
    const req = store.get(dateStr);

    req.onsuccess = () => {
      if (req.result) {
        resolve(req.result);
      } else {
        resolve({
          date: dateStr,
          posts: 0,
          reposts: 0,
          replies: 0,
          likes: 0
        });
      }
    };
    req.onerror = () => {
      resolve({
        date: dateStr,
        posts: 0,
        reposts: 0,
        replies: 0,
        likes: 0
      });
    };
  });
}

export async function saveDailyCount(count: DailyCount): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('dailyCounts', 'readwrite');
    const store = transaction.objectStore('dailyCounts');
    const req = store.put(count);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllDailyCounts(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('dailyCounts', 'readwrite');
    const store = transaction.objectStore('dailyCounts');
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// History Log Helpers
export async function getHistory(): Promise<HistoryItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('history', 'readonly');
    const store = transaction.objectStore('history');
    const req = store.getAll();

    req.onsuccess = () => {
      const result = req.result || [];
      // Sort in descending order
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(result);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function addHistoryItem(item: HistoryItem): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('history', 'readwrite');
    const store = transaction.objectStore('history');
    const req = store.put(item);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearHistory(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('history', 'readwrite');
    const store = transaction.objectStore('history');
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Saved Tags Store
export async function getSavedTags(): Promise<SavedTag[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tags', 'readonly');
    const store = transaction.objectStore('tags');
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveTag(savedTag: SavedTag): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tags', 'readwrite');
    const store = transaction.objectStore('tags');
    const req = store.put(savedTag);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tags', 'readwrite');
    const store = transaction.objectStore('tags');
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Export Database to JSON
export async function exportDbToJson(): Promise<string> {
  const settings = await getLocalStorageSettings();
  const profile = await getLocalStorageProfile();
  const drafts = await getDrafts();
  
  // Collect history
  const db = await getDB();
  const history: HistoryItem[] = await getHistory();
  const tags: SavedTag[] = await getSavedTags();
  
  // Collect last 14 days counts for daily tracking
  const dailyCounts: DailyCount[] = [];
  const countTransaction = db.transaction('dailyCounts', 'readonly');
  const countStore = countTransaction.objectStore('dailyCounts');
  await new Promise<void>((resolve) => {
    const countsReq = countStore.getAll();
    countsReq.onsuccess = () => {
      if (countsReq.result) {
        dailyCounts.push(...countsReq.result);
      }
      resolve();
    };
    countsReq.onerror = () => resolve();
  });

  const exportData = {
    version: DB_VERSION,
    timestamp: new Date().toISOString(),
    settings,
    profile,
    drafts,
    dailyCounts,
    history,
    tags
  };

  return JSON.stringify(exportData, null, 2);
}

// Import Database from JSON
export async function importDbFromJson(jsonStr: string): Promise<void> {
  const data = JSON.parse(jsonStr);
  if (!data || typeof data !== 'object') {
    throw new Error('Format JSON invalide');
  }

  const db = await getDB();

  // Load and apply settings & profile
  if (data.settings) {
    await saveLocalStorageSettings(data.settings);
  }
  if (data.profile) {
    await saveLocalStorageProfile(data.profile);
  }

  // Rewrite drafts
  if (Array.isArray(data.drafts)) {
    const tx = db.transaction('drafts', 'readwrite');
    const store = tx.objectStore('drafts');
    store.clear();
    for (const d of data.drafts) {
      store.put(d);
    }
  }

  // Rewrite dailyCounts
  if (Array.isArray(data.dailyCounts)) {
    const tx = db.transaction('dailyCounts', 'readwrite');
    const store = tx.objectStore('dailyCounts');
    store.clear();
    for (const c of data.dailyCounts) {
      store.put(c);
    }
  }

  // Rewrite history
  if (Array.isArray(data.history)) {
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    store.clear();
    for (const h of data.history) {
      store.put(h);
    }
  }

  // Rewrite tags
  if (Array.isArray(data.tags)) {
    const tx = db.transaction('tags', 'readwrite');
    const store = tx.objectStore('tags');
    store.clear();
    for (const t of data.tags) {
      store.put(t);
    }
  }
}

// -------------------------------------------------------------
// POST TEMPLATES HELPERS (LocalStorage based for zero-risk migration stability)
// -------------------------------------------------------------
export interface PostTemplate {
  id: string;
  title: string;
  text: string;
  createdAt: string;
}

export function getTemplates(): PostTemplate[] {
  try {
    const data = localStorage.getItem('XFreeDashboard_templates');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error loading templates from localStorage', err);
    return [];
  }
}

export function saveTemplates(templates: PostTemplate[]) {
  try {
    localStorage.setItem('XFreeDashboard_templates', JSON.stringify(templates));
  } catch (err) {
    console.error('Error saving templates to localStorage', err);
  }
}

