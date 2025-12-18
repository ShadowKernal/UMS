"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Fade,
  Stack,
  Link as MuiLink,
} from "@mui/material";
import Link from "next/link";
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = params.get("token");
    if (t) setToken(t);
  }, [params]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Reset failed");
      setMessage("Password successfully reset! Redirecting to login...");

      // Optional: Auto redirect
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
        backgroundImage: 'radial-gradient(at 50% 0%, hsl(280, 60%, 96%) 0%, transparent 50%)'
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={500}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>

              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <LockResetIcon fontSize="large" />
              </Box>

              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Set new password
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Your new password must be at least 8 characters.
              </Typography>

              {message ? (
                <Stack alignItems="center" spacing={3}>
                  <Box sx={{ color: 'success.main' }}>
                    <CheckCircleIcon sx={{ fontSize: 64 }} />
                  </Box>
                  <Typography variant="h6" color="success.main">
                    {message}
                  </Typography>
                  <Button component={Link} href="/login" variant="contained">
                    Sign In Now
                  </Button>
                </Stack>
              ) : (
                <Box component="form" onSubmit={submit}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Reset Token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    sx={{ mb: 3 }}
                    placeholder="Paste code from email"
                  />

                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    inputProps={{ minLength: 8 }}
                    autoComplete="new-password"
                    sx={{ mb: 3 }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ height: 48, fontSize: '1rem', mb: 3 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      <MuiLink component={Link} href="/login" underline="hover">
                        Back to Login
                      </MuiLink>
                    </Typography>
                  </Box>
                </Box>
              )}

            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
