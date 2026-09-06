import type { UiLocale } from "../onboarding/repositories";

export const CATALOG_CATEGORIES = [
  "stories",
  "technology",
  "literature",
  "code",
] as const;

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

export type PassageDifficulty = "easy" | "medium" | "hard";

export interface CatalogPassage {
  readonly id: string;
  readonly category: CatalogCategory;
  readonly locale: UiLocale;
  readonly title: string;
  readonly text: string;
  readonly difficulty: PassageDifficulty;
}

export interface BilingualCatalogItem {
  readonly id: string;
  readonly category: CatalogCategory;
  readonly difficulty: PassageDifficulty;
  readonly en: {
    readonly title: string;
    readonly text: string;
  };
  readonly es: {
    readonly title: string;
    readonly text: string;
  };
}

export const CATALOG_ITEMS: readonly BilingualCatalogItem[] = [
  {
    id: "stories-mountain-whisper",
    category: "stories",
    difficulty: "easy",
    en: {
      title: "The Mountain's Whisper",
      text: "Every morning before sunrise, the old lighthouse keeper walked along the rocky shore. The cool ocean mist carried forgotten melodies across the waves, reminding him of distant voyages and untold stories waiting to be discovered in the quiet dawn.".normalize(
        "NFC",
      ),
    },
    es: {
      title: "El susurro de la montana",
      text: "Cada manana antes del amanecer, el viejo guardian del faro caminaba por la orilla rocosa. La suave brisa del mar traia melodias olvidadas entre las olas, recordandole viajes lejanos y relatos misteriosos que aguardaban en la penumbra del alba.".normalize(
        "NFC",
      ),
    },
  },
  {
    id: "stories-starlit-journey",
    category: "stories",
    difficulty: "medium",
    en: {
      title: "A Starlit Journey",
      text: "As night fell over the valley, thousands of fireflies lit up the ancient forest path. Clara stepped forward with curiosity, guiding her companions through the silver glow toward the hidden sanctuary nestled within the canyon.".normalize(
        "NFC",
      ),
    },
    es: {
      title: "Un viaje bajo las estrellas",
      text: "Al caer la noche sobre el valle, miles de luciernagas iluminaron el sendero del bosque milenario. Clara avanzo con curiosidad, guiando a sus companeros a traves del resplandor plateado hacia el santuario oculto entre las montanas.".normalize(
        "NFC",
      ),
    },
  },
  {
    id: "technology-keyboard-mechanics",
    category: "technology",
    difficulty: "medium",
    en: {
      title: "Keyboard Architecture & Ergonomics",
      text: "Modern input devices translate physical keystrokes into discrete digital scancodes. Optimizing switch actuation, wrist alignment, and tactile feedback significantly reduces strain while accelerating typing accuracy and neuromuscular efficiency.".normalize(
        "NFC",
      ),
    },
    es: {
      title: "Arquitectura y ergonomia del teclado",
      text: "Los teclados modernos traducen pulsaciones fisicas en codigos de escaneo digitales. Optimizar la activacion tactil, la alineacion de las munecas y la postura reduce la fatiga mientras mejora la precision y velocidad del usuario.".normalize(
        "NFC",
      ),
    },
  },
  {
    id: "technology-distributed-systems",
    category: "technology",
    difficulty: "hard",
    en: {
      title: "Distributed Systems & Consensus",
      text: "Fault-tolerant distributed architectures rely on state machine replication and consensus protocols. By maintaining deterministic event logs across isolated nodes, clusters achieve high availability and resilient synchronization.".normalize(
        "NFC",
      ),
    },
    es: {
      title: "Sistemas distribuidos y consenso",
      text: "Las arquitecturas distribuidas tolerantes a fallos emplean replicacion de maquinas de estado y protocolos de consenso. Mantener registros deterministas entre nodos aislados garantiza alta disponibilidad y sincronizacion resistente.".normalize(
        "NFC",
      ),
    },
  },
  {
    id: "literature-time-and-memory",
    category: "literature",
    difficulty: "medium",
    en: {
      title: "Of Time and Memory",
      text: "Time is a river that sweeps us along, yet we are the river; it is a tiger that tears us apart, yet we are the tiger; it is a fire that consumes us, yet we are the fire. The world, unfortunately, is real; I, unfortunately, am Borges.".normalize(
        "NFC",
      ),
    },
    es: {
      title: "Del tiempo y la memoria",
      text: "El tiempo es un rio que me arrebata, pero yo soy el rio; es un tigre que me destroza, pero yo soy el tigre; es un fuego que me consume, pero yo soy el fuego. El mundo, desgraciadamente, es real; yo, desgraciadamente, soy Borges.".normalize(
        "NFC",
      ),
    },
  },
  {
    id: "literature-don-quijote",
    category: "literature",
    difficulty: "hard",
    en: {
      title: "The Ingenious Gentleman",
      text: "In a village of La Mancha, the name of which I have no desire to call to mind, there lived not long since one of those gentlemen that keep a lance in the lance-rack, an old buckler, a lean hack, and a greyhound for coursing.".normalize(
        "NFC",
      ),
    },
    es: {
      title: "El ingenioso hidalgo",
      text: "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivia un hidalgo de los de lanza en astillero, adarga antigua, rocin flaco y galgo corredor. No es acaso la aventura el mayor honor.".normalize(
        "NFC",
      ),
    },
  },
  {
    id: "code-binary-search",
    category: "code",
    difficulty: "medium",
    en: {
      title: "Binary Search Algorithm",
      text: "function binarySearch<T>(arr: readonly T[], target: T): number { let low = 0; let high = arr.length - 1; while (low <= high) { const mid = Math.floor((low + high) / 2); if (arr[mid] === target) return mid; if (arr[mid] < target) low = mid + 1; else high = mid - 1; } return -1; }".normalize(
        "NFC",
      ),
    },
    es: {
      title: "Algoritmo de busqueda binaria",
      text: "function busquedaBinaria<T>(arr: readonly T[], clave: T): number { let inicio = 0; let fin = arr.length - 1; while (inicio <= fin) { const medio = Math.floor((inicio + fin) / 2); if (arr[medio] === clave) return medio; if (arr[medio] < clave) inicio = medio + 1; else fin = medio - 1; } return -1; }".normalize(
        "NFC",
      ),
    },
  },
  {
    id: "code-async-pipeline",
    category: "code",
    difficulty: "hard",
    en: {
      title: "Async Data Pipeline",
      text: "async function processBatch<T, R>(items: readonly T[], transform: (item: T) => Promise<R>): Promise<R[]> { const results: R[] = []; for (const item of items) { const processed = await transform(item); results.push(processed); } return results; }".normalize(
        "NFC",
      ),
    },
    es: {
      title: "Canalizacion de datos asincrona",
      text: "async function procesarLote<T, R>(elementos: readonly T[], transformar: (item: T) => Promise<R>): Promise<R[]> { const salida: R[] = []; for (const elem of elementos) { const valor = await transformar(elem); salida.push(valor); } return salida; }".normalize(
        "NFC",
      ),
    },
  },
];

