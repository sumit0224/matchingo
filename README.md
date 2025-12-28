# Matchingo

## Project Structure

- **client/**: React Native app (Expo)
  - **src/**: Source code
    - **features/**: Feature-based modules (Auth, Profile, Swipe, etc.)
    - **store/**: State management (Zustand)
    - **services/**: API and Socket services
    - **navigation/**: App navigation
- **server/**: Node.js Express server + Socket.io

## getting Started

### Client
```bash
cd client
npx expo start
```

### Server
```bash
cd server
node index.js
```
