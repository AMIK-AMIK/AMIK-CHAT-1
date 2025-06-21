export type User = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Message = {
  id: string;
  text: string;
  timestamp: string;
  senderId: string;
  isRead: boolean;
};

export type Chat = {
  id: string;
  participants: User[];
  messages: Message[];
};
