import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from '../utils/axios';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const weekStart = format(startOfWeek(today), 'yyyy-MM-dd');
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      if (activeTab === 0) {
        const response = await axios.get(`http://localhost:5000/api/reports/daily/${todayStr}`);
        setDailyData(response.data);
      } else if (activeTab === 1) {
        const response = await axios.get(`http://localhost:5000/api/reports/weekly/${weekStart}`);
        setWeeklyData(response.data);
      } else {
        const response = await axios.get(`http://localhost:5000/api/reports/monthly/${year}/${month}`);
        setMonthlyData(response.data);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const renderDailyReport = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Daily Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography color="text.secondary">Calories</Typography>
              <Typography variant="h4">{dailyData?.totalCalories || 0}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color="text.secondary">Protein</Typography>
              <Typography variant="h4">{dailyData?.totalProtein || 0}g</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color="text.secondary">Carbs</Typography>
              <Typography variant="h4">{dailyData?.totalCarbohydrates || 0}g</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color="text.secondary">Fat</Typography>
              <Typography variant="h4">{dailyData?.totalFat || 0}g</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Meal Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(dailyData?.meals || {}).map(([meal, foods]) => ({
              meal,
              calories: foods.reduce((sum, food) => sum + food.calories, 0)
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="meal" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="calories" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderWeeklyReport = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Weekly Summary
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={Object.entries(weeklyData || {}).map(([date, data]) => ({
          date: format(new Date(date), 'EEE'),
          calories: data.totalCalories,
          protein: data.totalProtein,
          carbs: data.totalCarbohydrates,
          fat: data.totalFat
        }))}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="calories" fill="#8884d8" />
          <Bar dataKey="protein" fill="#82ca9d" />
          <Bar dataKey="carbs" fill="#ffc658" />
          <Bar dataKey="fat" fill="#ff8042" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );

  const renderMonthlyReport = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Monthly Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Typography color="text.secondary">Total Calories</Typography>
          <Typography variant="h4">{monthlyData?.totalCalories || 0}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography color="text.secondary">Average Daily Calories</Typography>
          <Typography variant="h4">{Math.round(monthlyData?.averageDailyCalories || 0)}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography color="text.secondary">Total Protein</Typography>
          <Typography variant="h4">{monthlyData?.totalProtein || 0}g</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography color="text.secondary">Total Carbs</Typography>
          <Typography variant="h4">{monthlyData?.totalCarbohydrates || 0}g</Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Daily" />
          <Tab label="Weekly" />
          <Tab label="Monthly" />
        </Tabs>
      </Paper>

      {activeTab === 0 && renderDailyReport()}
      {activeTab === 1 && renderWeeklyReport()}
      {activeTab === 2 && renderMonthlyReport()}
    </Container>
  );
};

export default Reports; 