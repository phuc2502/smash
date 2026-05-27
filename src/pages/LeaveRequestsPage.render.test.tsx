import { describe, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Mock localStorage and window globally for Node
const store: Record<string, string> = {};
global.window = {
  localStorage: {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k in store) delete store[k];
    },
    length: 0,
    key: (index: number) => null,
  },
  addEventListener: () => {},
  removeEventListener: () => {},
} as any;

global.document = {
  addEventListener: () => {},
  removeEventListener: () => {},
} as any;

import { AppProvider } from '../context/AppContext';
import LeaveRequestsPage from './LeaveRequestsPage';
import LateRequestsPage from './LateRequestsPage';

describe('Render test', () => {
  it('renders LeaveRequestsPage and LateRequestsPage for Admin role without crashing', () => {
    // Mock local storage for Admin
    global.window.localStorage.setItem('smash.auth', 'true');
    global.window.localStorage.setItem('smash.account', JSON.stringify({
      id: 'ADM-001',
      name: 'Trần Văn A',
      role: 'Admin',
      roleTitle: 'Admin',
      email: 'admin@smashmath.edu.vn',
      phone: '0988 123 456',
      avatarUrl: 'https://picsum.photos/seed/admin/300/300',
    }));

    try {
      const htmlLeave = renderToString(
        <AppProvider>
          <LeaveRequestsPage />
        </AppProvider>
      );
      console.log('ADMIN LEAVE RENDER SUCCESSFUL! HTML LENGTH:', htmlLeave.length);

      const htmlLate = renderToString(
        <AppProvider>
          <LateRequestsPage />
        </AppProvider>
      );
      console.log('ADMIN LATE RENDER SUCCESSFUL! HTML LENGTH:', htmlLate.length);
    } catch (err) {
      console.error('ADMIN RENDER ERROR FOUND:', err);
      throw err;
    }
  });

  it('renders LeaveRequestsPage and LateRequestsPage for Teacher role without crashing', () => {
    // Mock local storage for Teacher
    global.window.localStorage.setItem('smash.auth', 'true');
    global.window.localStorage.setItem('smash.account', JSON.stringify({
      id: 'TCH-109',
      name: 'Trần Văn Cường',
      role: 'Giáo viên',
      roleTitle: 'Giáo viên',
      email: 'teacher@smashmath.edu.vn',
      phone: '0988 123 456',
      avatarUrl: 'https://picsum.photos/seed/teacher/300/300',
    }));

    try {
      const htmlLeave = renderToString(
        <AppProvider>
          <LeaveRequestsPage />
        </AppProvider>
      );
      console.log('TEACHER LEAVE RENDER SUCCESSFUL! HTML LENGTH:', htmlLeave.length);

      const htmlLate = renderToString(
        <AppProvider>
          <LateRequestsPage />
        </AppProvider>
      );
      console.log('TEACHER LATE RENDER SUCCESSFUL! HTML LENGTH:', htmlLate.length);
    } catch (err) {
      console.error('TEACHER RENDER ERROR FOUND:', err);
      throw err;
    }
  });
});
