import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt } from 'react-icons/fa';
export default function CheckoutFormModal({ isOpen, onClose, onSubmit, productName, productPrice, loading = false }) {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        endereco: {
            cep: '',
            rua: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: ''
        }
    });
    const [errors, setErrors] = useState({});
    const [loadingCep, setLoadingCep] = useState(false);
    // Máscaras
    const maskCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };
    const maskPhone = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };
    const maskCEP = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
    };
    // Buscar CEP
    const buscarCEP = async (cep) => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8)
            return;
        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();
            if (data.erro) {
                setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
                return;
            }
            setFormData(prev => ({
                ...prev,
                endereco: {
                    ...prev.endereco,
                    cep: maskCEP(cepLimpo),
                    rua: data.logradouro || '',
                    bairro: data.bairro || '',
                    cidade: data.localidade || '',
                    estado: data.uf || ''
                }
            }));
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.cep;
                return newErrors;
            });
        }
        catch {
            setErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP' }));
        }
        finally {
            setLoadingCep(false);
        }
    };
    // Validação
    const validate = () => {
        const newErrors = {};
        if (!formData.nome.trim())
            newErrors.nome = 'Nome é obrigatório';
        if (!formData.email.trim())
            newErrors.email = 'Email é obrigatório';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }
        if (!formData.telefone.trim())
            newErrors.telefone = 'Telefone é obrigatório';
        if (!formData.cpf.trim())
            newErrors.cpf = 'CPF é obrigatório';
        const cpfLimpo = formData.cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11)
            newErrors.cpf = 'CPF inválido';
        if (!formData.endereco.cep.trim())
            newErrors.cep = 'CEP é obrigatório';
        if (!formData.endereco.rua.trim())
            newErrors.rua = 'Rua é obrigatória';
        if (!formData.endereco.numero.trim())
            newErrors.numero = 'Número é obrigatório';
        if (!formData.endereco.bairro.trim())
            newErrors.bairro = 'Bairro é obrigatório';
        if (!formData.endereco.cidade.trim())
            newErrors.cidade = 'Cidade é obrigatória';
        if (!formData.endereco.estado.trim())
            newErrors.estado = 'Estado é obrigatório';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 relative", children: [_jsxs("div", { className: "bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl relative", children: [_jsx("button", { onClick: onClose, className: "absolute top-4 right-4 text-white/80 hover:text-white transition-colors", children: _jsx(FaTimes, { size: 24 }) }), _jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Finalizar Compra" }), _jsx("p", { className: "text-white/90", children: productName }), _jsxs("p", { className: "text-white/90 font-bold text-xl mt-2", children: ["R$ ", (productPrice / 100).toFixed(2).replace('.', ',')] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [_jsx(FaUser, { className: "text-purple-600" }), "Dados Pessoais"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome Completo *" }), _jsx("input", { type: "text", value: formData.nome, onChange: (e) => setFormData(prev => ({ ...prev, nome: e.target.value })), className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.nome ? 'border-red-500' : 'border-gray-300'}`, placeholder: "Jo\u00E3o da Silva" }), errors.nome && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.nome })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [_jsx(FaEnvelope, { className: "inline mr-1" }), " Email *"] }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })), className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`, placeholder: "seuemail@exemplo.com" }), errors.email && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.email })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [_jsx(FaPhone, { className: "inline mr-1" }), " Telefone *"] }), _jsx("input", { type: "tel", value: formData.telefone, onChange: (e) => setFormData(prev => ({ ...prev, telefone: maskPhone(e.target.value) })), className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.telefone ? 'border-red-500' : 'border-gray-300'}`, placeholder: "(11) 98765-4321", maxLength: 15 }), errors.telefone && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.telefone })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [_jsx(FaIdCard, { className: "inline mr-1" }), " CPF *"] }), _jsx("input", { type: "text", value: formData.cpf, onChange: (e) => setFormData(prev => ({ ...prev, cpf: maskCPF(e.target.value) })), className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.cpf ? 'border-red-500' : 'border-gray-300'}`, placeholder: "123.456.789-00", maxLength: 14 }), errors.cpf && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.cpf })] })] })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [_jsx(FaMapMarkerAlt, { className: "text-purple-600" }), "Endere\u00E7o de Entrega"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "CEP *" }), _jsx("input", { type: "text", value: formData.endereco.cep, onChange: (e) => {
                                                        const cep = maskCEP(e.target.value);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            endereco: { ...prev.endereco, cep }
                                                        }));
                                                    }, onBlur: (e) => buscarCEP(e.target.value), className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.cep ? 'border-red-500' : 'border-gray-300'}`, placeholder: "12345-678", maxLength: 9 }), loadingCep && _jsx("p", { className: "text-blue-500 text-sm mt-1", children: "Buscando CEP..." }), errors.cep && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.cep })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Rua *" }), _jsx("input", { type: "text", value: formData.endereco.rua, onChange: (e) => setFormData(prev => ({
                                                                ...prev,
                                                                endereco: { ...prev.endereco, rua: e.target.value }
                                                            })), className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.rua ? 'border-red-500' : 'border-gray-300'}` }), errors.rua && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.rua })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "N\u00FAmero *" }), _jsx("input", { type: "text", value: formData.endereco.numero, onChange: (e) => setFormData(prev => ({
                                                                ...prev,
                                                                endereco: { ...prev.endereco, numero: e.target.value }
                                                            })), className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.numero ? 'border-red-500' : 'border-gray-300'}` }), errors.numero && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.numero })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Complemento" }), _jsx("input", { type: "text", value: formData.endereco.complemento, onChange: (e) => setFormData(prev => ({
                                                        ...prev,
                                                        endereco: { ...prev.endereco, complemento: e.target.value }
                                                    })), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent", placeholder: "Apto, Bloco, etc" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Bairro *" }), _jsx("input", { type: "text", value: formData.endereco.bairro, onChange: (e) => setFormData(prev => ({
                                                                ...prev,
                                                                endereco: { ...prev.endereco, bairro: e.target.value }
                                                            })), className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.bairro ? 'border-red-500' : 'border-gray-300'}` }), errors.bairro && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.bairro })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Cidade *" }), _jsx("input", { type: "text", value: formData.endereco.cidade, onChange: (e) => setFormData(prev => ({
                                                                ...prev,
                                                                endereco: { ...prev.endereco, cidade: e.target.value }
                                                            })), className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.cidade ? 'border-red-500' : 'border-gray-300'}` }), errors.cidade && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.cidade })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "UF *" }), _jsx("input", { type: "text", value: formData.endereco.estado, onChange: (e) => setFormData(prev => ({
                                                                ...prev,
                                                                endereco: { ...prev.endereco, estado: e.target.value.toUpperCase() }
                                                            })), className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.estado ? 'border-red-500' : 'border-gray-300'}`, maxLength: 2 }), errors.estado && _jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.estado })] })] })] })] }), _jsxs("div", { className: "flex gap-4 pt-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium", disabled: loading, children: "Cancelar" }), _jsx("button", { type: "submit", className: "flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed", disabled: loading, children: loading ? 'Processando...' : 'Gerar QR Code PIX' })] })] })] }) }));
}
