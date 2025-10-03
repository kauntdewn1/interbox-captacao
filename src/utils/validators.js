/**
 * Validadores Centralizados - INTERBØX 2025
 * Consolida todas as validações de formulários, APIs e dados de entrada
 * Elimina duplicação e garante consistência
 */
// ============================================================================
// Regex Patterns (Centralizados)
// ============================================================================
export const REGEX = {
    // Email: RFC 5322 simplificado
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // WhatsApp/Telefone brasileiro: +55 (11) 99999-9999 ou 11999999999
    WHATSAPP: /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/,
    TELEFONE: /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/,
    // CPF: 000.000.000-00 ou 00000000000
    CPF: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
    // Data: YYYY-MM-DD ou DD/MM/YYYY
    DATA_ISO: /^\d{4}-\d{2}-\d{2}$/,
    DATA_BR: /^\d{2}\/\d{2}\/\d{4}$/,
    // Nome: mínimo 2 palavras, apenas letras e espaços
    NOME_COMPLETO: /^[A-Za-zÀ-ÿ\s]{2,}\s+[A-Za-zÀ-ÿ\s]{2,}$/,
    // Apenas letras, acentos e espaços
    APENAS_LETRAS: /^[A-Za-zÀ-ÿ\s]+$/,
    // URL válida
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
};
// ============================================================================
// Validadores Individuais
// ============================================================================
/**
 * Valida email
 */
export const isValidEmail = (email) => {
    if (!email || typeof email !== 'string')
        return false;
    return REGEX.EMAIL.test(email.trim());
};
/**
 * Valida WhatsApp/Telefone
 */
export const isValidWhatsApp = (whatsapp) => {
    if (!whatsapp || typeof whatsapp !== 'string')
        return false;
    return REGEX.WHATSAPP.test(whatsapp.trim());
};
export const isValidTelefone = (telefone) => {
    if (!telefone || typeof telefone !== 'string')
        return false;
    return REGEX.TELEFONE.test(telefone.trim());
};
/**
 * Valida CPF (formato e dígitos verificadores)
 */
export const isValidCPF = (cpf) => {
    if (!cpf || typeof cpf !== 'string')
        return false;
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    // Verifica formato básico
    if (!REGEX.CPF.test(cpf))
        return false;
    // CPF deve ter 11 dígitos
    if (cleanCPF.length !== 11)
        return false;
    // Rejeita CPFs conhecidos como inválidos (todos dígitos iguais)
    if (/^(\d)\1{10}$/.test(cleanCPF))
        return false;
    // Valida dígitos verificadores
    let sum = 0;
    let remainder;
    // Valida primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10)))
        return false;
    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11)))
        return false;
    return true;
};
/**
 * Valida nome completo (mínimo 2 palavras)
 */
export const isValidNomeCompleto = (nome) => {
    if (!nome || typeof nome !== 'string')
        return false;
    const trimmed = nome.trim();
    return trimmed.length >= 3 && REGEX.NOME_COMPLETO.test(trimmed);
};
/**
 * Valida data no formato ISO (YYYY-MM-DD)
 */
export const isValidDataISO = (data) => {
    if (!data || typeof data !== 'string')
        return false;
    if (!REGEX.DATA_ISO.test(data))
        return false;
    const date = new Date(data);
    return date instanceof Date && !isNaN(date.getTime());
};
/**
 * Valida data no formato brasileiro (DD/MM/YYYY)
 */
export const isValidDataBR = (data) => {
    if (!data || typeof data !== 'string')
        return false;
    if (!REGEX.DATA_BR.test(data))
        return false;
    const [day, month, year] = data.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return (date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day);
};
/**
 * Valida idade mínima (em anos)
 */
export const isValidIdadeMinima = (dataNascimento, idadeMinima = 18) => {
    if (!isValidDataISO(dataNascimento))
        return false;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAniversario = hoje.getMonth() - nascimento.getMonth();
    if (mesAniversario < 0 || (mesAniversario === 0 && hoje.getDate() < nascimento.getDate())) {
        return idade - 1 >= idadeMinima;
    }
    return idade >= idadeMinima;
};
/**
 * Valida URL
 */
export const isValidURL = (url) => {
    if (!url || typeof url !== 'string')
        return false;
    return REGEX.URL.test(url.trim());
};
// ============================================================================
// Validadores Compostos (Objetos Completos)
// ============================================================================
/**
 * Valida dados de contato (usado em CheckoutCard e formulários)
 */
