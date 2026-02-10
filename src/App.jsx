import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Register from './pages/Register';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Chat from './pages/Chat';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';

function App() {
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); 
  const token = localStorage.getItem('token');
  const myId = localStorage.getItem('myStartupId');

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    setSocket(newSocket);

    // Socket listeners
    newSocket.on("receive_message", (msg) => {
      // Logic: If I am NOT on the chat page AND the message is NOT from me
      // (Using String comparison to be safe with MongoDB IDs)
      const isNotChatPage = !window.location.pathname.includes('/chat');
      const isNotFromMe = String(msg.sender) !== String(myId);

      if (isNotChatPage && isNotFromMe) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    // Cleanup on unmount or token change
    return () => {
      newSocket.off("receive_message");
      newSocket.close();
    };
  }, [token, myId]);

  return (
    <Router>
      {/* Navbar stays synced with unreadCount */}
      {token && <Navbar unreadCount={unreadCount} setUnreadCount={setUnreadCount} />}
      
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile/:id" element={<Profile />} />
        
        {/* Chat component clears the count via setUnreadCount */}
        <Route 
          path="/chat" 
          element={
            <Chat 
              globalSocket={socket} 
              setUnreadCount={setUnreadCount} 
            />
          } 
        />
        
        <Route path="/" element={<Navigate to={token ? "/feed" : "/register"} />} />
      </Routes>
    </Router>
  );
}

export default App;