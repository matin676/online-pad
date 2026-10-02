import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  doc,
  onSnapshot,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';

const DEBOUNCE_MS = 500;
const VERSION_INTERVAL_MS = 30_000; // Save a version snapshot every 30s of changes

export type SyncStatus = 'connecting' | 'syncing' | 'ready' | 'error';
export type ExpiryOption = 'never' | '1h' | '24h' | '7d';

export const useDocument = (slug: string) => {
  const queryClient = useQueryClient();
  const [localText, setLocalText] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  // Refs to avoid stale closures in callbacks and timers
  const pendingWriteRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugRef = useRef(slug);
  const isLockedRef = useRef(false);
  const lastVersionTextRef = useRef('');
  const lastVersionTimeRef = useRef(0);

  // Keep refs in sync with latest values
  slugRef.current = slug;
  isLockedRef.current = isLocked;

  // ── Save a version snapshot ──────────────────────────────────────
  const saveVersion = useCallback(async (content: string) => {
    const now = Date.now();
    // Don't save if same as last version or too soon
    if (content === lastVersionTextRef.current) return;
    if (now - lastVersionTimeRef.current < VERSION_INTERVAL_MS) return;

    lastVersionTextRef.current = content;
    lastVersionTimeRef.current = now;

    try {
      const versionsRef = collection(db, 'documents', slugRef.current, 'versions');
      await addDoc(versionsRef, {
        content,
        charCount: content.length,
        savedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Version save error:', err);
    }
  }, []);

  // ── Real-time Firestore listener ──────────────────────────────────
  useEffect(() => {
    const docRef = doc(db, 'documents', slug || 'default');

    setSyncStatus('connecting');
    pendingWriteRef.current = null;
    lastVersionTextRef.current = '';
    lastVersionTimeRef.current = 0;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const content: string = data.content || '';
          const locked: boolean = data.isLocked || false;
          const expiry = data.expiresAt as Timestamp | undefined;

          // Always sync lock state — it doesn't affect cursor
          setIsLocked(locked);

          // Track expiry
          if (expiry?.toDate) {
            setExpiresAt(expiry.toDate());
          } else {
            setExpiresAt(null);
          }

          if (pendingWriteRef.current !== null) {
            // User has unsaved local edits — guard against overwriting them
            if (content === pendingWriteRef.current) {
              // Firestore acknowledged our write; safe to clear
              pendingWriteRef.current = null;
              setSyncStatus('ready');
            }
            // If content differs from our pending text it's either a stale
            // echo or a remote edit that our upcoming write will overwrite.
            // Either way, do NOT touch localText (prevents cursor jump).
          } else {
            // No pending local edits — accept the remote value
            setLocalText(content);
            setSyncStatus('ready');
          }

          queryClient.setQueryData(['document', slug], content);
        } else {
          // Document doesn't exist yet
          if (pendingWriteRef.current === null) {
            setLocalText('');
          }
          setIsLocked(false);
          setExpiresAt(null);
          queryClient.setQueryData(['document', slug], '');
          setSyncStatus('ready');
        }
      },
      (error) => {
        console.error('Firestore error:', error);
        setSyncStatus('error');
      },
    );

    return () => {
      unsubscribe();

      // Flush any unsaved content before tearing down
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (pendingWriteRef.current !== null) {
        const finalText = pendingWriteRef.current;
        const finalDocRef = doc(db, 'documents', slug || 'default');
        setDoc(
          finalDocRef,
          { content: finalText, lastUpdated: new Date() },
          { merge: true },
        ).catch((err) => console.error('Flush-on-unmount error:', err));
      }
    };
  }, [slug, queryClient]);

  // ── Write to Firestore (called after debounce) ───────────────────
  const flushToFirestore = useCallback(
    async (text: string) => {
      const docRef = doc(db, 'documents', slugRef.current || 'default');
      try {
        await setDoc(docRef, { content: text, lastUpdated: new Date() }, { merge: true });
        // Save a version snapshot (throttled internally)
        saveVersion(text);
        // Don't clear pendingWriteRef here — let the onSnapshot callback
        // do it so we're sure the round-trip is complete.
      } catch (err) {
        console.error('Save error:', err);
        // On failure, clear pending so we can accept remote updates again
        pendingWriteRef.current = null;
        setSyncStatus('error');
      }
    },
    [saveVersion],
  );

  // ── Public: update document text (debounced) ──────────────────────
  const updateDocument = useCallback(
    (newText: string) => {
      if (isLockedRef.current) return;

      // Immediately update local state for responsive typing
      setLocalText(newText);

      // Mark as pending — snapshot handler will skip remote overwrites
      pendingWriteRef.current = newText;
      setSyncStatus('syncing');

      // Reset the debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        flushToFirestore(newText);
      }, DEBOUNCE_MS);
    },
    [flushToFirestore],
  );

  // ── Public: toggle document lock ──────────────────────────────────
  const toggleLock = useCallback(async () => {
    const docRef = doc(db, 'documents', slugRef.current || 'default');
    const nextState = !isLockedRef.current;
    setIsLocked(nextState);
    try {
      await setDoc(docRef, { isLocked: nextState }, { merge: true });
    } catch (err) {
      console.error('Lock error:', err);
      setIsLocked(!nextState); // Rollback on failure
    }
  }, []);

  // ── Public: set document expiry ───────────────────────────────────
  const setExpiry = useCallback(async (option: ExpiryOption) => {
    const docRef = doc(db, 'documents', slugRef.current || 'default');

    let expiryDate: Date | null = null;
    if (option !== 'never') {
      expiryDate = new Date();
      switch (option) {
        case '1h':
          expiryDate.setHours(expiryDate.getHours() + 1);
          break;
        case '24h':
          expiryDate.setHours(expiryDate.getHours() + 24);
          break;
        case '7d':
          expiryDate.setDate(expiryDate.getDate() + 7);
          break;
      }
    }

    try {
      await setDoc(
        docRef,
        { expiresAt: expiryDate ? Timestamp.fromDate(expiryDate) : null },
        { merge: true },
      );
      setExpiresAt(expiryDate);
    } catch (err) {
      console.error('Expiry error:', err);
    }
  }, []);

  return {
    text: localText,
    isLocked,
    updateDocument,
    toggleLock,
    syncStatus,
    expiresAt,
    setExpiry,
  };
};
