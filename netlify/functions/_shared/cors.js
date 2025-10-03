/**
 * Netlify Function Handler com CORS + fallback OPTIONS + body parser limpo
 */
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
export const withCors = (handler) => {
    return async (event, context) => {
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 204,
                headers: corsHeaders,
                body: '',
            };
        }
        try {
            const response = await handler(event, context);
            return {
                ...response,
                headers: {
                    ...corsHeaders,
                    ...(response && typeof response === 'object' && 'headers' in response && response.headers
                        ? response.headers
                        : {}),
                },
            };
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : typeof error === 'string'
                    ? error
                    : 'Unknown error';
            console.error('Handler error:', error);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Internal Server Error',
                    message,
                }),
            };
        }
    };
};
/**
 * Utilitário simples pra fazer parse seguro do body
 */
export const parseBody = (event) => {
    try {
        if (event.body) {
            return JSON.parse(event.body);
        }
        return {};
    }
    catch (err) {
        console.warn('Erro ao fazer parse do body:', err);
        return {};
    }
};
/**
 * Helper para criar respostas JSON com CORS
 */
export const jsonResponse = (statusCode, data) => {
    return {
        statusCode,
        headers: corsHeaders,
        body: JSON.stringify(data),
    };
};
/**
 * Presets de CORS para diferentes origens
 */
export const CORS_PRESETS = {
    allowAll: corsHeaders,
    localhost: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': 'http://localhost:5173',
    },
};
