exports.handler = async () => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return { statusCode: 500, body: 'Supabase env missing' };
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/seguro_solicitacoes?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    const text = await res.text();
    if (!res.ok) return { statusCode: res.status, body: text };
    return { statusCode: 200, body: text, headers: { 'Content-Type': 'application/json' } };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};

