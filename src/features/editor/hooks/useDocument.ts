import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export const useDocument = (slug: string) => {
  const queryClient = useQueryClient();
  const [localText, setLocalText] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'ready' | 'error'>('connecting');

  const docRef = doc(db, "documents", slug || 'default');

  useEffect(() => {
    setSyncStatus('connecting');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const content = data.content || '';
        const locked = data.isLocked || false;
        
        // Update local state if it differs from server to avoid cursor jumps
        setLocalText(prev => prev !== content ? content : prev);
        setIsLocked(locked);
        
        // Also update React Query cache
        queryClient.setQueryData(['document', slug], content);
      } else {
        setLocalText('');
        setIsLocked(false);
        queryClient.setQueryData(['document', slug], '');
      }
      setSyncStatus('ready');
    }, (error) => {
      console.error("Firestore error:", error);
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, [slug, queryClient]);

  const updateDocument = async (newText: string) => {
    if (isLocked) return; // Client-side guard
    setLocalText(newText);
    try {
      await setDoc(docRef, { content: newText, lastUpdated: new Date() }, { merge: true });
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const toggleLock = async () => {
    const nextState = !isLocked;
    setIsLocked(nextState);
    try {
      await setDoc(docRef, { isLocked: nextState }, { merge: true });
    } catch (err) {
      console.error("Lock error:", err);
      setIsLocked(!nextState); // Rollback
    }
  };

  return {
    text: localText,
    isLocked,
    updateDocument,
    toggleLock,
    syncStatus,
  };
};
