"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

function VerifyEmailForm() {
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const verify = async (tokenToVerify: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToVerify }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Verification failed");
      setMessage("Email verified successfully! You can now sign in.");
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

  const submit = (e: FormEvent) => {
    e.preventDefault();
    verify(token);
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
        backgroundImage: 'radial-gradient(at 50% 0%, hsl(250, 60%, 96%) 0%, transparent 50%)'
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

              {!message ? (
                <>
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
                    <MarkEmailReadIcon fontSize="large" />
                  </Box>

                  <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    Verify Email
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Please enter the verification code sent to your email address.
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={submit}>
                    <TextField
                      fullWidth
                      label="Verification Code"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                      placeholder="e.g. paste-your-token-here"
                      autoFocus={!token}
                      sx={{ mb: 3 }}
                      InputProps={{
                        sx: { fontSize: '1.1rem', fontFamily: 'monospace' }
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading || !token}
                      sx={{ height: 48, fontSize: '1rem' }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Verify Email"}
                    </Button>
                  </Box>
                </>
              ) : (
                <Stack alignItems="center" spacing={3}>
                  <Box sx={{ color: 'success.main' }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 80 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
                      Verified!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {message}
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    href="/login"
                    variant="contained"
                    size="large"
                    fullWidth
                  >
                    Sign In Now
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Fade>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            <MuiLink component={Link} href="/login" underline="hover">
              Back to Login
            </MuiLink>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
