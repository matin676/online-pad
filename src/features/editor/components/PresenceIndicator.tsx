import React, { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Box, Tooltip, Avatar, AvatarGroup, Typography } from '@mui/material';
import { Users } from 'lucide-react';

interface PresenceProps {
  slug: string;
}

export const PresenceIndicator: React.FC<PresenceProps> = ({ slug }) => {
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [userId] = useState(() => localStorage.getItem('onlinepad-user-id') || Math.random().toString(36).substring(7));

  useEffect(() => {
    localStorage.setItem('onlinepad-user-id', userId);
    
    // 1. Join presence
    const userRef = doc(db, 'pads', slug, 'presence', userId);
    const updateHeartbeat = () => {
      setDoc(userRef, {
        lastSeen: serverTimestamp(),
      }, { merge: true });
    };

    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 30000); // Heartbeat every 30s

    // 2. Listen for active users
    const presenceRef = collection(db, 'pads', slug, 'presence');
    const q = query(presenceRef); // We'll filter client-side for simplicity or use a TTL-like check

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const sixtySecondsAgo = now - 60000;
      
      const count = snapshot.docs.filter(doc => {
        const data = doc.data();
        const lastSeen = data.lastSeen as Timestamp;
        return lastSeen && lastSeen.toMillis() > sixtySecondsAgo;
      }).length;
      
      setActiveUsers(count);
    });

    // 3. Cleanup
    return () => {
      clearInterval(interval);
      deleteDoc(userRef);
      unsubscribe();
    };
  }, [slug, userId]);

  if (activeUsers <= 0) return null;

  return (
    <Tooltip title={`${activeUsers} user${activeUsers > 1 ? 's' : ''} currently editing`}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1, color: 'text.secondary' }}>
        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
           {[...Array(activeUsers)].map((_, i) => (
             <Avatar key={i} sx={{ bgcolor: 'primary.light' }}>
               <Users size={14} />
             </Avatar>
           ))}
        </AvatarGroup>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {activeUsers}
        </Typography>
      </Box>
    </Tooltip>
  );
};
