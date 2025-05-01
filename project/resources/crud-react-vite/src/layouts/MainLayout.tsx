import { Box, AppBar, Toolbar, Typography, styled } from '@mui/material';
import Sidebar from '../components/Sidebar.tsx';

const Container = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: `
    "header header"
    "sidebar main"
    "footer footer"
  `,
    gridTemplateColumns: '250px 1fr',
    gridTemplateRows: 'auto 1fr auto',
    minHeight: '100vh',
    [theme.breakpoints.down('md')]: {
        gridTemplateAreas: `
      "header"
      "main"
      "sidebar"
      "footer"
    `,
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto 1fr auto auto',
    },
}));

const Header = styled(AppBar)(({ theme }) => ({
    gridArea: 'header',
    backgroundColor: '#333',
    color: 'white',
    padding: theme.spacing(1),
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'none',
}));

const Main = styled(Box)(({ theme }) => ({
    gridArea: 'main',
    padding: theme.spacing(3),
    backgroundColor: '#fff',
    borderLeft: '1px solid #ddd',
    [theme.breakpoints.down('md')]: {
        borderLeft: 'none',
        borderTop: '1px solid #ddd',
    },
}));

const Footer = styled(Box)(({ theme }) => ({
    gridArea: 'footer',
    backgroundColor: '#333',
    color: 'white',
    padding: theme.spacing(1),
    textAlign: 'center',
}));

export const SpinnerContainer = styled(Box)({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 5000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100px',
    minHeight: '100px',
});

interface MainLayoutProps {
    children: React.ReactNode;
    jwtEnabled: boolean;
    invalidate: () => void;
}

export default function MainLayout({ children, jwtEnabled, invalidate }: MainLayoutProps) {
    return (
        <Container>
            <Header>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        LOGO
                    </Typography>
                </Toolbar>
            </Header>
            <Box sx={{ gridArea: 'sidebar' }}>
                <Sidebar jwtEnabled={jwtEnabled} invalidate={invalidate} />
            </Box>
            <Main>
                {children}
            </Main>
            <Footer>
                <Typography variant="body2">© 2025 - footer</Typography>
            </Footer>
        </Container>
    );
}