import type { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Message = {
  id: string;
  text: string;
  timestamp: Timestamp;
  senderId: string;
  isRead: boolean;
};

export type Chat = {
  id:string;
  participants: User[];
  participantIds: string[];
  lastMessage?: Message | null;
  createdAt?: Timestamp;
};
