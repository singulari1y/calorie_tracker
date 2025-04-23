import React from 'react';
import { Container, Box } from '@mui/material';
import ChatBot from '../components/ChatBot';

const ChatPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ height: 'calc(100vh - 200px)' }}>
        <ChatBot />
      </Box>
    </Container>
  );
};

export default ChatPage; 