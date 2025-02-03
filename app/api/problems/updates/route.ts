import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { verifyAuthToken } from '@/middleware/auth'
import { prisma } from '@/prisma/client'


// Store active connections
const clients = new Set<{
  userId: string;
  send: (data: string) => void;
}>();

// Function to notify all clients of an update
export function notifyClients(userId: string) {
  clients.forEach(client => {
    if (client.userId === userId) {
      client.send('update');
    }
  });
}

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    const decodedToken = await verifyAuthToken(token);
    const user = await prisma.users.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Set up SSE headers
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    // Add this client to our Set
    const client = {
      userId: user.id,
      send: (data: string) => {
        writer.write(encoder.encode(`data: ${data}\n\n`));
      }
    };
    clients.add(client);

    // Send initial connection message
    client.send('connected');

    // Remove client when connection closes
    req.signal.addEventListener('abort', () => {
      clients.delete(client);
    });

    return new Response(responseStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SSE error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 