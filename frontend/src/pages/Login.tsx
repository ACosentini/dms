import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LoginRequest } from "../types";
import { Login as LoginIcon } from "@mui/icons-material";
import StorageService from "../services/storage.service";

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const { authState, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (StorageService.hasValidSession()) {
      navigate("/");
    }
  }, [navigate]);

  const validateForm = (): boolean => {
    const errors: {
      username?: string;
      password?: string;
    } = {};
    let isValid = true;

    if (!formData.username.trim()) {
      errors.username = "Username is required";
      isValid = false;
    }

    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      if (authState.isAuthenticated) {
        navigate("/");
      }
    } catch (error) {
      // Error handling is managed by AuthContext
      console.error("Login failed:", error);
    }
  };

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      navigate("/");
    }
  }, [authState.isAuthenticated, authState.user, navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <LoginIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />

          <Typography component="h1" variant="h5" gutterBottom>
            Sign In
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to access your documents
          </Typography>

          {location.state?.message && (
            <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
              {location.state.message}
            </Alert>
          )}

          {authState.error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {authState.error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled={authState.loading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={authState.loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={authState.loading}
            >
              {authState.loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>

            <Grid container justifyContent="center">
              <Grid>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
