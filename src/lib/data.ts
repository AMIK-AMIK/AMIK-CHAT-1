import type { User, Chat } from './types';

export const currentUser: User = {
  id: 'user-1',
  name: 'You',
  avatarUrl: `https://placehold.co/100x100`,
};

export const contacts: User[] = [
  { id: 'user-2', name: 'Alice', avatarUrl: `https://placehold.co/100x100` },
  { id: 'user-3', name: 'Service Notifications', avatarUrl: `https://placehold.co/100x100` },
  { id: 'user-4', name: 'AMIK CHAT Team', avatarUrl: `https://placehold.co/100x100` },
  { id: 'user-5', name: 'Bob', avatarUrl: `https://placehold.co/100x100` },
  { id: 'user-6', name: 'Charlie', avatarUrl: `https://placehold.co/100x100` },
  { id: 'user-7', name: 'David', avatarUrl: `https://placehold.co/100x100` },
  { id: 'user-8', name: 'Customer Support', avatarUrl: `https://placehold.co/100x100` },
  { id: 'user-9', name: 'File Transfer', avatarUrl: `https://placehold.co/100x100` },
];

export const chats: Chat[] = [
  {
    id: 'chat-1',
    participants: [currentUser, contacts[0]],
    messages: [
      { id: 'msg-1-1', text: 'Hey, how are you?', timestamp: '7:02 PM', senderId: 'user-2', isRead: false },
    ],
  },
  {
    id: 'chat-2',
    participants: [currentUser, contacts[1]],
    messages: [
      { id: 'msg-2-1', text: 'Your package is arriving tomorrow.', timestamp: 'Thu', senderId: 'user-3', isRead: true },
    ],
  },
  {
    id: 'chat-3',
    participants: [currentUser, contacts[2]],
    messages: [
      { id: 'msg-3-1', text: 'Welcome to AMIK CHAT! Let us know if you need help.', timestamp: '6/12/25', senderId: 'user-4', isRead: true },
    ],
  },
  {
    id: 'chat-4',
    participants: [currentUser, contacts[3]],
    messages: [
      { id: 'msg-4-1', text: 'See you at the meeting.', timestamp: '6/11/25', senderId: 'user-5', isRead: true },
    ],
  },
  {
    id: 'chat-5',
    participants: [currentUser, contacts[4]],
    messages: [
      { id: 'msg-5-1', text: '[Sticker]', timestamp: '5/29/25', senderId: 'user-6', isRead: true },
    ],
  },
  {
    id: 'chat-6',
    participants: [currentUser, contacts[5]],
    messages: [
      { id: 'msg-6-1', text: "I've accepted your friend request. Now let's chat!", timestamp: '5/26/25', senderId: 'user-7', isRead: true },
    ],
  },
  {
    id: 'chat-7',
    participants: [currentUser, contacts[6]],
    messages: [
      { id: 'msg-7-1', text: 'Me: Sounds good, thanks!', timestamp: '5/23/25', senderId: 'user-1', isRead: true },
    ],
  },
  {
    id: 'chat-8',
    participants: [currentUser, contacts[7]],
    messages: [
      { id: 'msg-8-1', text: 'image.jpg', timestamp: '2/24/25', senderId: 'user-9', isRead: true },
    ],
  },
];
