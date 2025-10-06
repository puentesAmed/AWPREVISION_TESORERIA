import { extendTheme } from "@chakra-ui/react";

/*const colors = {
  brand: {
    50: "#e6f7ff",
    100: "#b3e5ff",
    200: "#80d4ff",
    300: "#4dc2ff",
    400: "#1ab0ff",
    500: "#0099e6", // azul principal
    600: "#0073b4",
    700: "#004d82",
    800: "#002851",
    900: "#001220",
  },
  accent: {
    50: "#e6fff5",
    100: "#b3ffe0",
    200: "#80ffcc",
    300: "#4dffb8",
    400: "#1affa3",
    500: "#00e68f", // verde llamativo
    600: "#00b374",
    700: "#00805a",
    800: "#00503f",
    900: "#00251f",
  },
  neutral: {
    50: "#f5f5f5",
    100: "#e0e0e0",
    200: "#c2c2c2",
    300: "#a3a3a3",
    400: "#858585",
    500: "#666666",
    600: "#4d4d4d",
    700: "#333333",
    800: "#1a1a1a",
    900: "#0a0a0a",
  },
};
*/

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
const theme = extendTheme({
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

export default theme;
