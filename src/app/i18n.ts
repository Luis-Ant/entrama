import type { LayoutProfileId } from "../keyboard-layouts/types";
import type { UiLocale } from "../onboarding/repositories";
import type { SoundProfileId, ThemeId, TypographyId } from "../styles/theme";

export interface OnboardingTranslations {
  readonly language: {
    readonly title: string;
    readonly description: string;
    readonly englishLabel: string;
    readonly spanishLabel: string;
    readonly note: string;
  };
  readonly profile: {
    readonly title: string;
    readonly description: string;
    readonly suggestionWarning: string;
    readonly confirmButton: string;
    readonly profiles: Record<LayoutProfileId, string>;
  };
  readonly calibration: {
    readonly title: string;
    readonly description: string;
    readonly stepProgress: (current: number, total: number) => string;
    readonly prompt: (code: string, expected: string) => string;
    readonly modifiers: (mods: string) => string;
    readonly pauseNotice: string;
    readonly resumeButton: string;
    readonly retryButton: string;
    readonly statusPassed: string;
    readonly statusPending: string;
    readonly statusFailed: string;
    readonly statusComplete: string;
    readonly pausedAnnouncement: string;
    readonly stepPassedAnnouncement: string;
    readonly failedAnnouncement: string;
    readonly completeAnnouncement: string;
  };
  readonly guided: {
    readonly title: string;
    readonly subtitle: string;
    readonly description: string;
    readonly lockedNotice: string;
    readonly posture: {
      readonly title: string;
      readonly description: string;
      readonly progress: (confirmed: number, total: number) => string;
      readonly confirmButton: string;
      readonly checkpoints: {
        readonly back: { readonly title: string; readonly description: string };
        readonly feet: { readonly title: string; readonly description: string };
        readonly elbows: {
          readonly title: string;
          readonly description: string;
        };
        readonly wrists: {
          readonly title: string;
          readonly description: string;
        };
      };
    };
    readonly fingerPlacement: {
      readonly title: string;
      readonly description: string;
      readonly leftHandTitle: string;
      readonly rightHandTitle: string;
      readonly confirmButton: string;
      readonly fingers: {
        readonly pinky: string;
        readonly ring: string;
        readonly middle: string;
        readonly index: string;
      };
    };
    readonly sequence: {
      readonly title: string;
      readonly description: string;
      readonly stepProgress: (current: number, total: number) => string;
      readonly keyProgress: (current: number, total: number) => string;
      readonly steps: {
        readonly homeRow: { readonly title: string; readonly target: string };
        readonly topRow: { readonly title: string; readonly target: string };
        readonly bottomRow: { readonly title: string; readonly target: string };
      };
      readonly prompt: (key: string) => string;
      readonly matchNotice: string;
      readonly mismatchNotice: string;
      readonly completeAnnouncement: string;
    };
  };
  readonly freeTyping: {
    readonly title: string;
    readonly subtitle: string;
    readonly categories: {
      readonly stories: string;
      readonly technology: string;
      readonly literature: string;
      readonly code: string;
    };
    readonly timers: {
      readonly seconds30: string;
      readonly seconds60: string;
      readonly seconds120: string;
      readonly free: string;
    };
    readonly stats: {
      readonly netWpm: string;
      readonly grossWpm: string;
      readonly accuracy: string;
      readonly errors: string;
      readonly characters: string;
      readonly elapsed: string;
      readonly remaining: string;
      readonly time: string;
    };
    readonly controls: {
      readonly pause: string;
      readonly resume: string;
      readonly reset: string;
      readonly retry: string;
      readonly newPassage: string;
      readonly close: string;
      readonly showKeyboard: string;
      readonly hideKeyboard: string;
      readonly toggleKeyboard: string;
      readonly zenMode: string;
      readonly exitZenMode: string;
      readonly quickRestart: string;
      readonly streak: string;
      readonly bestStreak: string;
      readonly cadence: string;
      readonly startNotice: string;
      readonly pauseNotice: string;
      readonly pausedAnnouncement: string;
      readonly resumedAnnouncement: string;
      readonly completedAnnouncement: string;
    };
    readonly modal: {
      readonly title: string;
      readonly summarySubtitle: string;
      readonly practiceAgain: string;
      readonly changeSetup: string;
      readonly close: string;
      readonly celebrationFlawless: string;
      readonly celebrationSpeed: string;
      readonly celebrationGreat: string;
    };
  };
  readonly modes: {
    readonly starter: string;
    readonly freeTyping: string;
    readonly dashboard: string;
  };
  readonly dashboard: {
    readonly title: string;
    readonly subtitle: string;
    readonly personalBestsTitle: string;
    readonly historyTitle: string;
    readonly filterAll: string;
    readonly filterStories: string;
    readonly filterTechnology: string;
    readonly filterLiterature: string;
    readonly filterCode: string;
    readonly stats: {
      readonly highestNetWpm: string;
      readonly bestAccuracy: string;
      readonly totalWords: string;
      readonly totalPracticeTime: string;
      readonly totalSessions: string;
    };
    readonly table: {
      readonly date: string;
      readonly category: string;
      readonly duration: string;
      readonly netWpm: string;
      readonly grossWpm: string;
      readonly accuracy: string;
      readonly errors: string;
      readonly badges: string;
      readonly noBadges: string;
    };
    readonly emptyState: {
      readonly title: string;
      readonly description: string;
      readonly cta: string;
    };
    readonly actions: {
      readonly exportData: string;
      readonly clearData: string;
      readonly confirmClear: string;
      readonly cancelClear: string;
      readonly clearSuccess: string;
      readonly exportSuccess: string;
    };
    readonly badges: {
      readonly flawless: string;
      readonly highAccuracy: string;
      readonly blazing: string;
      readonly fast: string;
      readonly steady: string;
    };
  };
  readonly theme: {
    readonly title: string;
    readonly themes: Record<ThemeId, string>;
    readonly typographyTitle: string;
    readonly typographies: Record<TypographyId, string>;
  };
  readonly audio: {
    readonly title: string;
    readonly profiles: Record<SoundProfileId, string>;
    readonly previewSound: string;
    readonly soundMuted: string;
    readonly soundActive: string;
    readonly muteToggle: string;
    readonly volume: string;
  };
}

