import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MainLayout from '../../src/layouts/MainLayout';

vi.mock('../../src/components/Sidebar', () => ({
    default: () => <div>Mocked Sidebar</div>,
}));

describe('MainLayout', () => {
    it('renders header, sidebar, main content, and footer', () => {
        render(
            <MainLayout jwtEnabled={false} invalidate={vi.fn()}>
                <div>Main Content</div>
            </MainLayout>
        );

        expect(screen.getByText('LOGO')).toBeInTheDocument();
        expect(screen.getByText('Mocked Sidebar')).toBeInTheDocument();
        expect(screen.getByText('Main Content')).toBeInTheDocument();
        expect(screen.getByText('© 2025 - footer')).toBeInTheDocument();
    });

    it('applies correct grid layout', () => {
        render(
            <MainLayout jwtEnabled={false} invalidate={vi.fn()}>
                <div>Main Content</div>
            </MainLayout>
        );

        const container = screen.getByText('Main Content').parentElement?.parentElement;
        expect(container).toHaveStyle({ display: 'grid' });
    });
});