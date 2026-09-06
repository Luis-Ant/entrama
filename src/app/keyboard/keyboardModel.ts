import type { LayoutProfileId } from "../../keyboard-layouts/types";

export type FingerType =
  | "left-pinky"
  | "left-ring"
  | "left-middle"
  | "left-index"
  | "thumb"
  | "right-index"
  | "right-middle"
  | "right-ring"
  | "right-pinky";

export interface KeyDef {
  readonly code: string;
  readonly primary: string;
  readonly secondary?: string;
  readonly altGr?: string;
  readonly width?: string;
  readonly unitWidth?: number;
  readonly finger: FingerType;
  readonly isHoming?: boolean;
}

export const STANDARD_KEY_UNIT_WIDTHS: Record<string, number> = {
  default: 1,
  Tab: 1.5,
  Backslash: 1.5,
  CapsLock: 1.75,
  Enter: 2.25,
  ShiftLeft: 2.25,
  ShiftRight: 2.75,
  Space: 6.25,
  Backspace: 2,
  ControlLeft: 1.25,
  ControlRight: 1.25,
  AltLeft: 1.25,
  AltRight: 1.25,
  MetaLeft: 1.25,
  MetaRight: 1.25,
};

export function getKeyUnitWidth(code: string): number {
  return STANDARD_KEY_UNIT_WIDTHS[code] ?? 1;
}

export const KEYBOARD_ROW_OFFSETS: readonly number[] = [0, 0, 0, 0, 0];

export const PHYSICAL_ROW_STAGGER_OFFSETS: readonly number[] = [
  0, // Row 0 (Number row offset = 0)
  0.5, // Row 1 (QWERTY stagger = 0.5U)
  0.75, // Row 2 (Home row stagger = 0.75U)
  0.25, // Row 3 (Shift row stagger = 0.25U)
  0, // Row 4 (Space row offset = 0)
];

export interface HandFingerDef {
  readonly id: FingerType;
  readonly labelEn: string;
  readonly labelEs: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rx: number;
}

export const LEFT_FINGERS: readonly HandFingerDef[] = [
  {
    id: "left-pinky",
    labelEn: "Pinky",
    labelEs: "Meñique",
    x: 10,
    y: 35,
    width: 14,
    height: 48,
    rx: 7,
  },
  {
    id: "left-ring",
    labelEn: "Ring",
    labelEs: "Anular",
    x: 28,
    y: 18,
    width: 14,
    height: 65,
    rx: 7,
  },
  {
    id: "left-middle",
    labelEn: "Middle",
    labelEs: "Medio",
    x: 46,
    y: 10,
    width: 14,
    height: 73,
    rx: 7,
  },
  {
    id: "left-index",
    labelEn: "Index",
    labelEs: "Índice",
    x: 64,
    y: 20,
    width: 14,
    height: 63,
    rx: 7,
  },
  {
    id: "thumb",
    labelEn: "Thumb",
    labelEs: "Pulgar",
    x: 82,
    y: 55,
    width: 15,
    height: 40,
    rx: 7.5,
  },
];

export const RIGHT_FINGERS: readonly HandFingerDef[] = [
  {
    id: "thumb",
    labelEn: "Thumb",
    labelEs: "Pulgar",
    x: 10,
    y: 55,
    width: 15,
    height: 40,
    rx: 7.5,
  },
  {
    id: "right-index",
    labelEn: "Index",
    labelEs: "Índice",
    x: 28,
    y: 20,
    width: 14,
    height: 63,
    rx: 7,
  },
  {
    id: "right-middle",
    labelEn: "Middle",
    labelEs: "Medio",
    x: 46,
    y: 10,
    width: 14,
    height: 73,
    rx: 7,
  },
  {
    id: "right-ring",
    labelEn: "Ring",
    labelEs: "Anular",
    x: 64,
    y: 18,
    width: 14,
    height: 65,
    rx: 7,
  },
  {
    id: "right-pinky",
    labelEn: "Pinky",
    labelEs: "Meñique",
    x: 82,
    y: 35,
    width: 14,
    height: 48,
    rx: 7,
  },
];

