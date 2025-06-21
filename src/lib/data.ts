import type { User, Chat } from './types';

export const currentUser: User = {
  id: 'user-1',
  name: 'You',
  avatarUrl: `https://placehold.co/100x100`,
};

export const contacts: User[] = [
  { id: 'user-2', name: 'Alice', avatarUrl: `https://placehold.co/100x100` },
  { id: 'user-3', name: 'Bob', avatarUrl: `https://placehold.co/100x100` },
  { id: 'user-4', name: 'Charlie', avatarUrl: `https://placehold.co/100x100` },
  { id: 'user-5', name: 'Diana', avatarUrl: `https://placehold.co/100x100` },
  { id: 'user-6', name: 'Ethan', avatarUrl: `https://placehold.co/100x100` },
];

export const chats: Chat[] = [
  {
    id: 'chat-1',
    participants: [currentUser, contacts[0]],
    messages: [
      { id: 'msg-1-1', text: 'Hey, how are you?', timestamp: '10:00 AM', senderId: 'user-2', isRead: false },
      { id: 'msg-1-2', text: 'I am good, thanks! How about you?', timestamp: '10:01 AM', senderId: 'user-1', isRead: true },
      { id: 'msg-1-3', text: 'Doing great. Just working on the new project.', timestamp: '10:02 AM', senderId: 'user-2', isRead: false },
    ],
  },
  {
    id: 'chat-2',
    participants: [currentUser, contacts[1]],
    messages: [
      { id: 'msg-2-1', text: 'Can you send me the report?', timestamp: 'Yesterday', senderId: 'user-3', isRead: true },
      { id: 'msg-2-2', text: 'Sure, I will send it in a bit.', timestamp: 'Yesterday', senderId: 'user-1', isRead: true },
    ],
  },
  {
    id: 'chat-3',
    participants: [currentUser, contacts[2]],
    messages: [
      { id: 'msg-3-1', text: 'Lunch today?', timestamp: 'Yesterday', senderId: 'user-4', isRead: false },
    ],
  },
];
