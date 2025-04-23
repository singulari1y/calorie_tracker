import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to the chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await axios.post('/api/chat', { message: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await axios.post('/api/chat/clear');
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.paper',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="h6">Nutrition Assistant</Typography>
        <IconButton onClick={handleClear} size="small">
          <ClearIcon />
        </IconButton>
      </Paper>
      
      <Divider />
      
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        <List>
          {messages.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2
                }}
              >
                <ListItemText
                  primary={message.content}
                  sx={{ m: 0 }}
                />
              </Paper>
            </ListItem>
          ))}
          {loading && (
            <ListItem sx={{ justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Divider />
      
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask about your nutrition..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatBot; 