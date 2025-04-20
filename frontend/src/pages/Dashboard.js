import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Restaurant as RestaurantIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';
import food3 from '../assets/food3.avif';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dailySummary, setDailySummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailySummary = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get(`/api/reports/daily/${today}`);
        setDailySummary(response.data);
      } catch (error) {
        console.error('Error fetching daily summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailySummary();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3} direction="column" alignItems="center" width="100%">
        {/* Quick Actions */}
        {/* <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/tracker')}
              >
                Add Meal
              </Button>
              <Button
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                onClick={() => navigate('/reports')}
              >
                View Reports
              </Button>
            </Box>
          </Paper>
        </Grid> */}

        <Grid item xs={12} md={6} width="100%" alignItems="center" display={'flex'} justifyContent={'center'}>
          <img src={food3} alt="food" style={{ width: '40%', borderRadius: 8 }} />
        </Grid>

        {/* Daily Summary */}
        <Grid item xs={12} md={6} width="100%">
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Today's Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="text.secondary">Calories</Typography>
                <Typography variant="h4">
                  {dailySummary?.totalCalories || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary">Protein</Typography>
                <Typography variant="h4">
                  {dailySummary?.totalProtein || 0}g
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary">Carbs</Typography>
                <Typography variant="h4">
                  {dailySummary?.totalCarbohydrates || 0}g
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary">Fat</Typography>
                <Typography variant="h4">
                  {dailySummary?.totalFat || 0}g
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Meals */}
        <Grid item xs={12} md={6} width="100%">
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Recent Meals
            </Typography>
            {dailySummary?.meals ? (
              Object.entries(dailySummary.meals).map(([mealType, foods]) => (
                <Box key={mealType} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                    {mealType}
                  </Typography>
                  {foods.map((food) => (
                    <Box key={food._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>{food.name}</Typography>
                      <Typography>{food.calories} cal</Typography>
                    </Box>
                  ))}
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">No meals logged today</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 