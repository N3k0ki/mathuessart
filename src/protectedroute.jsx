import { Navigate } from 'react-router-dom';
import { auth } from './firebase/firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="login-container">Carregando...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute; // Não esqueça do export!