const FINGER_KEY_MAP: Record<string, FingerType> = {
  // Left pinky
  "`": "left-pinky",
  "~": "left-pinky",
  "1": "left-pinky",
  "!": "left-pinky",
  "¡": "left-pinky",
  q: "left-pinky",
  Q: "left-pinky",
  a: "left-pinky",
  A: "left-pinky",
  á: "left-pinky",
  Á: "left-pinky",
  z: "left-pinky",
  Z: "left-pinky",
  Backquote: "left-pinky",
  Digit1: "left-pinky",
  KeyQ: "left-pinky",
  KeyA: "left-pinky",
  KeyZ: "left-pinky",
  Tab: "left-pinky",
  CapsLock: "left-pinky",
  ShiftLeft: "left-pinky",
  ControlLeft: "left-pinky",

  // Left ring
  "2": "left-ring",
  "@": "left-ring",
  w: "left-ring",
  W: "left-ring",
  s: "left-ring",
  S: "left-ring",
  x: "left-ring",
  X: "left-ring",
  Digit2: "left-ring",
  KeyW: "left-ring",
  KeyS: "left-ring",
  KeyX: "left-ring",

  // Left middle
  "3": "left-middle",
  "#": "left-middle",
  e: "left-middle",
  E: "left-middle",
  é: "left-middle",
  É: "left-middle",
  d: "left-middle",
  D: "left-middle",
  c: "left-middle",
  C: "left-middle",
  Digit3: "left-middle",
  KeyE: "left-middle",
  KeyD: "left-middle",
  KeyC: "left-middle",

  // Left index
  "4": "left-index",
  $: "left-index",
  "5": "left-index",
  "%": "left-index",
  r: "left-index",
  R: "left-index",
  t: "left-index",
  T: "left-index",
  f: "left-index",
  F: "left-index",
  g: "left-index",
  G: "left-index",
  v: "left-index",
  V: "left-index",
  b: "left-index",
  B: "left-index",
  Digit4: "left-index",
  Digit5: "left-index",
  KeyR: "left-index",
  KeyT: "left-index",
  KeyF: "left-index",
  KeyG: "left-index",
  KeyV: "left-index",
  KeyB: "left-index",

  // Thumbs
  " ": "thumb",
  Space: "thumb",
  Spacebar: "thumb",
  AltLeft: "thumb",
  AltRight: "thumb",
  MetaLeft: "thumb",
  MetaRight: "thumb",

  // Right index
  "6": "right-index",
  "^": "right-index",
  "7": "right-index",
  "&": "right-index",
  y: "right-index",
  Y: "right-index",
  u: "right-index",
  U: "right-index",
  ú: "right-index",
  Ú: "right-index",
  ü: "right-index",
  Ü: "right-index",
  h: "right-index",
  H: "right-index",
  j: "right-index",
  J: "right-index",
  n: "right-index",
  N: "right-index",
  m: "right-index",
  M: "right-index",
  Digit6: "right-index",
  Digit7: "right-index",
  KeyY: "right-index",
  KeyU: "right-index",
  KeyH: "right-index",
  KeyJ: "right-index",
  KeyN: "right-index",
  KeyM: "right-index",

  // Right middle
  "8": "right-middle",
  "*": "right-middle",
  i: "right-middle",
  I: "right-middle",
  í: "right-middle",
  Í: "right-middle",
  k: "right-middle",
  K: "right-middle",
  ",": "right-middle",
  "<": "right-middle",
  Digit8: "right-middle",
  KeyI: "right-middle",
  KeyK: "right-middle",
  Comma: "right-middle",

  // Right ring
  "9": "right-ring",
  "(": "right-ring",
  o: "right-ring",
  O: "right-ring",
  ó: "right-ring",
  Ó: "right-ring",
  l: "right-ring",
  L: "right-ring",
  ".": "right-ring",
  ">": "right-ring",
  Digit9: "right-ring",
  KeyO: "right-ring",
  KeyL: "right-ring",
  Period: "right-ring",

  // Right pinky
  "0": "right-pinky",
  ")": "right-pinky",
  "-": "right-pinky",
  _: "right-pinky",
  "=": "right-pinky",
  "+": "right-pinky",
  p: "right-pinky",
  P: "right-pinky",
  "[": "right-pinky",
  "{": "right-pinky",
  "]": "right-pinky",
  "}": "right-pinky",
  "\\": "right-pinky",
  "|": "right-pinky",
  ";": "right-pinky",
  ":": "right-pinky",
  "'": "right-pinky",
  '"': "right-pinky",
  "/": "right-pinky",
  "?": "right-pinky",
  "¿": "right-pinky",
  ñ: "right-pinky",
  Ñ: "right-pinky",
  "´": "right-pinky",
  "¨": "right-pinky",
  Digit0: "right-pinky",
  Minus: "right-pinky",
  Equal: "right-pinky",
  KeyP: "right-pinky",
  BracketLeft: "right-pinky",
  BracketRight: "right-pinky",
  Backslash: "right-pinky",
  Semicolon: "right-pinky",
  Quote: "right-pinky",
  Slash: "right-pinky",
  Backspace: "right-pinky",
  Enter: "right-pinky",
  ShiftRight: "right-pinky",
  ControlRight: "right-pinky",
};

