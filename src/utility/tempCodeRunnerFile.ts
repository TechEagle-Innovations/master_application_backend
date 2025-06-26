// test-postflight.ts
import { io } from 'socket.io-client';
import * as jwt from 'jsonwebtoken';

////////////////////////////////////////////////////////////////////////////////
// CONFIG
////////////////////////////////////////////////////////////////////////////////
const USER_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFua2l0Lm1pc2hyYUB0ZWNoZWFnbGUuaW4iLCJpYXQiOjE3NTA4NzEyNDQsImV4cCI6MTc1MDg4MjA0NH0.mXqQrDFQCvztP21oUyQOs_ko-2qjfxbuuyd_gNrvzAM';
const CLIENT_URL = 'https://training.ws5002.techeagle.org';
////////////////////////////////////////////////////////////////////////////////

async function testPostflight() {
  const socket = io(CLIENT_URL, {
    auth: { token: USER_JWT, page: 'monitor-all-drones' },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('✅ Connected to GCS as client:', socket.id);

    // 1) Fetch post-flight checklist
    socket.emit('client:getPostFlightChecklistItems', {}, () => {
      console.log('📥 Requested post-flight checklist');
    });
  });

  socket.on('server:setPostFlightChecklistItems', (items: any[]) => {
    console.log('📋 Received checklist:', items);

    // 2) prepare updates with confirm=true
    const updates: Record<number, any> = {};
    items.forEach((item, idx) => {
      updates[idx] = { ...item, confirm: true };
    });

    // 3) send updates & mark done
    socket.emit('client:updatePostFlightChecklistItems', updates, () => {
      console.log('📤 Sent updated checklist');
      socket.emit('client:updatePostFlightChecklistDone', {}, () => {
        console.log('✅ Post-flight checklist marked done');
        socket.disconnect();
      });
    });
  });

  socket.on('server:gcs_log', (msg: string) => {
    console.log('📝 GCS Log:', msg);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
  });
}

testPostflight();
