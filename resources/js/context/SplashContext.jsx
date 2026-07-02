import React, { createContext, useContext } from 'react';

const SplashContext = createContext({ splashReady: true });

export function SplashProvider({ splashReady, children }) {
    return (
        <SplashContext.Provider value={{ splashReady }}>
            {children}
        </SplashContext.Provider>
    );
}

export function useSplashReady() {
    return useContext(SplashContext).splashReady;
}
