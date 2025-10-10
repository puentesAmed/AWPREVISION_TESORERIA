import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: { // Verde oliva
    50: "#f0f3e6",
    100: "#d9e0b8",
    200: "#c1cd8a",
    300: "#a8ba5c",
    400: "#90a72e",
    500: "#779400", // verde oliva principal
    600: "#5f7700",
    700: "#465900",
    800: "#2e3c00",
    900: "#171e00",
  },
    accent: { // Sand-storm / beige arena
    50: "#fff9f0",
    100: "#fff0d9",
    200: "#ffe6c1",
    300: "#ffdbaa",
    400: "#ffd192",
    500: "#ffc777", // beige principal
    600: "#cca55f",
    700: "#997d47",
    800: "#66562f",
    900: "#332b17",
  },
  neutral: { // Grises neutros
    50: "#f9f9f9",
    100: "#efefef",
    200: "#dcdcdc",
    300: "#c9c9c9",
    400: "#a6a6a6",
    500: "#888888",
    600: "#666666",
    700: "#444444",
    800: "#222222",
    900: "#111111",
  },
};


// Configuración de color mode
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};




// Extender el tema
/*const theme = extendTheme({
  config,
  colors,
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === "light" ? "neutral.50" : "accent.500",
        color: props.colorMode === "light" ? "neutral.800" : "neutral.100",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      },
      a: {
        color: props.colorMode === "light" ? "brand.500" : "accent.500",
      },
    }),
  },
});
*/

// theme.js
const theme = extendTheme({
  config,
  colors,
  styles: {
    global: (props) => {
      const isLight = props.colorMode === 'light';

      return {
        body: {
          bg: isLight ? "neutral.50" : "accent.500",
          color: isLight ? "neutral.800" : "neutral.100",
          minHeight: "100vh",
          fontFamily: "'Inter', sans-serif",
        },
        a: {
          color: isLight ? "brand.500" : "accent.500",
        },

        /* ===== FullCalendar (colores base vía variables) ===== */
        '.fc': {
          '--fc-text-color': isLight ? 'var(--chakra-colors-neutral-900)' : 'var(--chakra-colors-neutral-100)',
          '--fc-neutral-text-color': isLight ? 'var(--chakra-colors-neutral-900)' : 'var(--chakra-colors-neutral-100)',
          '--fc-button-text-color': isLight ? 'var(--chakra-colors-neutral-900)' : 'var(--chakra-colors-neutral-100)',
          '--fc-border-color': isLight ? 'var(--chakra-colors-neutral-200)' : 'var(--chakra-colors-neutral-700)',
          '--fc-today-bg-color': isLight ? 'var(--chakra-colors-accent-50)' : 'var(--chakra-colors-neutral-800)',
          '--fc-page-bg-color': 'transparent',
        },

        /* ===== Título del mes ===== */
        /*'.fc .fc-toolbar-title': {
          textTransform: 'capitalize',
          color: isLight ? 'var(--chakra-colors-neutral-900)' : 'var(--chakra-colors-neutral-100)',
          fontWeight: 700,
      
        },*/

        

        /* ===== Encabezados de días (Lun, Mar, ...) ===== */
        '.fc .fc-col-header-cell-cushion': {
          textTransform: 'capitalize',
          color: isLight ? 'var(--chakra-colors-neutral-800)' : 'var(--chakra-colors-neutral-100)',
          fontWeight: 600,
        },

        /* ===== Número del día ===== */
        /* ¡Ojo! Es un <a>, mejor forzar color heredado y evitar azul por defecto */
        '.fc .fc-daygrid-day-number': {
          color: isLight ? 'var(--chakra-colors-neutral-900)' : 'var(--chakra-colors-neutral-100)',
          textDecoration: 'none',
          fontWeight: 600,
        },
        '.fc .fc-daygrid-day-number:hover': {
          color: isLight ? 'var(--chakra-colors-neutral-900)' : 'var(--chakra-colors-neutral-100)',
        },
        // Para heredar color en todos los enlaces internos del calendario:
        '.fc a, .fc a:hover, .fc a:visited': {
          color: 'inherit',
        },

        /* ===== Botones de la toolbar ===== */
        '.fc .fc-toolbar .fc-button': {
          color: isLight ? 'var(--chakra-colors-neutral-900)' : 'var(--chakra-colors-neutral-100)',
          background: 'transparent',
          borderColor: 'transparent',
        },
        '.fc .fc-toolbar .fc-button:hover': {
          background: isLight ? 'var(--chakra-colors-neutral-100)' : 'var(--chakra-colors-neutral-700)',
        },

        /* ===== Día de hoy ===== */
        '.fc .fc-daygrid-day.fc-day-today': {
          backgroundColor: isLight ? 'var(--chakra-colors-accent-50)' : 'var(--chakra-colors-neutral-800)',
        },

        /* ===== Apariencia de los eventos (opcional) ===== */
        '.fc .fc-daygrid-event': {
          padding: '2px 6px',
          borderRadius: '6px',
          borderWidth: '1px',
          fontSize: '12px',
          lineHeight: '1.2',
        },
        '.fc .fc-daygrid-event .fc-event-title': {
          whiteSpace: 'normal',
        },

        
      };
    },
  },
});

export default theme;
