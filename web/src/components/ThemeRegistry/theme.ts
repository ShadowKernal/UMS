import { createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

const inter = Inter({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#4F46E5', // Indigo 600
            light: '#6366F1',
            dark: '#4338CA',
        },
        secondary: {
            main: '#EC4899', // Pink 500
        },
        background: {
            default: '#F9FAFB',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#111827',
            secondary: '#6B7280',
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: inter.style.fontFamily,
        h1: { fontSize: '2.5rem', fontWeight: 700 },
        h2: { fontSize: '2rem', fontWeight: 700 },
        h3: { fontSize: '1.75rem', fontWeight: 600 },
        h4: { fontSize: '1.5rem', fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    '&:hover': {
                        backgroundColor: '#4338CA',
                    },
                },
                outlined: {
                    borderWidth: '1.5px',
                    '&:hover': {
                        borderWidth: '1.5px',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    border: '1px solid #E5E7EB',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        '& fieldset': {
                            borderColor: '#E5E7EB',
                        },
                        '&:hover fieldset': {
                            borderColor: '#9CA3AF',
                        },
                    },
                },
            },
        },
    },
});

export default theme;
