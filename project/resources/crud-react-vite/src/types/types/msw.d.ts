export {};

declare global {
    interface Window {
        __MSW__?: {
            server?: {
                listen: () => void;
                close: () => void;
            };
        };
    }
}