export function getFingerForKey(keyOrCode: string): FingerType | undefined {
  if (!keyOrCode) return undefined;
  if (FINGER_KEY_MAP[keyOrCode]) return FINGER_KEY_MAP[keyOrCode];

  // Try single character lower
  const char = keyOrCode.length === 1 ? keyOrCode.toLowerCase() : keyOrCode;
  if (FINGER_KEY_MAP[char]) return FINGER_KEY_MAP[char];

  return undefined;
}

export const FINGER_COLOR_CLASSES: Record<
  FingerType,
  {
    bg: string;
    border: string;
    text: string;
    fill: string;
    glow: string;
  }
> = {
  "left-pinky": {
    bg: "bg-rose-500/20",
    border: "border-rose-400",
    text: "text-rose-400",
    fill: "#f43f5e",
    glow: "shadow-[0_0_12px_rgba(244,63,94,0.6)]",
  },
  "left-ring": {
    bg: "bg-amber-500/20",
    border: "border-amber-400",
    text: "text-amber-400",
    fill: "#f59e0b",
    glow: "shadow-[0_0_12px_rgba(245,158,11,0.6)]",
  },
  "left-middle": {
    bg: "bg-yellow-500/20",
    border: "border-yellow-400",
    text: "text-yellow-400",
    fill: "#eab308",
    glow: "shadow-[0_0_12px_rgba(234,179,8,0.6)]",
  },
  "left-index": {
    bg: "bg-emerald-500/20",
    border: "border-emerald-400",
    text: "text-emerald-400",
    fill: "#10b981",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.6)]",
  },
  thumb: {
    bg: "bg-teal-500/20",
    border: "border-teal-400",
    text: "text-teal-400",
    fill: "#14b8a6",
    glow: "shadow-[0_0_12px_rgba(20,184,166,0.6)]",
  },
  "right-index": {
    bg: "bg-cyan-500/20",
    border: "border-cyan-400",
    text: "text-cyan-400",
    fill: "#06b6d4",
    glow: "shadow-[0_0_12px_rgba(6,182,212,0.6)]",
  },
  "right-middle": {
    bg: "bg-blue-500/20",
    border: "border-blue-400",
    text: "text-blue-400",
    fill: "#3b82f6",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.6)]",
  },
  "right-ring": {
    bg: "bg-indigo-500/20",
    border: "border-indigo-400",
    text: "text-indigo-400",
    fill: "#6366f1",
    glow: "shadow-[0_0_12px_rgba(99,102,241,0.6)]",
  },
  "right-pinky": {
    bg: "bg-purple-500/20",
    border: "border-purple-400",
    text: "text-purple-400",
    fill: "#a855f7",
    glow: "shadow-[0_0_12px_rgba(168,85,247,0.6)]",
  },
};

