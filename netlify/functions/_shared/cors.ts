/**
 * CORS Middleware para Netlify Functions
 * Centraliza configuração de CORS e simplifica handlers
 */

import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';

export interface CorsOptions {
	allowOrigin?: string;
	allowMethods?: string;
	allowHeaders?: string;
	allowCredentials?: boolean;
}

const DEFAULT_CORS_OPTIONS: CorsOptions = {
	allowOrigin: '*',
	allowMethods: 'GET, POST, PUT, DELETE, OPTIONS',
	allowHeaders: 'Content-Type, Authorization',
	allowCredentials: false,
};

/**
 * Gera headers CORS baseado nas opções
 */
const getCorsHeaders = (options: CorsOptions = {}): Record<string, string> => {
	const opts = { ...DEFAULT_CORS_OPTIONS, ...options };

	const headers: Record<string, string> = {
		'Access-Control-Allow-Origin': opts.allowOrigin!,
		'Access-Control-Allow-Methods': opts.allowMethods!,
		'Access-Control-Allow-Headers': opts.allowHeaders!,
	};

	if (opts.allowCredentials) {
		headers['Access-Control-Allow-Credentials'] = 'true';
	}

	return headers;
};

/**
 * Middleware CORS para Netlify Functions
 *
 * @example
 * ```ts
 * import { withCors } from '../_shared/cors';
 *
 * export const handler = withCors(async (event, context) => {
 *   return {
 *     statusCode: 200,
 *     body: JSON.stringify({ message: 'Success' })
 *   };
 * });
 * ```
 */
export const withCors = (
	handler: Handler,
	options?: CorsOptions
): Handler => {
	return async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
		const corsHeaders = getCorsHeaders(options);

		// Handle preflight requests
		if (event.httpMethod === 'OPTIONS') {
			return {
				statusCode: 200,
				headers: corsHeaders,
				body: '',
			};
		}

		try {
			// Execute o handler original
			const response = await handler(event, context);

			// Merge CORS headers com headers existentes
			return {
				...response,
				headers: {
					...corsHeaders,
					...response.headers,
				},
			};
		} catch (error) {
			// Em caso de erro, retorne com CORS headers
			console.error('Handler error:', error);
			return {
				statusCode: 500,
				headers: corsHeaders,
				body: JSON.stringify({
					error: 'Internal Server Error',
					message: error instanceof Error ? error.message : 'Unknown error',
				}),
			};
		}
	};
};

/**
 * Alias para compatibilidade com diferentes estilos
 */
export default withCors;

/**
 * Helper para criar resposta JSON com CORS
 */
export const jsonResponse = (
	statusCode: number,
	data: unknown,
	additionalHeaders: Record<string, string> = {}
): HandlerResponse => {
	return {
		statusCode,
		headers: {
			'Content-Type': 'application/json',
			...additionalHeaders,
		},
		body: JSON.stringify(data),
	};
};

/**
 * CORS presets comuns
 */
export const CORS_PRESETS = {
	// Aceita requisições de qualquer origem
	PUBLIC: {
		allowOrigin: '*',
		allowMethods: 'GET, POST, PUT, DELETE, OPTIONS',
		allowHeaders: 'Content-Type, Authorization',
	},

	// Apenas GET (para APIs públicas read-only)
	READ_ONLY: {
		allowOrigin: '*',
		allowMethods: 'GET, OPTIONS',
		allowHeaders: 'Content-Type',
	},

	// Requer autenticação (para APIs protegidas)
	AUTHENTICATED: {
		allowOrigin: '*',
		allowMethods: 'GET, POST, PUT, DELETE, OPTIONS',
		allowHeaders: 'Content-Type, Authorization',
		allowCredentials: true,
	},
} as const;