export function listCatalogPassages(
  category?: CatalogCategory,
  locale?: UiLocale,
): readonly CatalogPassage[] {
  const passages: CatalogPassage[] = [];

  for (const item of CATALOG_ITEMS) {
    if (category && item.category !== category) {
      continue;
    }

    if (!locale || locale === "en") {
      passages.push({
        id: `${item.id}-en`,
        category: item.category,
        locale: "en",
        title: item.en.title,
        text: item.en.text,
        difficulty: item.difficulty,
      });
    }

    if (!locale || locale === "es") {
      passages.push({
        id: `${item.id}-es`,
        category: item.category,
        locale: "es",
        title: item.es.title,
        text: item.es.text,
        difficulty: item.difficulty,
      });
    }
  }

  return passages;
}

export function getCatalogPassage(
  category: CatalogCategory,
  locale: UiLocale,
  id?: string,
): CatalogPassage {
  const passages = listCatalogPassages(category, locale);

  if (id) {
    const found = passages.find(
      (p) => p.id === id || p.id === `${id}-${locale}` || p.id.startsWith(id),
    );
    if (found) {
      return found;
    }
  }

  if (passages.length > 0) {
    return passages[0];
  }

  // Fallback if empty category
  return {
    id: `fallback-${category}-${locale}`,
    category,
    locale,
    title: "Practice Passage",
    text: "The quick brown fox jumps over the lazy dog.",
    difficulty: "easy",
  };
}
