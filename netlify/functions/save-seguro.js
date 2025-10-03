exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const auth = event.headers['authorization'] || event.headers['Authorization'] || '';
    if (!auth.includes('interbox2025')) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const payload = JSON.parse(event.body || '{}');

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return { statusCode: 500, body: 'Supabase env missing' };
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/seguro_solicitacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    if (!res.ok) {
      return { statusCode: res.status, body: text };
    }

    return { statusCode: 200, body: text };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};

