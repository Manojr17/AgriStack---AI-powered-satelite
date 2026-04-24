import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#fff',
    },
    secondary: {
      main: '#F9A825',
      light: '#FDD835',
      dark: '#F57F17',
      contrastText: '#000',
    },
    background: {
      default: '#0A1628',
      paper: '#0D1F35',
    },
    success: {
      main: '#4CAF50',
      dark: '#2E7D32',
    },
    warning: {
      main: '#F9A825',
    },
    error: {
      main: '#EF4444',
    },
    info: {
      main: '#29B6F6',
    },
    text: {
      primary: '#E8F5E9',
      secondary: '#A5D6A7',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          border: '1px solid rgba(46, 125, 50, 0.15)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
            boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
            },
          },
        },
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            background: 'linear-gradient(135deg, #F9A825 0%, #F57F17 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FDD835 0%, #F9A825 100%)',
            },
          },
        },
      ],
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);
export default theme;
