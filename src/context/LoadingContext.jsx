import { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
    const [loadingCount, setLoadingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const showLoading = useCallback(() => {
        setLoadingCount(prev => {
            const newCount = prev + 1;
            if (newCount > 0) {
                setIsLoading(true);
            }
            return newCount;
        });
    }, []);

    const hideLoading = useCallback(() => {
        setLoadingCount(prev => {
            const newCount = Math.max(prev - 1, 0);
            if (newCount === 0) {
                setIsLoading(false);
            }
            return newCount;
        });
    }, []);

    return (
        <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within LoadingProvider');
    }
    return context;
}
