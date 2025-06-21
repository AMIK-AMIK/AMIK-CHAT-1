// This file is no longer in use and has been replaced by live data fetching from Firebase.
// You can populate your Firestore database with sample data.
//
// Example Firestore Structure:
//
// /users/{userId}
//   - name: "Alice"
//   - avatarUrl: "https://placehold.co/100x100"
//
// /chats/{chatId}
//   - participantIds: ["user-1", "user-2"]
//
// /chats/{chatId}/messages/{messageId}
//   - text: "Hello there!"
//   - senderId: "user-1"
//   - timestamp: serverTimestamp()
//
// The current logged in user is hardcoded as 'user-1' for now.
export const currentUserId = 'user-1';
