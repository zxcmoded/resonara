import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface PushPayload {
  expoPushToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: PushPayload = await req.json();

    if (!payload.expoPushToken || !payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'expoPushToken, title, and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: payload.expoPushToken,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        sound: 'default',
      }),
    });

    const result = await expoResponse.json();

    return new Response(JSON.stringify(result), {
      status: expoResponse.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
