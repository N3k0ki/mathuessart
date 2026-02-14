import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/home';
import Login from './components/login/login';
import ProtectedRoute from './protectedroute';
import Addpost from './pages/addpost';
import MyPosts from './components/myposts/myposts';
import ContactPage from './pages/contact';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path='/contact' element={<ContactPage />} />
        
        <Route
          path="/addpost"
          element={
            <ProtectedRoute>
              <Addpost />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <MyPosts />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter >
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)