export function getKeyInfoForProfile(
  code: string,
  layoutProfileId?: LayoutProfileId,
): { primary: string; secondary?: string } {
  const isLatam =
    layoutProfileId === "macos-latin-american-qwerty" ||
    layoutProfileId === "windows-latin-american-qwerty";

  if (isLatam) {
    switch (code) {
      case "Semicolon":
        return { primary: "ñ", secondary: "Ñ" };
      case "BracketLeft":
        return { primary: "´", secondary: "¨" };
      case "BracketRight":
        return { primary: "+", secondary: "*" };
      case "Minus":
        return { primary: "'", secondary: "?" };
      case "Equal":
        return { primary: "¿", secondary: "¡" };
      case "Slash":
        return { primary: "-", secondary: "_" };
      default:
        break;
    }
  }

  // Default / US International
  switch (code) {
    case "Semicolon":
      return { primary: ";", secondary: ":" };
    case "BracketLeft":
      return { primary: "[", secondary: "{" };
    case "BracketRight":
      return { primary: "]", secondary: "}" };
    case "Minus":
      return { primary: "-", secondary: "_" };
    case "Equal":
      return { primary: "=", secondary: "+" };
    case "Slash":
      return { primary: "/", secondary: "?" };
    default:
      break;
  }

  if (code.startsWith("Key")) {
    const letter = code.slice(3);
    return { primary: letter.toLowerCase(), secondary: letter };
  }

  if (code.startsWith("Digit")) {
    const digit = code.slice(5);
    return { primary: digit };
  }

  return { primary: code };
}

export function mapTargetToCode(
  target: string,
  layoutProfileId?: LayoutProfileId,
): string {
  if (!target) return "";

  // If already a key code
  if (
    target.startsWith("Key") ||
    target.startsWith("Digit") ||
    target === "Space" ||
    target === "Backspace" ||
    target === "Enter" ||
    target === "Semicolon" ||
    target === "Slash" ||
    target === "Equal" ||
    target === "Minus"
  ) {
    return target;
  }

  if (target === " ") return "Space";

  const isLatam =
    layoutProfileId === "macos-latin-american-qwerty" ||
    layoutProfileId === "windows-latin-american-qwerty";

  // Spanish special characters
  switch (target) {
    case "á":
    case "Á":
      return "KeyA";
    case "é":
    case "É":
      return "KeyE";
    case "í":
    case "Í":
      return "KeyI";
    case "ó":
    case "Ó":
      return "KeyO";
    case "ú":
    case "Ú":
    case "ü":
    case "Ü":
      return "KeyU";
    case "ñ":
    case "Ñ":
      return isLatam ? "Semicolon" : "KeyN";
    case "¿":
      return isLatam ? "Equal" : "Slash";
    case "¡":
      return isLatam ? "Equal" : "Digit1";
    case "?":
      return isLatam ? "Minus" : "Slash";
    case "!":
      return "Digit1";
    case ";":
      return "Semicolon";
    case ":":
      return "Semicolon";
    case "/":
      return "Slash";
    case "-":
      return isLatam ? "Slash" : "Minus";
    case "=":
      return "Equal";
    case "+":
      return isLatam ? "BracketRight" : "Equal";
    case ",":
      return "Comma";
    case ".":
      return "Period";
    default:
      break;
  }

  // Letters a-z
  if (/^[a-zA-Z]$/.test(target)) {
    return `Key${target.toUpperCase()}`;
  }

  // Digits 0-9
  if (/^[0-9]$/.test(target)) {
    return `Digit${target}`;
  }

  return "";
}

