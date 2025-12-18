"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, TextField, Typography, MenuItem, CircularProgress, Paper, Grid } from "@mui/material";

interface User {
    id: string;
    email: string;
    display_name: string;
    status: string;
    roles: string[];
}

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [displayName, setDisplayName] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/admin/users/${params.id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error?.message || "Failed to load user");

                setUser(data.user);
                setDisplayName(data.user.display_name || "");
                setStatus(data.user.status || "PENDING");
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Unknown error");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [params.id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ displayName, status }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || "Failed to update user");

            router.push("/admin/users");
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert("Unknown error");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!user) return <Typography>User not found</Typography>;

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Manage User</Typography>

            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Grid container spacing={3}>
                    {/* @ts-expect-error Grid types mismatch */}
                    <Grid xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="User ID"
                            value={user.id}
                            disabled
                            variant="filled"
                        />
                    </Grid>
                    {/* @ts-expect-error Grid types mismatch */}
                    <Grid xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            value={user.email}
                            disabled
                            variant="filled"
                        />
                    </Grid>
                    {/* @ts-expect-error Grid types mismatch */}
                    <Grid xs={12}>
                        <TextField
                            fullWidth
                            label="Display Name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </Grid>
                    {/* @ts-expect-error Grid types mismatch */}
                    <Grid xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            {["ACTIVE", "PENDING", "DISABLED", "DELETED"].map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                    {opt}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* @ts-expect-error Grid types mismatch */}
                    <Grid xs={12} sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button variant="outlined" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving}
                            sx={{ minWidth: 100 }}
                        >
                            {saving ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
