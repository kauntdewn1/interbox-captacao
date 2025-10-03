import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export default function CheckoutCard({ type, subtitle, amount }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [copied, setCopied] = useState(false);
    const [chargeData, setChargeData] = useState(null);
    const [status, setStatus] = useState('');
    const [showContactForm, setShowContactForm] = useState(true);
    const [contactInfo, setContactInfo] = useState({
        email: '',
        whatsapp: '',
        cpf: ''
    });
    const [contactErrors, setContactErrors] = useState({});
    const [contactSaved, setContactSaved] = useState(false);
    const navigate = useNavigate();
    // URLs das Netlify Functions
    const CREATE_CHARGE_URL = 'https://interbox-captacao.netlify.app/.netlify/functions/create-charge';
    const GET_CHARGE_URL = 'https://interbox-captacao.netlify.app/.netlify/functions/check-charge';
    // Validação dos dados de contato
    const validateContactInfo = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const whatsappRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
        const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
        if (!contactInfo.email || !emailRegex.test(contactInfo.email)) {
            errors.email = 'Email válido é obrigatório';
        }
        if (!contactInfo.whatsapp || !whatsappRegex.test(contactInfo.whatsapp)) {
            errors.whatsapp = 'WhatsApp válido é obrigatório (ex: 11 99999-9999)';
        }
        if (!contactInfo.cpf || !cpfRegex.test(contactInfo.cpf.replace(/\D/g, ''))) {
            errors.cpf = 'CPF válido é obrigatório (ex: 123.456.789-00)';
        }
        setContactErrors(errors);
        return Object.keys(errors).length === 0;
    };
    // Salvar dados de contato
    const handleSaveContactInfo = async () => {
        if (!validateContactInfo())
            return;
        try {
            // Salvar no localStorage para uso posterior
            const contactData = {
                email: contactInfo.email,
                whatsapp: contactInfo.whatsapp,
                cpf: contactInfo.cpf,
                type,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('interbox_contact_info', JSON.stringify(contactData));
            // 🆕 SALVAR NO SUPABASE IMEDIATAMENTE
            const inscricaoData = {
                nome: contactInfo.email.split('@')[0], // Usar parte do email como nome temporário
                email: contactInfo.email,
                whatsapp: contactInfo.whatsapp,
                cpf: contactInfo.cpf,
                tipo: type,
                valor: type === 'audiovisual' ? 29.90 : 0, // Judge e staff são gratuitos
                status: 'cadastrado',
                portfolio: '',
                experiencia: '',
                disponibilidade: '',
                motivacao: '',
                certificacoes: ''
            };
            const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/save-inscricao', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer interbox2025'
                },
                body: JSON.stringify(inscricaoData)
            });
            if (response.ok) {
                const result = await response.json();
                console.log(`✅ Inscrição ${type} salva no Supabase:`, result.inscricao?.id);
            }
            else {
                console.error(`❌ Erro ao salvar inscrição ${type} no Supabase:`, response.status);
            }
            // Log para debug e acompanhamento
            console.log('📧 INTERBØX - Dados de contato capturados:', {
                ...contactData,
                role: type === 'judge' ? 'Judge' : type === 'staff' ? 'Staff' : 'Audiovisual',
                event: 'INTERBØX 2025'
            });
            setShowContactForm(false);
            setContactSaved(true);
            // Limpar mensagem de sucesso após 3 segundos
            setTimeout(() => setContactSaved(false), 3000);
        }
        catch (error) {
            console.error('Erro ao salvar dados de contato:', error);
        }
    };
    const handleGeneratePix = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(CREATE_CHARGE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type,
                    customerData: {
                        name: `Candidato ${type}`,
                        email: contactInfo.email,
                        phone: contactInfo.whatsapp,
                        cpf: contactInfo.cpf
                    }
                }),
            });
            if (!response.ok) {
                throw new Error('Erro ao gerar PIX');
            }
            const data = await response.json();
            if (data.success) {
                // Normalizar resposta das Netlify Functions
                const charge = data.charge;
                console.log('🔍 Dados brutos da API:', data);
                console.log('🔍 Charge object:', charge);
                // 🆕 CORREÇÃO: Mapear corretamente os campos aninhados
                const normalizedData = {
                    identifier: charge.correlationID,
                    id: charge.correlationID,
                    correlationID: charge.correlationID,
                    status: charge.status || charge.charge?.status,
                    brCode: charge.brCode || charge.charge?.brCode,
                    qrCodeImage: charge.qrCodeImage || charge.charge?.qrCodeImage,
                    qrCode: charge.qrCodeImage || charge.charge?.qrCodeImage || charge.qrCode,
                    pixCopyPaste: charge.brCode || charge.charge?.brCode || charge.pixCopyPaste,
                    fallback: data.fallback,
                    message: data.message
                };
                console.log('🔍 Dados normalizados:', normalizedData);
                console.log('🔍 QR Code URL:', normalizedData.qrCode);
                console.log('🔍 PIX Code:', normalizedData.pixCopyPaste);
                setChargeData(normalizedData);
                setStatus(charge.status || 'ACTIVE');
                console.log('🎯 PIX gerado:', {
                    type,
                    correlationID: charge.correlationID,
                    fallback: data.fallback,
                    message: data.message
                });
                // 🆕 ATUALIZAR INSCRIÇÃO NO SUPABASE COM CORRELATION ID
                try {
                    const updateData = {
                        email: contactInfo.email,
                        tipo: type,
                        correlationID: charge.correlationID,
                        charge_id: charge.identifier || charge.correlationID,
                        status: 'pendente'
                    };
                    const updateResponse = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/update-inscricao', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer interbox2025'
                        },
                        body: JSON.stringify(updateData)
                    });
                    if (updateResponse.ok) {
                        const result = await updateResponse.json();
                        console.log('✅ Inscrição atualizada com correlation ID:', result.inscricao?.id);
                    }
                    else {
                        console.error('❌ Erro ao atualizar inscrição:', updateResponse.status);
                    }
                    console.log('✅ PIX gerado para inscrição:', charge.correlationID);
                }
                catch (error) {
                    console.error('❌ Erro ao atualizar inscrição:', error);
                }
            }
            else {
                throw new Error(data.error || 'Erro ao gerar PIX');
            }
        }
        catch (error) {
            console.error('Erro ao gerar PIX:', error);
            // TODO: Adicionar toast de erro
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCheckStatus = async () => {
        if (!chargeData?.correlationID)
            return;
        setIsCheckingStatus(true);
        try {
            const response = await fetch(`${GET_CHARGE_URL}?chargeId=${chargeData.correlationID}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const charge = data.charge;
                    setStatus(charge.status);
                    if (charge.status === 'COMPLETED' || charge.paid) {
                        console.log('🎉 Pagamento confirmado!');
                        // 🆕 ATUALIZAR STATUS NO SUPABASE
                        try {
                            const updateData = {
                                email: contactInfo.email,
                                tipo: type,
                                status: 'pago',
                                data_confirmacao: new Date().toISOString()
                            };
                            const updateResponse = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/update-inscricao', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer interbox2025'
                                },
                                body: JSON.stringify(updateData)
                            });
                            if (updateResponse.ok) {
                                console.log('✅ Status de pagamento atualizado no Supabase');
                            }
                            else {
                                console.error('❌ Erro ao atualizar status de pagamento:', updateResponse.status);
                            }
                        }
                        catch (error) {
                            console.error('❌ Erro ao atualizar status de pagamento:', error);
                        }
                        // Redirecionar para página de sucesso
                        navigate(`/${type}/success`, {
                            state: {
                                correlationID: charge.correlationID || chargeData?.correlationID,
                                amount: charge.value || charge.amount || (type === 'audiovisual' ? '2990' : '1990'), // Valor em centavos
                                description: charge.description || `Taxa de Inscrição - ${type.toUpperCase()} INTERBØX 2025`
                            }
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error('Erro ao verificar status:', error);
        }
        finally {
            setIsCheckingStatus(false);
        }
    };
    // Polling automático a cada 10 segundos
    useEffect(() => {
        if (!chargeData?.correlationID || status === 'COMPLETED' || status === 'EXPIRED')
            return;
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`${GET_CHARGE_URL}?chargeId=${chargeData.correlationID}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        const charge = data.charge;
                        if (charge.status !== status) {
                            setStatus(charge.status);
                            if (charge.status === 'COMPLETED' || charge.paid) {
                                console.log('🎉 Pagamento confirmado automaticamente!');
                                // Redirecionar para página de sucesso
                                navigate(`/${type}/success`, {
                                    state: {
                                        correlationID: charge.correlationID || chargeData?.correlationID,
                                        amount: charge.value || charge.amount || (type === 'audiovisual' ? '2990' : '1990'), // Valor em centavos
                                        description: charge.description || `Taxa de Inscrição - ${type.toUpperCase()} INTERBØX 2025`
                                    }
                                });
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error('Erro no polling:', error);
            }
        }, 10000); // 10 segundos
        return () => clearInterval(interval);
    }, [chargeData?.correlationID, status, GET_CHARGE_URL, navigate, type]);
    // Carregar dados de contato salvos anteriormente
    useEffect(() => {
        try {
            const savedContactInfo = localStorage.getItem('interbox_contact_info');
            if (savedContactInfo) {
                const parsed = JSON.parse(savedContactInfo);
                // Só carregar se for do mesmo tipo de inscrição
                if (parsed.type === type) {
                    setContactInfo({
                        email: parsed.email || '',
                        whatsapp: parsed.whatsapp || '',
                        cpf: parsed.cpf || ''
                    });
                    setShowContactForm(false);
                    setContactSaved(true);
                }
            }
        }
        catch (error) {
            console.error('Erro ao carregar dados salvos:', error);
        }
    }, [type]);
    const handleCopyBrCode = async () => {
        const pixCode = chargeData?.pixCopyPaste || chargeData?.brCode;
        if (!pixCode)
            return;
        try {
            await navigator.clipboard.writeText(pixCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch (error) {
            console.error('Erro ao copiar código:', error);
        }
    };
    const getTypeColor = () => {
        switch (type) {
            case 'audiovisual': return 'from-pink-500 to-purple-600';
            case 'judge': return 'from-pink-500 to-pink-600';
            case 'staff': return 'from-purple-500 to-purple-600';
            default: return 'from-pink-500 to-purple-600';
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-neutral-950 text-white", children: _jsx("main", { className: "pt-24 pb-16 px-4", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("div", { className: "mb-4", children: _jsx("img", { src: "/logos/FLOWPAY_trans.png", alt: "FlowPay", className: "mx-auto w-48 h-auto max-w-[200px] px-4 py-2" }) }), _jsx("p", { className: "text-xl text-white/70 max-w-lg mx-auto", children: subtitle })] }), _jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl p-8 mb-8", children: [showContactForm && (_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("h2", { className: "text-2xl font-semibold mb-2", children: "\uD83D\uDCE7 Dados de Contato" }), _jsx("p", { className: "text-white/60 text-sm", children: "Precisamos dessas informa\u00E7\u00F5es para confirmar sua inscri\u00E7\u00E3o" })] }), contactSaved && (_jsx("div", { className: "mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-center", children: _jsx("p", { className: "text-green-400 font-medium", children: "\u2705 Dados salvos com sucesso!" }) })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "checkout-contact-email", className: "block text-sm font-medium text-white/80 mb-2", children: "Email Profissional *" }), _jsx("input", { type: "email", id: "checkout-contact-email", name: "email", value: contactInfo.email, onChange: (e) => setContactInfo(prev => ({ ...prev, email: e.target.value })), placeholder: "seu@email.com", autoComplete: "email", className: `w-full px-4 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all ${contactErrors.email ? 'border-red-400' : 'border-white/20'}` }), contactErrors.email && (_jsx("p", { className: "text-red-400 text-sm mt-1", children: contactErrors.email }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "checkout-contact-whatsapp", className: "block text-sm font-medium text-white/80 mb-2", children: "WhatsApp *" }), _jsx("input", { type: "tel", id: "checkout-contact-whatsapp", name: "whatsapp", value: contactInfo.whatsapp, onChange: (e) => setContactInfo(prev => ({ ...prev, whatsapp: e.target.value })), placeholder: "11 99999-9999", autoComplete: "tel", className: `w-full px-4 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all ${contactErrors.whatsapp ? 'border-red-400' : 'border-white/20'}` }), contactErrors.whatsapp && (_jsx("p", { className: "text-red-400 text-sm mt-1", children: contactErrors.whatsapp }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "checkout-contact-cpf", className: "block text-sm font-medium text-white/80 mb-2", children: "CPF *" }), _jsx("input", { type: "text", id: "checkout-contact-cpf", name: "cpf", value: contactInfo.cpf, onChange: (e) => setContactInfo(prev => ({ ...prev, cpf: e.target.value })), placeholder: "123.456.789-00", autoComplete: "off", className: `w-full px-4 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all ${contactErrors.cpf ? 'border-red-400' : 'border-white/20'}` }), contactErrors.cpf && (_jsx("p", { className: "text-red-400 text-sm mt-1", children: contactErrors.cpf }))] }), _jsx("button", { onClick: handleSaveContactInfo, className: "w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200", children: "\u2705 Confirmar Dados" })] })] })), _jsxs("div", { className: "text-center mb-8", children: [!showContactForm && (_jsxs("div", { className: "mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "text-lg font-semibold text-green-400", children: "\u2705 Dados Confirmados" }), _jsx("button", { onClick: () => setShowContactForm(true), className: "text-green-400 hover:text-green-300 text-sm underline", children: "Editar" })] }), _jsxs("div", { className: "text-left text-sm text-green-300", children: [_jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", contactInfo.email] }), _jsxs("p", { children: [_jsx("strong", { children: "WhatsApp:" }), " ", contactInfo.whatsapp] }), _jsxs("p", { children: [_jsx("strong", { children: "CPF:" }), " ", contactInfo.cpf] })] })] })), _jsx("h2", { className: "text-2xl font-semibold mb-2", children: "\uD83D\uDCB3 Taxa de Inscri\u00E7\u00E3o" }), _jsx("p", { className: "text-4xl font-bold text-pink-400", children: amount }), _jsx("p", { className: "text-white/60 text-sm", children: "Pagamento \u00FAnico via PIX" })] }), !chargeData ? (_jsx("div", { className: "text-center", children: _jsx("button", { onClick: handleGeneratePix, disabled: isLoading || showContactForm, className: `group relative inline-flex items-center justify-center w-full px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r ${getTypeColor()} rounded-3xl shadow-2xl hover:opacity-90 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${showContactForm ? 'opacity-50 cursor-not-allowed' : ''}`, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" }), "Gerando PIX..."] })) : showContactForm ? ('📧 Complete os dados acima') : (_jsxs(_Fragment, { children: [_jsx("span", { className: "mr-2", children: "\uD83D\uDCB3" }), "Gerar PIX", _jsx("span", { className: "ml-2 group-hover:translate-x-1 transition-transform", children: "\u2192" })] })) }) })) : (
                            /* QR Code e informações de pagamento */
                            _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "inline-block p-4 bg-white rounded-2xl shadow-lg", children: chargeData.qrCode || chargeData.qrCodeImage ? (_jsx("img", { src: chargeData.qrCode || chargeData.qrCodeImage, alt: "QR Code PIX", className: "w-48 h-48 object-contain", onError: (e) => {
                                                        console.error('❌ Erro ao carregar QR Code:', e);
                                                        console.error('🔍 URL do QR Code:', chargeData.qrCode || chargeData.qrCodeImage);
                                                    }, onLoad: () => {
                                                        console.log('✅ QR Code carregado com sucesso:', chargeData.qrCode || chargeData.qrCodeImage);
                                                    } })) : (_jsx("div", { className: "w-48 h-48 flex items-center justify-center text-gray-500", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl mb-2", children: "\uD83D\uDD04" }), _jsx("div", { className: "text-sm", children: "Carregando QR Code..." })] }) })) }), _jsxs("div", { className: "mt-2 text-xs text-white/40", children: ["QR URL: ", chargeData.qrCode || chargeData.qrCodeImage || 'N/A'] })] }), _jsxs("div", { className: "bg-white/5 rounded-2xl p-6 border border-white/10", children: [_jsx("h3", { className: "text-lg font-semibold mb-3 text-center", children: "\uD83D\uDCF1 C\u00F3digo PIX" }), _jsxs("div", { className: "flex items-center justify-between bg-white/10 rounded-xl p-3 mb-3", children: [_jsx("code", { className: "text-sm text-white/80 font-mono break-all flex-1", children: chargeData.pixCopyPaste || chargeData.brCode }), _jsx("button", { onClick: handleCopyBrCode, className: "ml-3 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg text-sm font-medium transition-colors", children: copied ? '✓ Copiado!' : 'Copiar' })] }), _jsx("p", { className: "text-center text-white/60 text-sm", children: "Pague no seu app banc\u00E1rio. Expira em 24h." })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "mb-4", children: [_jsx("span", { className: "text-sm text-white/60", children: "Status: " }), _jsxs("span", { className: `text-sm font-medium ${status === 'COMPLETED' ? 'text-green-400' :
                                                            status === 'EXPIRED' ? 'text-red-400' :
                                                                'text-yellow-400'}`, children: [status === 'ACTIVE' && (_jsxs("div", { className: "inline-flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full" }), _jsx("span", { children: "Aguardando pagamento..." })] })), status === 'COMPLETED' && (_jsx("span", { className: "text-green-400 font-semibold", children: "\u2705 Pagamento confirmado!" })), status === 'EXPIRED' && 'Expirado', !status && 'Pendente'] })] }), _jsx("button", { onClick: handleCheckStatus, disabled: isCheckingStatus || status === 'COMPLETED', className: "px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-sm font-medium transition-all duration-200 disabled:opacity-50", children: isCheckingStatus ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline" }), "Verificando..."] })) : ('🔄 Atualizar Status') })] })] }))] }), _jsxs("div", { className: "text-center space-y-4", children: [_jsxs("button", { onClick: () => navigate('/'), className: "inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-medium transition-all duration-200", children: [_jsx("span", { className: "mr-2", children: "\u2190" }), "Voltar ao app"] }), _jsxs("div", { className: "text-white/40 text-sm", children: [_jsx("p", { children: "Confirma\u00E7\u00E3o feita manualmente pela organiza\u00E7\u00E3o." }), _jsx("p", { className: "mt-1", children: _jsxs("span", { className: "inline-flex items-center space-x-1", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full animate-pulse" }), _jsx("span", { children: "Sistema atualiza automaticamente a cada 10s" })] }) })] })] })] }) }) }));
}