export const ROW_1: readonly KeyDef[] = [
  {
    code: "Backquote",
    primary: "`",
    secondary: "~",
    unitWidth: 1,
    finger: "left-pinky",
  },
  {
    code: "Digit1",
    primary: "1",
    secondary: "!",
    unitWidth: 1,
    finger: "left-pinky",
  },
  {
    code: "Digit2",
    primary: "2",
    secondary: "@",
    unitWidth: 1,
    finger: "left-ring",
  },
  {
    code: "Digit3",
    primary: "3",
    secondary: "#",
    unitWidth: 1,
    finger: "left-middle",
  },
  {
    code: "Digit4",
    primary: "4",
    secondary: "$",
    unitWidth: 1,
    finger: "left-index",
  },
  {
    code: "Digit5",
    primary: "5",
    secondary: "%",
    unitWidth: 1,
    finger: "left-index",
  },
  {
    code: "Digit6",
    primary: "6",
    secondary: "^",
    unitWidth: 1,
    finger: "right-index",
  },
  {
    code: "Digit7",
    primary: "7",
    secondary: "&",
    unitWidth: 1,
    finger: "right-index",
  },
  {
    code: "Digit8",
    primary: "8",
    secondary: "*",
    unitWidth: 1,
    finger: "right-middle",
  },
  {
    code: "Digit9",
    primary: "9",
    secondary: "(",
    unitWidth: 1,
    finger: "right-ring",
  },
  {
    code: "Digit0",
    primary: "0",
    secondary: ")",
    unitWidth: 1,
    finger: "right-pinky",
  },
  {
    code: "Minus",
    primary: "-",
    secondary: "_",
    unitWidth: 1,
    finger: "right-pinky",
  },
  {
    code: "Equal",
    primary: "=",
    secondary: "+",
    unitWidth: 1,
    finger: "right-pinky",
  },
  {
    code: "Backspace",
    primary: "⌫",
    width: "flex-1 min-w-14",
    unitWidth: 2,
    finger: "right-pinky",
  },
];

export const ROW_2: readonly KeyDef[] = [
  {
    code: "Tab",
    primary: "Tab",
    width: "w-14",
    unitWidth: 1.5,
    finger: "left-pinky",
  },
  { code: "KeyQ", primary: "Q", unitWidth: 1, finger: "left-pinky" },
  { code: "KeyW", primary: "W", unitWidth: 1, finger: "left-ring" },
  { code: "KeyE", primary: "E", unitWidth: 1, finger: "left-middle" },
  { code: "KeyR", primary: "R", unitWidth: 1, finger: "left-index" },
  { code: "KeyT", primary: "T", unitWidth: 1, finger: "left-index" },
  { code: "KeyY", primary: "Y", unitWidth: 1, finger: "right-index" },
  { code: "KeyU", primary: "U", unitWidth: 1, finger: "right-index" },
  { code: "KeyI", primary: "I", unitWidth: 1, finger: "right-middle" },
  { code: "KeyO", primary: "O", unitWidth: 1, finger: "right-ring" },
  { code: "KeyP", primary: "P", unitWidth: 1, finger: "right-pinky" },
  {
    code: "BracketLeft",
    primary: "[",
    secondary: "{",
    unitWidth: 1,
    finger: "right-pinky",
  },
  {
    code: "BracketRight",
    primary: "]",
    secondary: "}",
    unitWidth: 1,
    finger: "right-pinky",
  },
  {
    code: "Backslash",
    primary: "\\",
    secondary: "|",
    width: "flex-1 min-w-10",
    unitWidth: 1.5,
    finger: "right-pinky",
  },
];

