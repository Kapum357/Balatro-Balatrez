// constants/Theme.ts
export const Theme = {
    colors: {
        bg: '#1c1f24',
        bgAlt: '#343a40',
        border: '#0d0d0f',
        shadow: '#0d0d0f',
        text: '#f8f9f4',
        textFaint: '#c5c9c9',
        accent: '#ff2366',
        accentAlt: '#ffc744',
        danger: '#ff4b4b',
        info: '#26d9ff',
        success: '#48d968',
        cardFace: '#2a2f33',
        cardEdge: '#0d0d0f',
        cardHighlight: '#3b4248',
        // Agregando los colores faltantes
        background: '#1c1f24', // mismo que bg para mantener consistencia
        surface: '#2a2f33'    // mismo que cardFace para mantener consistencia
    },
    spacing: {xs: 4, sm: 8, md: 16, lg: 24},
    radius: {none: 0, sm: 3, md: 6},
    elevation: {
        offset: 3 // px drop offset
    },
    typography: {
        // register a pixel font later; fallback monospace
        fontPrimary: 'monospace',
        fontPixel: 'monospace',
        // Font sizes using responsive scaling
        sizes: {
            tiny: 10,
            small: 12,
            regular: 14,
            medium: 16,
            large: 18,
            xlarge: 20,
            xxlarge: 24
        }
    }
};