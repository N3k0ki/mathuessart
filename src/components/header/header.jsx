import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { auth } from "../../firebase/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { Instagram, Twitter, PlusSquare, LayoutDashboard } from "lucide-react" // Ícones novos para as funções
import "./header.css"

function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const justLoggedIn = sessionStorage.getItem('justLoggedIn');
      if (currentUser && !user) {
        if (!justLoggedIn) {
          setShowModal(true);
        }
      }
      setUser(currentUser);
    })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      unsubscribe()
    }
  }, [user])

  const handleLogout = async () => {
    try {
      navigate("/");
      sessionStorage.removeItem('justLoggedIn');
      setShowModal(false);
      setMenuOpen(false);
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  }

  return (
    <>
      <header className={`header ${isScrolled ? "scrolled" : ""} ${user ? "admin-mode" : ""}`}>
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span>matheussart</span>
          </Link>
        </div>

        <nav className={`nav ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Pinturas</Link>

          {user && (
            <div className="admin-links">
              <Link to="/addpost" onClick={() => setMenuOpen(false)} className="nav-admin-item">
                <PlusSquare size={18} /> <span>Adicionar</span>
              </Link>
              <Link to="/posts" onClick={() => setMenuOpen(false)} className="nav-admin-item">
                <LayoutDashboard size={18} /> <span>Gerenciar Posts</span>
              </Link>
            </div>
          )}

          <div className="nav-social-group">
            <Link to="/contact" onClick={() => setMenuOpen(false)}>Contato</Link>
            
            <div className="social-divider"></div>

            <a href="https://www.instagram.com/matheussdraws/" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Instagram size={20} />
            </a>
            
            <a href="https://x.com/matheussdesigns?s=20" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Twitter size={20} />
            </a>
          </div>

          {user && (
            <button className="logout-button" onClick={handleLogout}>
              Sair
            </button>
          )}
        </nav>

        <div className={`menu-toggle ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </div>
      </header>
    </>
  )
}

export default Header