export const ROW_3: readonly KeyDef[] = [
  {
    code: "CapsLock",
    primary: "Caps",
    width: "w-16",
    unitWidth: 1.75,
    finger: "left-pinky",
  },
  { code: "KeyA", primary: "A", unitWidth: 1, finger: "left-pinky" },
  { code: "KeyS", primary: "S", unitWidth: 1, finger: "left-ring" },
  { code: "KeyD", primary: "D", unitWidth: 1, finger: "left-middle" },
  {
    code: "KeyF",
    primary: "F",
    isHoming: true,
    unitWidth: 1,
    finger: "left-index",
  },
  { code: "KeyG", primary: "G", unitWidth: 1, finger: "left-index" },
  { code: "KeyH", primary: "H", unitWidth: 1, finger: "right-index" },
  {
    code: "KeyJ",
    primary: "J",
    isHoming: true,
    unitWidth: 1,
    finger: "right-index",
  },
  { code: "KeyK", primary: "K", unitWidth: 1, finger: "right-middle" },
  { code: "KeyL", primary: "L", unitWidth: 1, finger: "right-ring" },
  {
    code: "Semicolon",
    primary: ";",
    secondary: ":",
    unitWidth: 1,
    finger: "right-pinky",
  },
  {
    code: "Quote",
    primary: "'",
    secondary: '"',
    unitWidth: 1,
    finger: "right-pinky",
  },
  {
    code: "Enter",
    primary: "↵ Enter",
    width: "flex-1 min-w-16",
    unitWidth: 2.25,
    finger: "right-pinky",
  },
];

export const ROW_4: readonly KeyDef[] = [
  {
    code: "ShiftLeft",
    primary: "⇧ Shift",
    width: "w-20",
    unitWidth: 2.25,
    finger: "left-pinky",
  },
  { code: "KeyZ", primary: "Z", unitWidth: 1, finger: "left-pinky" },
  { code: "KeyX", primary: "X", unitWidth: 1, finger: "left-ring" },
  { code: "KeyC", primary: "C", unitWidth: 1, finger: "left-middle" },
  { code: "KeyV", primary: "V", unitWidth: 1, finger: "left-index" },
  { code: "KeyB", primary: "B", unitWidth: 1, finger: "left-index" },
  { code: "KeyN", primary: "N", unitWidth: 1, finger: "right-index" },
  { code: "KeyM", primary: "M", unitWidth: 1, finger: "right-index" },
  {
    code: "Comma",
    primary: ",",
    secondary: "<",
    unitWidth: 1,
    finger: "right-middle",
  },
  {
    code: "Period",
    primary: ".",
    secondary: ">",
    unitWidth: 1,
    finger: "right-ring",
  },
  {
    code: "Slash",
    primary: "/",
    secondary: "?",
    unitWidth: 1,
    finger: "right-pinky",
  },
  {
    code: "ShiftRight",
    primary: "⇧ Shift",
    width: "flex-1 min-w-20",
    unitWidth: 2.75,
    finger: "right-pinky",
  },
];

export const ROW_5: readonly KeyDef[] = [
  {
    code: "ControlLeft",
    primary: "Ctrl",
    width: "w-14",
    unitWidth: 1.25,
    finger: "left-pinky",
  },
  {
    code: "AltLeft",
    primary: "Alt",
    width: "w-12",
    unitWidth: 1.25,
    finger: "thumb",
  },
  {
    code: "MetaLeft",
    primary: "Cmd",
    width: "w-12",
    unitWidth: 1.25,
    finger: "thumb",
  },
  {
    code: "Space",
    primary: "Space",
    width: "flex-1 min-w-48",
    unitWidth: 6.25,
    finger: "thumb",
  },
  {
    code: "MetaRight",
    primary: "Cmd",
    width: "w-12",
    unitWidth: 1.25,
    finger: "thumb",
  },
  {
    code: "AltRight",
    primary: "AltGr",
    width: "w-12",
    unitWidth: 1.25,
    finger: "thumb",
  },
  {
    code: "ControlRight",
    primary: "Ctrl",
    width: "w-14",
    unitWidth: 1.25,
    finger: "right-pinky",
  },
];

export const KEYBOARD_ROWS = [ROW_1, ROW_2, ROW_3, ROW_4, ROW_5];
