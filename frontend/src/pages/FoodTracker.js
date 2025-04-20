import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from '../utils/axios';
import { format } from 'date-fns';

const FoodTracker = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    name: '',
    mealType: 'breakfast',
    quantity: 100,
    notes: '',
    date: new Date()
  });

  useEffect(() => {
    fetchFoods();
  }, [selectedDate]);

  const fetchFoods = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await axios.get(`/api/food/date/${dateStr}`);
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event, value) => {
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(`/api/food/search?query=${value}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching foods:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/food', {
        ...formData,
        date: selectedDate
      });
      fetchFoods();
      setFormData({
        name: '',
        mealType: 'breakfast',
        quantity: 100,
        notes: '',
        date: selectedDate
      });
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/food/${id}`);
      fetchFoods();
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add Food Entry
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date"
                      value={selectedDate}
                      onChange={(newDate) => {
                        setSelectedDate(newDate);
                        setFormData({
                          ...formData,
                          date: newDate
                        });
                      }}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    freeSolo
                    options={searchResults}
                    getOptionLabel={(option) => option.name}
                    loading={searchLoading}
                    onInputChange={handleSearch}
                    onChange={(event, newValue) => {
                      setFormData({
                        ...formData,
                        name: newValue ? newValue.name : '',
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Food Name"
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Meal Type"
                    name="mealType"
                    value={formData.mealType}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="breakfast">Breakfast</MenuItem>
                    <MenuItem value="lunch">Lunch</MenuItem>
                    <MenuItem value="dinner">Dinner</MenuItem>
                    <MenuItem value="snack">Snack</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Quantity (g)"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    multiline
                    rows={2}
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" fullWidth>
                    Add Food
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Food Entries for {format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Meal</TableCell>
                    <TableCell>Food</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Calories</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {foods.map((food) => (
                    <TableRow key={food._id}>
                      <TableCell>{food.mealType}</TableCell>
                      <TableCell>{food.name}</TableCell>
                      <TableCell>{food.quantity}g</TableCell>
                      <TableCell>{food.calories}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDelete(food._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FoodTracker; 