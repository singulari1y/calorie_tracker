import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Restaurant as RestaurantIcon,
  Assessment as AssessmentIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { user, logout } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <AppBar position="static" sx={{ bgcolor: 'black', boxShadow: 'none' }}>
      <Toolbar sx={{ px: 4, py: 2, backgroundColor: "#ef2020" }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 'bold', color: 'white' }}
        >
          Calorie Tracker
        </Typography>

        {user ? (
          <>
            <Button
              component={RouterLink}
              to="/dashboard"
              // startIcon={<DashboardIcon />}
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              Dashboard
            </Button>
            <Button
              component={RouterLink}
              to="/tracker"
              // startIcon={<RestaurantIcon />}
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              Food Tracker
            </Button>
            <Button
              component={RouterLink}
              to="/reports"
              // startIcon={<AssessmentIcon />}
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              Reports
            </Button>
            <Button
              component={RouterLink}
              to="/chat"
              startIcon={<ChatIcon />}
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              Chat
            </Button>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32 }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            component={RouterLink}
            sx={{
              color: 'white',
              border: '1px solid white',
              fontWeight: 'bold',
              textTransform: 'none',
            }}
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
