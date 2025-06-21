export type User = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Message = {
  id: string;
  text: string;
  timestamp: any; // Allow for Firebase ServerTimestamp
  senderId: string;
  isRead: boolean;
};

export type Chat = {
  id: string;
  participants: User[];
  participantIds: string[];
  lastMessage?: Message | null;
};
