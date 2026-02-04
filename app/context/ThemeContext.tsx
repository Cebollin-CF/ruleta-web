
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// Definición de colores base (actuales = dark)
export const darkTheme = {
    dark: true,
    colors: {
        // FONDOS (gradientes)
        bgTop: "#2B102A",
        bgBottom: "#5B1F4A",

        // TARJETAS
        card: "#4A3258",

        // PRINCIPALES
        primary: "#FF4F8B",        // Rosa fuerte
        secondary: "#B28DFF",      // Lila
        accent: "#FFB3D1",         // Rosa claro
        text: "#FFFFFF",           // Blanco puro
        muted: "#C4A5BA",          // Texto secundario

        // ESTADOS
        success: "#6BD18A",
        warning: "#F7C56D",
        danger: "#FF6B6B",

        // EXTRAS (para compatibilidad)
        background: "#4A3258", // Fallback sólido
    }
};

// Nuevo tema claro
export const lightTheme = {
    dark: false,
    colors: {
        // FONDOS (gradientes) - Tonos rosa pastel/blanco
        bgTop: "#FFF0F5",          // Lavender Blush
        bgBottom: "#FFE4E1",       // Misty Rose

        // TARJETAS
        card: "#FFFFFF",

        // PRINCIPALES
        primary: "#FF4F8B",        // Mantener identidad marca
        secondary: "#B28DFF",
        accent: "#D6336C",         // Rosa más oscuro para texto sobre fondo claro
        text: "#2D1B2E",           // Casi negro (berenjena muy oscuro)
        muted: "#865c7c",          // Grisáceo

        // ESTADOS
        success: "#4CAF50",
        warning: "#FFC107",
        danger: "#E53935",

        // EXTRAS
        background: "#FFFFFF",
    }
};

// Contexto
const ThemeContext = createContext({
    theme: darkTheme,
    isDark: true,
    toggleTheme: () => { },
});

export const ThemeProvider = ({ children }) => {
    const deviceColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(true); // Default dark por diseño original

    useEffect(() => {
        // Cargar preferencia guardada
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('app_theme');
                if (savedTheme !== null) {
                    setIsDark(savedTheme === 'dark');
                } else {
                    // Si no hay guardado, podríamos usar deviceColorScheme, 
                    // pero el diseño original es dark, así que lo dejamos así por defecto.
                }
            } catch (e) {
                console.error("Error loading theme", e);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        try {
            await AsyncStorage.setItem('app_theme', newIsDark ? 'dark' : 'light');
        } catch (e) {
            console.error("Error saving theme", e);
        }
    };

    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook personalizado
export const useTheme = () => useContext(ThemeContext);
