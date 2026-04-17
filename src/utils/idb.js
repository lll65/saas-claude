/* ══════════════════════════════════════════════════════════════
   HISTORIQUE — IndexedDB (stockage client, 20 entrées max)
══════════════════════════════════════════════════════════════ */
export const IDB = {
  DB: 'pixglow_db', VERSION: 1, STORE: 'history', MAX: 20,
  open() {
    return new Promise((res, rej) => {
      const req = indexedDB.open(this.DB, this.VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE)) {
          const s = db.createObjectStore(this.STORE, { keyPath: 'id' });
          s.createIndex('ts', 'ts');
        }
      };
      req.onsuccess = e => res(e.target.result);
      req.onerror  = e => rej(e.target.error);
    });
  },
  async add(entry) {
    const db = await this.open();
    await new Promise((res, rej) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      const s  = tx.objectStore(this.STORE);
      s.add({ ...entry, id: Date.now(), ts: new Date().toISOString() });
      tx.oncomplete = res; tx.onerror = e => rej(e.target.error);
    });
    // Supprime les plus vieilles entrées au-delà de MAX
    const all = await this.getAll();
    if (all.length > this.MAX) {
      const toDelete = all.slice(this.MAX);
      const db2 = await this.open();
      await new Promise((res, rej) => {
        const tx = db2.transaction(this.STORE, 'readwrite');
        const s  = tx.objectStore(this.STORE);
        toDelete.forEach(e => s.delete(e.id));
        tx.oncomplete = res; tx.onerror = e => rej(e.target.error);
      });
    }
  },
  async getAll() {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx = db.transaction(this.STORE, 'readonly');
      const req = tx.objectStore(this.STORE).index('ts').getAll();
      req.onsuccess = () => res([...req.result].reverse()); // newest first
      req.onerror   = e => rej(e.target.error);
    });
  },
  async clear() {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      tx.objectStore(this.STORE).clear();
      tx.oncomplete = res; tx.onerror = e => rej(e.target.error);
    });
  },
};
