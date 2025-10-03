/**
 * Netlify Function Handler com CORS + fallback OPTIONS + body parser limpo
 */

import type {
	Handler,
	HandlerEvent,
	HandlerContext,
	HandlerResponse,
  } from '@netlify/functions';
  
  const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  export const withCors = (
	handler: (event: HandlerEvent, context: HandlerContext) => Promise<HandlerResponse>
  ): Handler => {
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
	  } catch (error: unknown) {
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
  export const parseBody = <T = Record<string, unknown>>(event: HandlerEvent): T => {
    try {
      if (event.body) {
        return JSON.parse(event.body) as T;
      }
      return {} as T;
    } catch (err) {
      console.warn('Erro ao fazer parse do body:', err);
      return {} as T;
    }
  };