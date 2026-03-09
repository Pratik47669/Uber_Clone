import React, { createContext, useEffect } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

const SocketProvider = ({ children }) => {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');

      const user = JSON.parse(localStorage.getItem("user"));
      const captain = JSON.parse(localStorage.getItem("captain"));

      if (user?._id) {
        socket.emit("join", {
          userId: user._id,
          role: "user"
        });
        console.log("✅ USER JOIN EMIT", user._id);
      }

      if (captain?._id) {
        socket.emit("join", {
          userId: captain._id,
          role: "captain"
        });
        console.log("✅ CAPTAIN JOIN EMIT", captain._id);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
