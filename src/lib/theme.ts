// Design tokens — warm beige palette matching the product prototype
export const T = {
  // Backgrounds
  bg:          "#f4f2ed",
  surface:     "#ffffff",
  surfaceHov:  "#eeece7",
  sidebarHov:  "#eceae4",
  sidebarAct:  "#dedad2",

  // Borders
  border:      "#e4e1d8",
  borderMid:   "#ccc9c0",

  // Text
  text:        "#1a1714",
  textMid:     "#6b6760",
  textDim:     "#a8a49e",

  // Accent — green
  green:       "#16a34a",
  greenLight:  "#dcfce7",
  greenMid:    "#86efac",

  // Fonts
  sans:  "'Inter', sans-serif",
  mono:  "'DM Mono', monospace",
  serif: "'Source Serif 4', ui-serif, Georgia, serif",
} as const;

export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@300;400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: ${T.sans}; background: ${T.bg}; color: ${T.text}; }
  button { font-family: inherit; cursor: pointer; }
  button:focus, input:focus, textarea:focus { outline: none; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #4a4540; border-radius: 2px; }
  @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: none; } }
  @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
  @keyframes blink   { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes spin    { to { transform: rotate(360deg); } }
`;
