import { Socket } from 'socket.io-client';

export function once<T>(socket: Socket, event: string, timeout = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const onData = (data: T) => {
      cleanup();
      resolve(data);
    };
    const onError = (err: any) => {
      cleanup();
      reject(err);
    };
    const onDisconnect = (reason: string) => {
      cleanup();
      reject(new Error(`Socket disconnected: ${reason}`));
    };
    const cleanup = () => {
      socket.off(event, onData);
      socket.off('connect_error', onError);
      socket.off('disconnect', onDisconnect);
    };
    socket.once(event, onData);
    socket.once('connect_error', onError);
    socket.once('disconnect', onDisconnect);
    // timeout fallback
    setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout waiting for ${event}`));
    }, timeout);
  });
}
