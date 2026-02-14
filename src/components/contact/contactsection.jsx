import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './contact.css';
import Header from '../header/header';

function ContactSection() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        mensagem: '',
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validação de formato (Regex) - Substitui a API externa
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setStatus('Por favor, insira um e-mail válido.');
            return;
        }

        setStatus('Enviando mensagem...');

        try {
            // 2. Envio direto para o Web3Forms (que já possui filtros internos)
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    nome: formData.nome,
                    email: formData.email,
                    mensagem: formData.mensagem,
                    access_key: "6bfb8ce2-b3bd-4b53-b930-58ee0212a817" // Sua chave Web3Forms
                }),
            });

            const result = await response.json();

            if (result.success) {
                setStatus('Mensagem enviada com sucesso! Redirecionando...');
                setFormData({ nome: '', email: '', mensagem: '' });
                
                // Redireciona para a home após 3 segundos
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                setStatus('Ocorreu um erro ao enviar. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro no envio:', error);
            setStatus('Erro de conexão com o servidor.');
        }
    };

    return (
        <>
            <Header />
            <div className="contact-section-container">
                <div className="contact-info-panel">
                    <h1 className="contact-title">Fale Comigo!</h1>
                </div>

                <div className="form">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="nome">Nome</label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                placeholder="Seu nome completo"
                                value={formData.nome}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="seu@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="mensagem">Mensagem</label>
                            <textarea
                                id="mensagem"
                                name="mensagem"
                                placeholder="Como posso ajudar?"
                                value={formData.mensagem}
                                onChange={handleChange}
                                rows="5"
                                required
                            ></textarea>
                        </div>
                        <button type="submit">
                            {status === 'Enviando...' ? 'Processando...' : 'Enviar Mensagem'}
                        </button>
                    </form>
                    {status && (
                        <p className={`status-message ${status.includes('sucesso') ? 'success' : 'error'}`}>
                            {status}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

export default ContactSection;