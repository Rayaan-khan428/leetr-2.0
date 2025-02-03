// Store active connections
export const clients = new Set<{
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