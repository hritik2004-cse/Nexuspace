"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import api from "@/services/api";

// ─── IndexedDB helpers ───────────────────────────────────────────────────────

const DB_NAME = "nexuspace_offline";
const DB_VERSION = 1;
const STORE = "message_queue";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "clientId" });
        store.createIndex("queuedAt", "queuedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).index("queuedAt").getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbDelete(clientId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(clientId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000; // 1s → 2s → 4s → 8s → 16s → capped at 30s

function backoffDelay(attempt) {
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempt), 30000);
}

function generateClientId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useOfflineQueue
 *
 * Provides a persistent offline message queue backed by IndexedDB.
 * Messages are buffered when offline or when an immediate send fails,
 * and automatically drained (FIFO, with exponential backoff) once online.
 *
 * @param {Function} onMessageDelivered  Called with server payload after each
 *                                       successful queue drain item.
 * @returns {{ queueMessage, drainQueue, status }}
 */
export function useOfflineQueue(onMessageDelivered) {
  const [status, setStatus] = useState({
    pendingCount: 0,
    isSyncing: false,
    failedCount: 0,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  });

  const isSyncingRef = useRef(false);
  const onDeliveredRef = useRef(onMessageDelivered);
  useEffect(() => { onDeliveredRef.current = onMessageDelivered; }, [onMessageDelivered]);

  // ── Refresh pending/failed counts from DB ────────────────────────────────
  const refreshStatus = useCallback(async () => {
    try {
      const items = await dbGetAll();
      const failed = items.filter((m) => m.retries >= MAX_RETRIES).length;
      const pending = items.filter((m) => m.retries < MAX_RETRIES).length;
      setStatus((prev) => ({ ...prev, pendingCount: pending, failedCount: failed }));
    } catch (err) {
      console.warn("[OfflineQueue] Could not read IndexedDB:", err);
    }
  }, []);

  // ── Drain queue FIFO with exponential backoff ─────────────────────────
  const drainQueue = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      const items = await dbGetAll();
      const pending = items.filter((m) => m.retries < MAX_RETRIES);

      for (const item of pending) {
        try {
          const res = await api.post("/messages", {
            content: item.content,
            channelId: item.channelId,
            attachments: item.attachments || [],
            replyTo: item.replyTo || null,
            type: item.type || "text",
            clientId: item.clientId, // server deduplicates on this field
          });

          await dbDelete(item.clientId);
          if (onDeliveredRef.current) {
            onDeliveredRef.current(res.data);
          }
        } catch (err) {
          const updatedItem = {
            ...item,
            retries: (item.retries || 0) + 1,
            lastError: err?.response?.data?.message || err.message,
            lastAttemptAt: Date.now(),
          };
          await dbPut(updatedItem);

          if (updatedItem.retries < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, backoffDelay(updatedItem.retries)));
          } else {
            console.warn(
              `[OfflineQueue] Message ${item.clientId} permanently failed after ${MAX_RETRIES} retries.`
            );
          }
        }
      }
    } finally {
      isSyncingRef.current = false;
      setStatus((prev) => ({ ...prev, isSyncing: false }));
      await refreshStatus();
    }
  }, [refreshStatus]);

  // ── Queue or send immediately ────────────────────────────────────────────
  /**
   * Attempts an immediate send if online.
   * On failure (or if already offline), persists to IndexedDB for later drain.
   */
  const queueMessage = useCallback(
    async ({ content, channelId, attachments, replyTo, type }) => {
      const clientId = generateClientId();
      const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

      const record = {
        clientId,
        content,
        channelId,
        attachments: attachments || [],
        replyTo: replyTo || null,
        type: type || "text",
        retries: 0,
        queuedAt: Date.now(),
        lastError: null,
        lastAttemptAt: null,
      };

      if (isOnline) {
        try {
          const res = await api.post("/messages", {
            content,
            channelId,
            attachments: record.attachments,
            replyTo: record.replyTo,
            type: record.type,
            clientId,
          });
          if (onDeliveredRef.current) {
            onDeliveredRef.current(res.data);
          }
          return { queued: false, clientId };
        } catch (err) {
          console.warn("[OfflineQueue] Immediate send failed, queuing:", err.message);
        }
      }

      await dbPut(record);
      await refreshStatus();
      return { queued: true, clientId };
    },
    [refreshStatus]
  );

  // ── Online / Offline event listeners ─────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }));
      drainQueue();
    };
    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // On mount: load pending count, and drain if already online
    refreshStatus().then(() => {
      if (typeof navigator !== "undefined" && navigator.onLine) {
        drainQueue();
      }
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [drainQueue, refreshStatus]);

  return { queueMessage, drainQueue, status };
}
