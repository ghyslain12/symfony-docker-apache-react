import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomMatButton from '../../src/components/CustomMatButton';

describe('CustomMatButton', () => {
    it('renders with provided children', () => {
        render(<CustomMatButton>Click Me</CustomMatButton>);
        expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument();
    });

    it('applies custom styles', () => {
        render(<CustomMatButton>Styled Button</CustomMatButton>);
        const button = screen.getByRole('button', { name: /Styled Button/i });
        expect(button).toHaveStyle({
            backgroundColor: '#3f51b5',
            color: 'rgb(255, 255, 255)',
            textTransform: 'none',
        });
    });

    it('handles onClick event', () => {
        const handleClick = vi.fn();
        render(<CustomMatButton onClick={handleClick}>Click Me</CustomMatButton>);
        const button = screen.getByRole('button', { name: /Click Me/i });
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('respects disabled prop', () => {
        const handleClick = vi.fn();
        render(
            <CustomMatButton disabled onClick={handleClick}>
                Disabled Button
            </CustomMatButton>
        );
        const button = screen.getByRole('button', { name: /Disabled Button/i });
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });
});