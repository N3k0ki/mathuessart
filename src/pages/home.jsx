import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Header from '../components/header/header'
import '../components/header/header.css'
import '../components/header/home.css'

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // 1. Escuta de Posts (Sua lógica original)
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsArray);
      setLoading(false);
    });

    // 2. Lógica do Pop-up de Login salvo
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      const justLoggedIn = sessionStorage.getItem('justLoggedIn');

      // Se existe usuário logado e ele NÃO acabou de passar pela tela de login
      if (currentUser && !justLoggedIn) {
        setShowModal(true);
      }
      setUser(currentUser);
    });

    return () => {
      unsubscribePosts();
      unsubscribeAuth();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem('justLoggedIn');
    setShowModal(false);
    navigate("/"); // Garante que permanece na home mas deslogado
  };

  const handleContinue = () => {
    sessionStorage.setItem('justLoggedIn', 'true');
    setShowModal(false);
  };

  return (
    <div className="home-container">
      <Header />

      <main className="gallery-grid">
        {loading ? (
          <p className="loading-text">Carregando obras...</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="art-card">
              <div className="image-wrapper">
                <img
                  src={post.imageUrl}
                  alt={post.texto}
                  className={`art-image ${post.orientation}`}
                />
              </div>
              {post.texto && <p className="art-caption">{post.texto}</p>}
            </div>
          ))
        )}
      </main>

      {/* MODAL PERSONALIZADO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Sessão Ativa</h3>
            <p>Você já está conectado como administrador. Deseja continuar?</p>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={handleContinue}>
                Sim, continuar
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                Não, sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home;