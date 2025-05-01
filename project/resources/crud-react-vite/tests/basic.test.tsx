import { describe, it, expect } from 'vitest';

describe('Basic Vitest Setup', () => {
    it('should pass a simple test', () => {
        const result = 1 + 1;
        expect(result).toBe(2);
    });

    it('should render a simple string', () => {
        const text = 'Vitest is working!';
        expect(text).toBe('Vitest is working!');
    });
});