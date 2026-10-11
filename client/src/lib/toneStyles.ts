// ===== Semantic tone styles (single source of truth) =====
// Section/category accent colors that stay readable in light AND dark themes.
// Keys are static full class strings (Tailwind-safe, no dynamic construction).
export const TONE_STYLES = {
  success: {
    line: "border-success/30",
    chip: "bg-success/15 text-success-emphasis border border-success/25",
    panel: "bg-success/10 border-success/25",
    text: "text-success-emphasis",
    tab: "bg-success text-success-foreground border-transparent shadow-md scale-105",
    solid: "bg-success text-success-foreground hover:bg-success/90",
  },
  warning: {
    line: "border-warning/30",
    chip: "bg-warning/15 text-warning-emphasis border border-warning/25",
    panel: "bg-warning/10 border-warning/25",
    text: "text-warning-emphasis",
    tab: "bg-warning text-warning-foreground border-transparent shadow-md scale-105",
    solid: "bg-warning text-warning-foreground hover:bg-warning/90",
  },
  info: {
    line: "border-info/30",
    chip: "bg-info/15 text-info-emphasis border border-info/25",
    panel: "bg-info/10 border-info/25",
    text: "text-info-emphasis",
    tab: "bg-info text-info-foreground border-transparent shadow-md scale-105",
    solid: "bg-info text-info-foreground hover:bg-info/90",
  },
  secondary: {
    line: "border-secondary/40",
    chip: "bg-secondary/15 text-foreground border border-secondary/30",
    panel: "bg-secondary/10 border-secondary/30",
    text: "text-foreground",
    tab: "bg-secondary text-secondary-foreground border-transparent shadow-md scale-105",
    solid: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  },
  primary: {
    line: "border-primary/30",
    chip: "bg-primary/10 text-primary border border-primary/20",
    panel: "bg-primary/10 border-primary/20",
    text: "text-primary",
    tab: "bg-primary text-primary-foreground border-transparent shadow-md scale-105",
    solid: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  destructive: {
    line: "border-destructive/30",
    chip: "bg-destructive/10 text-destructive border border-destructive/25",
    panel: "bg-destructive/10 border-destructive/25",
    text: "text-destructive",
    tab: "bg-destructive text-white border-transparent shadow-md scale-105",
    solid: "bg-destructive text-white hover:bg-destructive/90",
  },
} as const;

export type Tone = keyof typeof TONE_STYLES;

// Badge variant matching each tone (primary has no Badge variant → default).
export const TONE_BADGE = {
  success: "success",
  warning: "warning",
  info: "info",
  secondary: "secondary",
  primary: "default",
  destructive: "destructive",
} as const;
