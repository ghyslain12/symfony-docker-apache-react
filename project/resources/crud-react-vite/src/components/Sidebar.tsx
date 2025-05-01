import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material';
import CustomMatButton from './CustomMatButton.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface MenuItem {
    label: string;
    route?: string;
    submenu: { label: string; route: string }[];
    isOpen?: boolean;
}

interface SidebarProps {
    jwtEnabled: boolean;
    invalidate: () => void;
}

const SidebarContainer = styled('aside')(({ theme }) => ({
    width: '250px',
    height: '100vh',
    background: '#333333',
    color: 'white',
    position: 'fixed',
    left: 0,
    top: 0,
    paddingTop: '4em',
    [theme.breakpoints.down('md')]: {
        position: 'relative',
        width: '100%',
        height: 'auto',
        paddingTop: theme.spacing(2),
    },
}));

const MenuList = styled('ul')({
    padding: 0,
    margin: 0,
    listStyle: 'none',
});

const MenuItemStyled = styled('li')({
    position: 'relative',
    '& > a': {
        padding: '12px 20px',
        paddingLeft: '40px',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        textDecoration: 'none',
        transition: 'background 0.3s',
        width: '100%',
        boxSizing: 'border-box',
    },
    '& > a:hover': {
        background: '#555',
    },
    '& > div': {
        padding: '12px 20px',
        paddingLeft: '40px',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        cursor: 'pointer',
        width: '100%',
        boxSizing: 'border-box',
    },
    '& > div:hover': {
        background: '#555',
    },
});

const SubmenuList = styled('ul')({
    padding: 0,
    margin: 0,
    listStyle: 'none',
    background: '#444',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&.open': {
        maxHeight: '500px',
        opacity: 1,
    },
    '&.closed': {
        maxHeight: 0,
        opacity: 0,
    },
    '& li': {
        padding: 0,
    },
    '& li a': {
        padding: '10px 20px',
        paddingLeft: '40px',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        textDecoration: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    '& li a:hover': {
        background: '#666',
    },
});

export default function Sidebar({ jwtEnabled, invalidate }: SidebarProps) {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([
        { label: 'Home', route: '/home', submenu: [] },
        { label: 'Provisioning', submenu: [{ label: 'sale', route: '/sale' }], isOpen: true },
        { label: 'Ticketing', submenu: [{ label: 'ticket', route: '/ticket' }], isOpen: true },
        { label: 'Users', submenu: [{ label: 'user', route: '/user' }, { label: 'client', route: '/client' }], isOpen: true },
        { label: 'Materials', submenu: [{ label: 'material', route: '/material' }], isOpen: true },
    ]);

    const toggleSubmenu = (index: number) => {
        setMenuItems((prevItems) =>
            prevItems.map((item, i) =>
                i === index ? { ...item, isOpen: !item.isOpen } : item
            )
        );
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <SidebarContainer>
            <MenuList>
                {isAuthenticated && (
                    <li>
                        <CustomMatButton
                            variant="contained"
                            color="primary"
                            onClick={handleLogout}
                            sx={{
                                margin: '1rem auto',
                                display: 'block',
                                textTransform: 'none',
                                backgroundColor: '#3f51b5',
                                color: 'white',
                                '&:hover': { backgroundColor: '#4758b8' },
                            }}
                        >
                            Déconnexion
                        </CustomMatButton>
                    </li>
                )}
                {menuItems.map((item, index) => (
                    <MenuItemStyled key={item.label}>
                        {item.route ? (
                            <Link to={item.route}>{item.label}</Link>
                        ) : (
                            <>
                                <div onClick={() => toggleSubmenu(index)}>{item.label}</div>
                                <SubmenuList className={item.isOpen ? 'open' : 'closed'}>
                                    {item.submenu.map((subitem) => (
                                        <li key={subitem.label}>
                                            <Link to={subitem.route}>{subitem.label.toLowerCase()}</Link>
                                        </li>
                                    ))}
                                </SubmenuList>
                            </>
                        )}
                    </MenuItemStyled>
                ))}
            </MenuList>
        </SidebarContainer>
    );
}