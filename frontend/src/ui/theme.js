import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: { // Verde oliva
    50:"#f0f3e6",100:"#d9e0b8",200:"#c1cd8a",300:"#a8ba5c",400:"#90a72e",
    500:"#779400",600:"#5f7700",700:"#465900",800:"#2e3c00",900:"#171e00",
  },
  accent: { // cyan petrol
    50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",
    500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",
  },
  neutral: { // Grises neutros
    50:"#f9f9f9",100:"#efefef",200:"#dcdcdc",300:"#c9c9c9",400:"#a6a6a6",
    500:"#888888",600:"#666666",700:"#444444",800:"#222222",900:"#111111",
  },
};

// Configuración de color mode
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const styles = {
  global: (props) => {
    const isLight = props.colorMode === "light";
    return {
      "html, body, #root": { height: "100%" },
      body: {
        // antes usabas accent.500 en dark; mejor base oscura neutra
        bg: isLight ? "neutral.50" : "neutral.900",
        color: isLight ? "neutral.800" : "neutral.100",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      },
      a: { color: isLight ? "brand.500" : "accent.500" },

      /* ===== FullCalendar ===== */
      ".fc": {
        "--fc-text-color": isLight
          ? "var(--chakra-colors-neutral-900)"
          : "var(--chakra-colors-neutral-100)",
        "--fc-neutral-text-color": isLight
          ? "var(--chakra-colors-neutral-900)"
          : "var(--chakra-colors-neutral-100)",
        "--fc-button-text-color": isLight
          ? "var(--chakra-colors-neutral-900)"
          : "var(--chakra-colors-neutral-100)",
        "--fc-border-color": isLight
          ? "var(--chakra-colors-neutral-200)"
          : "var(--chakra-colors-neutral-700)",
        "--fc-today-bg-color": isLight
          ? "var(--chakra-colors-accent-50)"
          : "var(--chakra-colors-neutral-800)",
        "--fc-page-bg-color": "transparent",
      },
      ".fc .fc-col-header-cell-cushion": {
        textTransform: "capitalize",
        color: isLight ? "neutral.800" : "neutral.100",
        fontWeight: 600,
      },
      ".fc .fc-daygrid-day-number": {
        color: isLight ? "neutral.900" : "neutral.100",
        textDecoration: "none",
        fontWeight: 600,
      },
      ".fc .fc-daygrid-day-number:hover": {
        color: isLight ? "neutral.900" : "neutral.100",
      },
      ".fc a, .fc a:hover, .fc a:visited": { color: "inherit" },
      ".fc .fc-toolbar .fc-button": {
        color: isLight ? "neutral.900" : "neutral.100",
        background: "transparent",
        borderColor: "transparent",
      },
      ".fc .fc-toolbar .fc-button:hover": {
        background: isLight ? "neutral.100" : "neutral.700",
      },
      ".fc .fc-daygrid-day.fc-day-today": {
        backgroundColor: isLight ? "accent.50" : "neutral.800",
      },
      ".fc .fc-daygrid-event": {
        padding: "2px 6px",
        borderRadius: "6px",
        borderWidth: "1px",
        fontSize: "12px",
        lineHeight: "1.2",
      },
      ".fc .fc-daygrid-event .fc-event-title": { whiteSpace: "normal" },
      ".fc .fc-daygrid-day-frame": { minHeight: "100px", height: "auto !important" },
      ".fc-daygrid-day-events": { display: "flex", flexDirection: "column", gap: "2px" },
      ".fc-daygrid-day .fc-day-total": {
        position: "relative !important",
        alignSelf: "flex-end",
        marginTop: "4px",
        fontSize: "11px",
        fontWeight: "600",
        color: isLight ? "#111" : "#f3f4f6",
        padding: "2px 5px",
        borderRadius: "4px",
        pointerEvents: "none",
        textAlign: "left",
      },
    };
  },
};

/* ===== Estilos por defecto de componentes ===== */
const components = {
  Button: {
    defaultProps: { size: "md", variant: "solid" },
    variants: {
      solid: (p) => ({
        bg: p.colorMode === "light" ? "brand.500" : "accent.500",
        color: p.colorMode === "light" ? "white" : "black",
        _hover: { bg: p.colorMode === "light" ? "brand.600" : "accent.600" },
        _active: { transform: "translateY(0.5px)" },
        borderRadius: "md",
      }),
      ghost: (p) => ({
        bg: "transparent",
        _hover: { bg: p.colorMode === "light" ? "neutral.100" : "neutral.700" },
        borderRadius: "md",
      }),
    },
  },
  Input: {
    defaultProps: { variant: "outline", size: "md" },
    variants: {
      outline: (p) => ({
        field: {
          bg: p.colorMode === "light" ? "white" : "neutral.800",
          borderColor: p.colorMode === "light" ? "neutral.200" : "neutral.700",
          _placeholder: { color: p.colorMode === "light" ? "gray.500" : "gray.400" },
          _hover: { borderColor: p.colorMode === "light" ? "neutral.300" : "neutral.600" },
          _focus: {
            borderColor: "accent.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-accent-500)",
          },
          borderRadius: "md",
        },
      }),
    },
  },
  Select: {
    defaultProps: { variant: "outline", size: "md" },
    variants: {
      outline: (p) => ({
        field: {
          bg: p.colorMode === "light" ? "white" : "neutral.800",
          borderColor: p.colorMode === "light" ? "neutral.200" : "neutral.700",
          _hover: { borderColor: p.colorMode === "light" ? "neutral.300" : "neutral.600" },
          _focus: {
            borderColor: "accent.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-accent-500)",
          },
          borderRadius: "md",
        },
      }),
    },
  },
  Textarea: {
    defaultProps: { variant: "outline", size: "md" },
    variants: {
      outline: (p) => ({
        bg: p.colorMode === "light" ? "white" : "neutral.800",
        borderColor: p.colorMode === "light" ? "neutral.200" : "neutral.700",
        _hover: { borderColor: p.colorMode === "light" ? "neutral.300" : "neutral.600" },
        _focus: {
          borderColor: "accent.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-accent-500)",
        },
        borderRadius: "md",
      }),
    },
  },
  Table: {
    defaultProps: { variant: "simple", size: "sm" },
    variants: {
      simple: (p) => ({
        table: { borderCollapse: "separate", borderSpacing: 0 },
        th: { bg: p.colorMode === "light" ? "neutral.100" : "neutral.800", color: "inherit" },
        td: {
          borderTop: "1px solid",
          borderColor: p.colorMode === "light" ? "neutral.200" : "neutral.700",
        },
      }),
    },
  },
  // Card “ligero” sin dependencia de shadcn
  Card: {
    baseStyle: (p) => ({
      container: {
        bg: p.colorMode === "light" ? "white" : "neutral.800",
        border: "1px solid",
        borderColor: p.colorMode === "light" ? "neutral.200" : "neutral.700",
        borderRadius: "lg",
        p: 4,
      },
    }),
  },
};

const theme = extendTheme({ config, colors, styles, components });
export default theme;
