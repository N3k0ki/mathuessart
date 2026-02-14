import { useState, useEffect } from 'react'
import { db } from '../../firebase/firebase' 
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore' // Importado doc e deleteDoc
import Header from '../header/header'
import { Trash2 } from 'lucide-react'
import '../header/header.css'
import './myposts.css'

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsArray);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      try {
        await deleteDoc(doc(db, "posts", id));
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
    }
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
                <img src={post.imageUrl} alt={post.texto || "Obra de arte"} />
              </div>
              
              <div className="art-footer">
                <p className="art-caption">{post.texto}</p>
                <button 
                  className="delete-icon-btn" 
                  onClick={() => handleDelete(post.id)}
                  aria-label="Excluir post"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}

export default MyPosts;