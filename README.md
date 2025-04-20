# Calorie Tracker

A web application for tracking daily calorie intake and nutrition. Built with React.js and Node.js.

## Features

- Google OAuth authentication
- User profile management
- Food tracking with detailed nutritional information
- Daily, weekly, and monthly reports
- Visual data representation with charts
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google OAuth credentials

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/calorie_tracker
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CALLBACK_URL=http://localhost:5000/auth/google/callback
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - http://localhost:5000/auth/google/callback
6. Copy the Client ID and Client Secret to your backend `.env` file

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Login with Google" to authenticate
3. Complete your profile information
4. Start tracking your meals and nutrition

## Project Structure

```
calorie_tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── App.js
    └── package.json
```

## Technologies Used

- Frontend:
  - React.js
  - Material-UI
  - Recharts
  - Axios
  - React Router

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - Passport.js
  - Google OAuth

## License

MIT 