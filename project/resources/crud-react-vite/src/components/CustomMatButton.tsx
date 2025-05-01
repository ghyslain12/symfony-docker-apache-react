import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';

interface CustomButtonProps extends ButtonProps {
    children: React.ReactNode;
}

const CustomMatButton: React.FC<CustomButtonProps> = ({ children, ...props }) => {
    return (
        <Button
            sx={{
                backgroundColor: '#3f51b5',
                color: 'white',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#4758b8' },
            }}
            {...props}
        >
            {children}
        </Button>
    );
};

export default CustomMatButton;