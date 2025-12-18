"use client";

import { FormEvent, useState } from "react";
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
  Link as MuiLink,
  Stack,
  Fade,
} from "@mui/material";
import Link from "next/link";
import KeyIcon from '@mui/icons-material/Key';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error?.message || "Unable to send reset email");
      }
      setMessage("Reset link sent! Please check your email (and dev outbox).");
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
        backgroundImage: 'radial-gradient(at 50% 0%, hsl(210, 80%, 96%) 0%, transparent 50%)'

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
                <KeyIcon fontSize="large" />
              </Box>

              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Forgot password?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                No worries, we&apos;ll send you reset instructions.
              </Typography>

              {message ? (
                <Stack alignItems="center" spacing={3}>
                  <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MailOutlineIcon />
                    <Typography variant="body1" fontWeight={500}>{message}</Typography>
                  </Box>
                  <Button
                    component={Link}
                    href="/login"
                    variant="contained"
                    size="large"
                    fullWidth
                  >
                    Back to Login
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
                    label="Email Address"
                    type="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoFocus
                    placeholder="Enter your email"
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
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
                  </Button>

                  <MuiLink
                    component={Link}
                    href="/login"
                    color="text.secondary"
                    underline="hover"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <ArrowBackIcon fontSize="small" /> Back to top
                  </MuiLink>
                </Box>
              )}

            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}
