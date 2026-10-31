import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const s = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    s.on('connect', () => {
      console.log('[Socket Connected] Client ID:', s.id);
      if (user?.role) {
        s.emit('join_role_room', user.role);
      }
    });

    s.on('new_alert', (data) => {
      setAlerts((prev) => [data, ...prev].slice(0, 10));
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  const clearAlert = (index) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <SocketContext.Provider value={{ socket, alerts, clearAlert }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