export const translations: Record<UiLocale, OnboardingTranslations> = {
  en: {
    modes: {
      starter: "Starter Practice",
      freeTyping: "Free Typing",
      dashboard: "Dashboard",
    },
    language: {
      title: "Select UI Language",
      description:
        "Choose your preferred language for onboarding instructions and interface controls.",
      englishLabel: "English",
      spanishLabel: "Español",
      note: "Practice sequence remains fixed: English then Spanish.",
    },
    profile: {
      title: "Select Keyboard Layout Profile",
      description:
        "Select your physical keyboard layout profile. Explicit user confirmation is required.",
      suggestionWarning:
        "Auto-detection is potentially inaccurate and requires explicit confirmation.",
      confirmButton: "Confirm Layout Profile",
      profiles: {
        "windows-us-international": "Windows US International",
        "windows-latin-american-qwerty": "Windows Latin American QWERTY",
        "macos-us-international": "macOS US International",
        "macos-latin-american-qwerty": "macOS Latin American QWERTY",
      },
    },
    calibration: {
      title: "Keyboard Layout Calibration",
      description:
        "Press the exact physical key combinations shown below to verify layout mapping.",
      stepProgress: (current, total) => `Step ${current} of ${total}`,
      prompt: (code, expected) =>
        `Press physical key ${code} to produce '${expected}'`,
      modifiers: (mods) => `Modifiers required: ${mods || "None"}`,
      pauseNotice: "Press Escape to pause capture and reveal controls.",
      resumeButton: "Resume Calibration",
      retryButton: "Retry Calibration",
      statusPassed: "Passed ✓",
      statusPending: "Pending",
      statusFailed: "Failed ✗",
      statusComplete: "Complete ✓",
      pausedAnnouncement: "Calibration paused. Press Resume to continue.",
      stepPassedAnnouncement: "Step passed. Continue to next key.",
      failedAnnouncement:
        "Step calibration failed. Press Retry to restart calibration.",
      completeAnnouncement: "Calibration complete.",
    },
    guided: {
      title: "Calibration Verified",
      subtitle: "Guided exercise required before practice",
      description:
        "Your keyboard profile and calibration have been successfully saved offline.",
      lockedNotice:
        "Guided exercise and posture guidance are required. Practice shell remains locked in this phase.",
      posture: {
        title: "Ergonomic Posture Orientation",
        description:
          "Please verify and confirm all 4 core posture checkpoints before advancing.",
        progress: (confirmed, total) =>
          `${confirmed} of ${total} checkpoints confirmed`,
        confirmButton: "Continue to Finger Placement",
        checkpoints: {
          back: {
            title: "Straight Back",
            description:
              "Sit straight with your back fully supported against the chair backrest.",
          },
          feet: {
            title: "Feet Flat",
            description:
              "Keep both feet flat on the floor or supported on a footrest.",
          },
          elbows: {
            title: "90° Elbows",
            description:
              "Position elbows at an open 90-degree angle, relaxed near your body.",
          },
          wrists: {
            title: "Neutral Wrists",
            description:
              "Keep wrists straight in a neutral position without resting on hard edges.",
          },
        },
      },
      fingerPlacement: {
        title: "Home-Row Finger Placement",
        description:
          "Position your fingers on the home row keys following the recommended finger mapping.",
        leftHandTitle: "Left Hand (ASDF)",
        rightHandTitle: "Right Hand (JKL;)",
        confirmButton: "Acknowledge & Start Exercises",
        fingers: {
          pinky: "Pinky",
          ring: "Ring",
          middle: "Middle",
          index: "Index",
        },
      },
      sequence: {
        title: "Guided Typing Sequence",
        description:
          "Press each target key in order to complete the progressive typing orientation.",
        stepProgress: (current, total) => `Step ${current} of ${total}`,
        keyProgress: (current, total) => `Key ${current} of ${total}`,
        steps: {
          homeRow: { title: "Step 1: Home Row", target: "asdf jkl;" },
          topRow: { title: "Step 2: Top Row", target: "qwer uiop" },
          bottomRow: { title: "Step 3: Bottom Row", target: "zxcv bnmg" },
        },
        prompt: (key) => `Press '${key}'`,
        matchNotice: "Correct key! Moving to next key.",
        mismatchNotice: "Incorrect key. Try again.",
        completeAnnouncement: "Guided typing sequence complete!",
      },
    },
    freeTyping: {
      title: "Free Typing Practice",
      subtitle: "Choose a category and timer preset to start typing",
      categories: {
        stories: "Stories",
        technology: "Technology",
        literature: "Literature",
        code: "Code",
      },
      timers: {
        seconds30: "30s",
        seconds60: "60s",
        seconds120: "120s",
        free: "Free / Open",
      },
      stats: {
        netWpm: "Net WPM",
        grossWpm: "Gross WPM",
        accuracy: "Accuracy",
        errors: "Errors",
        characters: "Characters",
        elapsed: "Elapsed Time",
        remaining: "Time Remaining",
        time: "Time",
      },
      controls: {
        pause: "Pause Practice",
        resume: "Resume Practice",
        reset: "Reset",
        retry: "Try Again",
        newPassage: "New Passage",
        close: "Close",
        showKeyboard: "Show Keyboard",
        hideKeyboard: "Hide Keyboard",
        toggleKeyboard: "Toggle Visual Keyboard",
        zenMode: "Zen Mode",
        exitZenMode: "Exit Zen Mode",
        quickRestart: "Quick restart: Tab + Enter",
        streak: "Streak",
        bestStreak: "Best Streak",
        cadence: "WPM Cadence",
        startNotice: "Start typing to begin the countdown timer.",
        pauseNotice: "Press Escape to pause practice.",
        pausedAnnouncement: "Practice paused.",
        resumedAnnouncement: "Practice resumed.",
        completedAnnouncement: "Practice completed.",
      },
      modal: {
        title: "Session Summary",
        summarySubtitle: "Here is your practice performance summary",
        practiceAgain: "Practice Again",
        changeSetup: "Change Passage",
        close: "Close Summary",
        celebrationFlawless: "Flawless Performance!",
        celebrationSpeed: "Blazing Speed!",
        celebrationGreat: "Great Practice Session!",
      },
    },
    dashboard: {
      title: "Performance & Statistics",
      subtitle:
        "Track your typing velocity, accuracy progression, and practice history",
      personalBestsTitle: "Personal Bests & Totals",
      historyTitle: "Session History",
      filterAll: "All Categories",
      filterStories: "Stories",
      filterTechnology: "Technology",
      filterLiterature: "Literature",
      filterCode: "Code",
      stats: {
        highestNetWpm: "Highest Net WPM",
        bestAccuracy: "Best Accuracy",
        totalWords: "Total Words",
        totalPracticeTime: "Practice Time",
        totalSessions: "Completed Sessions",
      },
      table: {
        date: "Date & Time",
        category: "Category",
        duration: "Duration",
        netWpm: "Net WPM",
        grossWpm: "Gross WPM",
        accuracy: "Accuracy",
        errors: "Errors",
        badges: "Badges",
        noBadges: "Standard",
      },
      emptyState: {
        title: "No typing sessions yet",
        description:
          "Complete your first free typing session to see your stats, personal bests, and history here.",
        cta: "Start Free Typing",
      },
      actions: {
        exportData: "Export JSON",
        clearData: "Clear History",
        confirmClear:
          "Are you sure? This will delete all session history permanently.",
        cancelClear: "Cancel",
        clearSuccess: "Session history cleared successfully.",
        exportSuccess: "Session data exported.",
      },
      badges: {
        flawless: "Flawless",
        highAccuracy: "High Accuracy",
        blazing: "Blazing",
        fast: "Fast",
        steady: "Steady",
      },
    },
    theme: {
      title: "Theme",
      themes: {
        editorial: "Editorial",
        midnight: "Midnight",
        nordic: "Nordic",
        forest: "Forest",
      },
      typographyTitle: "Typography",
      typographies: {
        mono: "Monospace",
        serif: "Serif",
        sans: "Sans-Serif",
      },
    },
    audio: {
      title: "Key Acoustics",
      profiles: {
        linear: "Linear",
        clicky: "Clicky",
        "soft-bubble": "Soft Bubble",
        mute: "Mute",
      },
      previewSound: "Preview Sound",
      soundMuted: "Sound Muted",
      soundActive: "Sound Active",
      muteToggle: "Toggle Sound",
      volume: "Acoustic Volume",
    },
  },
  es: {
    modes: {
      starter: "Práctica inicial",
      freeTyping: "Mecanografía libre",
      dashboard: "Estadísticas",
    },
    language: {
      title: "Seleccionar idioma de interfaz",
      description:
        "Elige tu idioma preferido para las instrucciones y la interfaz de usuario.",
      englishLabel: "English",
      spanishLabel: "Español",
      note: "La secuencia de práctica se mantiene fija: Inglés y luego Español.",
    },
    profile: {
      title: "Seleccionar perfil de distribución de teclado",
      description:
        "Selecciona el perfil físico de tu teclado. Se requiere confirmación explícita.",
      suggestionWarning:
        "La detección automática puede ser imprecisa y requiere confirmación explícita.",
      confirmButton: "Confirmar perfil de teclado",
      profiles: {
        "windows-us-international": "Windows EE. UU. Internacional",
        "windows-latin-american-qwerty": "Windows Latinoamericano QWERTY",
        "macos-us-international": "macOS EE. UU. Internacional",
        "macos-latin-american-qwerty": "macOS Latinoamericano QWERTY",
      },
    },
    calibration: {
      title: "Calibración de distribución de teclado",
      description:
        "Presiona las combinaciones de teclas físicas indicadas a continuación para verificar la distribución.",
      stepProgress: (current, total) => `Paso ${current} de ${total}`,
      prompt: (code, expected) =>
        `Presiona la tecla física ${code} para producir '${expected}'`,
      modifiers: (mods) => `Modificadores requeridos: ${mods || "Ninguno"}`,
      pauseNotice: "Presiona Escape para pausar la captura y ver controles.",
      resumeButton: "Reanudar calibración",
      retryButton: "Reintentar calibración",
      statusPassed: "Superado ✓",
      statusPending: "Pendiente",
      statusFailed: "Fallido ✗",
      statusComplete: "Completado ✓",
      pausedAnnouncement:
        "Calibración pausada. Presiona Reanudar para continuar.",
      stepPassedAnnouncement: "Paso superado. Continúa a la siguiente tecla.",
      failedAnnouncement:
        "Paso de calibración fallido. Presiona Reintentar para reiniciar.",
      completeAnnouncement: "Calibración completada.",
    },
    guided: {
      title: "Calibración verificada",
      subtitle: "Ejercicio guiado requerido antes de practicar",
      description:
        "Tu perfil y calibración de teclado se han guardado correctamente sin conexión.",
      lockedNotice:
        "Se requiere ejercicio guiado y orientación postural. La práctica permanece bloqueada en esta fase.",
      posture: {
        title: "Orientación de postura ergonómica",
        description:
          "Por favor verifica y confirma los 4 puntos de control postural antes de avanzar.",
        progress: (confirmed, total) =>
          `${confirmed} de ${total} puntos confirmados`,
        confirmButton: "Continuar a posición de dedos",
        checkpoints: {
          back: {
            title: "Espalda recta",
            description:
              "Siéntate erguido con la espalda completamente apoyada en el respaldo.",
          },
          feet: {
            title: "Pies apoyados",
            description:
              "Mantén ambos pies planos sobre el suelo o apoyados en un reposapiés.",
          },
          elbows: {
            title: "Codos a 90°",
            description:
              "Posiciona los codos en un ángulo de 90 grados, relajados junto al cuerpo.",
          },
          wrists: {
            title: "Muñecas neutras",
            description:
              "Mantén las muñecas rectas en posición neutra sin apoyarlas en bordes rígidos.",
          },
        },
      },
      fingerPlacement: {
        title: "Posición de dedos en fila guía",
        description:
          "Coloca tus dedos sobre las teclas de la fila guía siguiendo la asignación recomendada.",
        leftHandTitle: "Mano izquierda (ASDF)",
        rightHandTitle: "Mano derecha (JKL;)",
        confirmButton: "Entendido e iniciar ejercicios",
        fingers: {
          pinky: "Meñique",
          ring: "Anular",
          middle: "Medio",
          index: "Índice",
        },
      },
      sequence: {
        title: "Secuencia de mecanografía guiada",
        description:
          "Presiona cada tecla indicada en orden para completar la orientación de mecanografía.",
        stepProgress: (current, total) => `Paso ${current} de ${total}`,
        keyProgress: (current, total) => `Tecla ${current} de ${total}`,
        steps: {
          homeRow: { title: "Paso 1: Fila guía", target: "asdf jkl;" },
          topRow: { title: "Paso 2: Fila superior", target: "qwer uiop" },
          bottomRow: { title: "Paso 3: Fila inferior", target: "zxcv bnmg" },
        },
        prompt: (key) => `Presiona '${key}'`,
        matchNotice: "¡Tecla correcta! Avanzando a la siguiente.",
        mismatchNotice: "Tecla incorrecta. Intenta de nuevo.",
        completeAnnouncement: "¡Secuencia de mecanografía guiada completada!",
      },
    },
    freeTyping: {
      title: "Práctica de mecanografía libre",
      subtitle: "Elige una categoría y temporizador para comenzar a escribir",
      categories: {
        stories: "Historias",
        technology: "Tecnología",
        literature: "Literatura",
        code: "Código",
      },
      timers: {
        seconds30: "30s",
        seconds60: "60s",
        seconds120: "120s",
        free: "Libre / Sin límite",
      },
      stats: {
        netWpm: "PPM Netas",
        grossWpm: "PPM Brutas",
        accuracy: "Precisión",
        errors: "Errores",
        characters: "Caracteres",
        elapsed: "Tiempo transcurrido",
        remaining: "Tiempo restante",
        time: "Tiempo",
      },
      controls: {
        pause: "Pausar práctica",
        resume: "Reanudar práctica",
        reset: "Reiniciar",
        retry: "Reintentar",
        newPassage: "Nuevo texto",
        close: "Cerrar",
        showKeyboard: "Mostrar teclado",
        hideKeyboard: "Ocultar teclado",
        toggleKeyboard: "Alternar teclado visual",
        zenMode: "Modo Zen",
        exitZenMode: "Salir del Modo Zen",
        quickRestart: "Reinicio rápido: Tab + Enter",
        streak: "Racha",
        bestStreak: "Mejor racha",
        cadence: "Cadencia PPM",
        startNotice: "Comienza a escribir para iniciar el temporizador.",
        pauseNotice: "Presiona Escape para pausar la práctica.",
        pausedAnnouncement: "Práctica pausada.",
        resumedAnnouncement: "Práctica reanudada.",
        completedAnnouncement: "Práctica completada.",
      },
      modal: {
        title: "Resumen de la sesión",
        summarySubtitle: "Este es el resumen de tu rendimiento de práctica",
        practiceAgain: "Practicar de nuevo",
        changeSetup: "Cambiar texto",
        close: "Cerrar resumen",
        celebrationFlawless: "¡Rendimiento impecable!",
        celebrationSpeed: "¡Velocidad impresionante!",
        celebrationGreat: "¡Excelente sesión de práctica!",
      },
    },
    dashboard: {
      title: "Rendimiento y Estadísticas",
      subtitle:
        "Sigue tu velocidad de escritura, progresión de precisión e historial de práctica",
      personalBestsTitle: "Récords Personales y Totales",
      historyTitle: "Historial de Sesiones",
      filterAll: "Todas las categorías",
      filterStories: "Historias",
      filterTechnology: "Tecnología",
      filterLiterature: "Literatura",
      filterCode: "Código",
      stats: {
        highestNetWpm: "PPM Netas Máximas",
        bestAccuracy: "Mejor Precisión",
        totalWords: "Palabras Totales",
        totalPracticeTime: "Tiempo de Práctica",
        totalSessions: "Sesiones Completadas",
      },
      table: {
        date: "Fecha y Hora",
        category: "Categoría",
        duration: "Duración",
        netWpm: "PPM Netas",
        grossWpm: "PPM Brutas",
        accuracy: "Precisión",
        errors: "Errores",
        badges: "Insignias",
        noBadges: "Estándar",
      },
      emptyState: {
        title: "Sin sesiones de práctica aún",
        description:
          "Completa tu primera sesión de mecanografía libre para ver tus estadísticas, récords e historial aquí.",
        cta: "Iniciar Mecanografía Libre",
      },
      actions: {
        exportData: "Exportar JSON",
        clearData: "Borrar Historial",
        confirmClear:
          "¿Estás seguro? Esto eliminará todo el historial de sesiones permanentemente.",
        cancelClear: "Cancelar",
        clearSuccess: "Historial de sesiones borrado exitosamente.",
        exportSuccess: "Datos de sesiones exportados.",
      },
      badges: {
        flawless: "Impecable",
        highAccuracy: "Alta Precisión",
        blazing: "Ultrarrápido",
        fast: "Rápido",
        steady: "Constante",
      },
    },
    theme: {
      title: "Tema visual",
      themes: {
        editorial: "Editorial",
        midnight: "Medianoche",
        nordic: "Nórdico",
        forest: "Bosque",
      },
      typographyTitle: "Tipografía",
      typographies: {
        mono: "Monoespaciada",
        serif: "Serifa",
        sans: "Sans-Serif",
      },
    },
    audio: {
      title: "Acústica de teclas",
      profiles: {
        linear: "Lineal",
        clicky: "Chasquido",
        "soft-bubble": "Burbuja",
        mute: "Silencioso",
      },
      previewSound: "Probar sonido",
      soundMuted: "Sonido silenciado",
      soundActive: "Sonido activo",
      muteToggle: "Alternar sonido",
      volume: "Volumen acústico",
    },
  },
};

export function getTranslation(
  locale: UiLocale = "en",
): OnboardingTranslations {
  return translations[locale] || translations.en;
}

export function setDocumentLanguage(locale: UiLocale): void {
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.lang = locale;
  }
}
