const PORT: number = parseInt(process.env.WS_PORT ?? '3001');

// channelId -> Set of connected WebSockets
const channels = new Map<string, Set<ServerWebSocket<WSData>>>();

interface WSData {
    connectionId: string;
    channelId: string;
}

const server = Bun.serve<WSData>({
    port: PORT,

    fetch(req, server) {
        const url = new URL(req.url);

        // Handle CORS preflight
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        };

        if (req.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        if (url.pathname === '/ws') {
            const channelId = url.searchParams.get('channelId') ?? 'default';
            const upgraded = server.upgrade(req, {
                data: { connectionId: crypto.randomUUID(), channelId },
                headers: corsHeaders,   // ← pass headers on upgrade
            });
            if (upgraded) return undefined;
            return new Response('WebSocket upgrade failed', { status: 400 });
        }

        if (url.pathname === '/broadcast' && req.method === 'POST') {
            const authHeader = req.headers.get('x-internal-secret');
            if (authHeader !== (process.env.INTERNAL_SECRET ?? 'dev-secret')) {
                return new Response('Forbidden', { status: 403, headers: corsHeaders });
            }

            return req.json().then((body: { channelId: string; payload: object }) => {
                broadcast(body.channelId, body.payload);
                console.log('[broadcast]', body.channelId, body.payload);
                return new Response('ok', { headers: corsHeaders });
            });
        }

        return new Response('Not found', { status: 404 });
    },

    websocket: {
        open(ws) {
            const { channelId, connectionId } = ws.data;
            if (!channels.has(channelId)) channels.set(channelId, new Set());
            channels.get(channelId)!.add(ws);
            console.log(`[WS] Client connected: ${connectionId} -> channel: ${channelId}`);
        },

        message(ws, raw) {
            // Clients don't send messages here — SvelteKit handles that via HTTP.
            // But you could forward pings, typing indicators, etc. here if needed.
        },

        close(ws) {
            const { channelId, connectionId } = ws.data;
            channels.get(channelId)?.delete(ws);
            if (channels.get(channelId)?.size === 0) channels.delete(channelId);
            console.log(`[WS] Client disconnected: ${connectionId}`);
        },
    },
});

function broadcast(channelId: string, payload: object) {
    const clients = channels.get(channelId);
    if (!clients) return;
    const msg = JSON.stringify(payload);
    for (const client of clients) {
        client.send(msg);
    }
}

console.log(`[WS Server] Listening on port ${PORT}`);