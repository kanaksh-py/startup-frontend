import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Register from './pages/Register';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Chat from './pages/Chat';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';
import Landing from './pages/Landing';

function App() {
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); 
  const token = localStorage.getItem('token');
  
  // profileId is the MongoDB ObjectID used for backend logic
  const myProfileId = localStorage.getItem('myProfileId'); 

  useEffect(() => {
    if (!token) {
        if (socket) socket.close();
        return;
    }

    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'] 
    });

    newSocket.on("connect", () => {
      console.log("Socket Connected:", newSocket.id);
    });

    newSocket.on("receive_message", (msg) => {
      const isChatPage = window.location.pathname.includes('/chat');
      // If user is not on chat page and message is from someone else
      const isNotFromMe = String(msg.sender) !== String(myProfileId);

      if (!isChatPage && isNotFromMe) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket Auth Error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off("receive_message");
      newSocket.close();
    };
  }, [token, myProfileId]);

  return (
    <Router>
      {token && <Navbar unreadCount={unreadCount} setUnreadCount={setUnreadCount} />}
      
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/search" element={<SearchResults />} />
        
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