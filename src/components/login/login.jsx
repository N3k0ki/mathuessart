import { useState } from 'react';
import { auth, db } from '../../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './login.css'

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );
            
            const user = userCredential.user;

            // Tentamos buscar o usuário no banco, mas não vamos bloquear o login
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            // Redireciona diretamente para o addpost após o sucesso
            console.log("Login realizado com sucesso!");
            navigate('/posts'); 

        } catch (err) {
            console.error("Erro no login:", err.code);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('E-mail não cadastrado ou senha incorreta.');
            } else {
                setError('Erro ao entrar: Verifique suas credenciais.');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Entrar</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div className="input-group">
                        <label>Senha</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="******"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Ocultar" : "Ver"}
                            </button>
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-btn">Acessar</button>
                </form>
            </div>
        </div>
    );
}

export default Login;