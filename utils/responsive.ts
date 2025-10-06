// utils/responsive.ts - Mejorar el sistema actual
import {Dimensions, Platform} from 'react-native';

export const ResponsiveUI = {
    scale: (size: number): number => {
        const {width, height} = Dimensions.get('window');
        const baseWidth = 375; // iPhone base
        const ratio = Math.min(width, height) / baseWidth;

        // Ajustes específicos por plataforma
        return Platform.select({
            ios: size * ratio,
            android: size * (ratio * 0.9), // Ajuste fino para Android
            default: size,
        });
    },

    // Tamaños adaptativos para diferentes elementos
    typography: {
        title: (baseSize: number) => ResponsiveUI.scale(baseSize * 1.5),
        body: (baseSize: number) => ResponsiveUI.scale(baseSize),
        button: (baseSize: number) => ResponsiveUI.scale(baseSize * 1.2),
    }
};