export const validateContact = (contact) => {
    const errors = {};
    // Email
    if (!contact.email) {
        errors.email = 'Email é obrigatório';
    }
    else if (!isValidEmail(contact.email)) {
        errors.email = 'Email inválido';
    }
    // WhatsApp/Telefone (aceita ambos os campos)
    const telefone = contact.whatsapp || contact.telefone;
    if (!telefone) {
        errors.whatsapp = 'WhatsApp/Telefone é obrigatório';
    }
    else if (!isValidWhatsApp(telefone)) {
        errors.whatsapp = 'WhatsApp/Telefone inválido (ex: 11 99999-9999)';
    }
    // CPF (opcional mas se fornecido deve ser válido)
    if (contact.cpf) {
        if (!isValidCPF(contact.cpf)) {
            errors.cpf = 'CPF inválido (ex: 123.456.789-00)';
        }
    }
    // Nome (se fornecido)
    if (contact.nome && contact.nome.trim().length < 3) {
        errors.nome = 'Nome deve ter no mínimo 3 caracteres';
    }
    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};
/**
 * Valida dados de inscrição (audiovisual/judge/staff)
 */
export const validateInscricao = (inscricao) => {
    const errors = {};
    // Campos obrigatórios
    if (!inscricao.nome || inscricao.nome.trim().length < 3) {
        errors.nome = 'Nome é obrigatório (mínimo 3 caracteres)';
    }
    if (!inscricao.email) {
        errors.email = 'Email é obrigatório';
    }
    else if (!isValidEmail(inscricao.email)) {
        errors.email = 'Email inválido';
    }
    if (!inscricao.tipo || !['audiovisual', 'judge', 'staff'].includes(inscricao.tipo)) {
        errors.tipo = 'Tipo de inscrição inválido';
    }
    // Campos opcionais mas validados se fornecidos
    if (inscricao.whatsapp && !isValidWhatsApp(inscricao.whatsapp)) {
        errors.whatsapp = 'WhatsApp inválido';
    }
    if (inscricao.cpf && !isValidCPF(inscricao.cpf)) {
        errors.cpf = 'CPF inválido';
    }
    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};
/**
 * Valida dados de seguro
 */
export const validateSeguro = (seguro) => {
    const errors = {};
    // Nome
    if (!seguro.nome || seguro.nome.trim().length < 3) {
        errors.nome = 'Nome completo é obrigatório';
    }
    else if (!isValidNomeCompleto(seguro.nome)) {
        errors.nome = 'Informe nome e sobrenome';
    }
    // CPF
    if (!seguro.cpf) {
        errors.cpf = 'CPF é obrigatório';
    }
    else if (!isValidCPF(seguro.cpf)) {
        errors.cpf = 'CPF inválido';
    }
    // Data de nascimento
    if (!seguro.dataNascimento) {
        errors.dataNascimento = 'Data de nascimento é obrigatória';
    }
    else if (!isValidDataISO(seguro.dataNascimento)) {
        errors.dataNascimento = 'Data inválida (formato: YYYY-MM-DD)';
    }
    else if (!isValidIdadeMinima(seguro.dataNascimento, 16)) {
        errors.dataNascimento = 'Idade mínima: 16 anos';
    }
    // Sexo
    if (!seguro.sexo || !['M', 'F', 'Outro'].includes(seguro.sexo)) {
        errors.sexo = 'Sexo é obrigatório';
    }
    // Email
    if (!seguro.email) {
        errors.email = 'Email é obrigatório';
    }
    else if (!isValidEmail(seguro.email)) {
        errors.email = 'Email inválido';
    }
    // Telefone
    if (!seguro.telefone) {
        errors.telefone = 'Telefone é obrigatório';
    }
    else if (!isValidTelefone(seguro.telefone)) {
        errors.telefone = 'Telefone inválido (ex: 11 99999-9999)';
    }
    // Nome do time
    if (!seguro.nomeTime || seguro.nomeTime.trim().length < 3) {
        errors.nomeTime = 'Nome do time é obrigatório (mínimo 3 caracteres)';
    }
    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};
// ============================================================================
// Helpers de Formatação
// ============================================================================
/**
 * Formata CPF: 12345678900 → 123.456.789-00
 */
export const formatCPF = (cpf) => {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11)
        return cpf;
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};
/**
 * Formata telefone: 11999999999 → (11) 99999-9999
 */
export const formatTelefone = (telefone) => {
    const clean = telefone.replace(/\D/g, '');
    if (clean.length === 11) {
        return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    else if (clean.length === 10) {
        return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
};
/**
 * Remove caracteres não numéricos
 */
export const cleanNumeric = (value) => {
    return value.replace(/\D/g, '');
};
// ============================================================================
// Validadores Express (para APIs)
// ============================================================================
/**
 * Retorna array de erros para compatibilidade com APIs
 */
export const validateContactErrors = (contact) => {
    const result = validateContact(contact);
    return result.valid ? [] : Object.values(result.errors);
};
export const validateInscricaoErrors = (inscricao) => {
    const result = validateInscricao(inscricao);
    return result.valid ? [] : Object.values(result.errors);
};
export const validateSeguroErrors = (seguro) => {
    const result = validateSeguro(seguro);
    return result.valid ? [] : Object.values(result.errors);
};
