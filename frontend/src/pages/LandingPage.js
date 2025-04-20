import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
} from '@mui/material';

import food1 from '../assets/food1.jpg';
import food2 from '../assets/food2.jpg';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <Box sx={{ bgcolor: 'black', color: 'white', minHeight: '100vh', py: 4 }}>
      {/* Top Header */}
      {/* <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          bgcolor: '#ef2020',
          px: 4,
          py: 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Calorie Tracker
        </Typography>
        <Button sx={{ color: 'white', fontWeight: 'bold' }} onClick={handleLogin}>
          LOG IN
        </Button>
      </Box> */}

      {/* Hero Section */}
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center" sx={{ mt: 6 }} justifyContent={"space-between"} px={10}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="gray">
              Your first step towards healthier and cleaner eating.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                sx={{ bgcolor: '#ef2020', color: 'white', fontWeight: 'bold' }}
                onClick={handleLogin}
              >
                JOIN NOW
              </Button>
              <Button
                variant="outlined"
                sx={{ borderColor: 'white', color: 'white', fontWeight: 'bold' }}
                onClick={handleLogin}
              >
                LOG IN
              </Button>
            </Box>
            {/* Dots like carousel */}
            {/* <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'white' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'gray' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'gray' }} />
            </Box> */}
          </Grid>

          <Grid item xs={12} md={6}>
            <img
              src={food1}
              alt="Healthy food"
              style={{ width: '100%', borderRadius: 8 }}
            />
          </Grid>
        </Grid>

        {/* Second Section */}
        <Grid container spacing={4} sx={{ mt: 8 }} alignItems="center" justifyContent={"space-between"} px={10}>
          <Grid item xs={12} md={6} maxWidth={"50%"}>
            <Typography variant="h5" fontWeight="bold">
              Fitness starts with what you eat
            </Typography>
            <Typography variant="body1" color="gray" sx={{ mt: 2 }}>
              Take control over what you consume. Set goals, track calories and log activities
              with this calorie tracker.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <img
              src={food2} // Replace with local
              alt="Eat good feel good"
              style={{
                width: '70%',
                borderRadius: '0 0 0 0',
                display: 'block',
                marginLeft: 'auto',
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
