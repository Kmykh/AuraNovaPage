/** Departamentos del Perú (y la Provincia Constitucional del Callao), para envíos nacionales. */
export const PERU_DEPARTMENTS = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica',
  'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua',
  'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali',
] as const;

/** Agencias con las que se despachan los envíos nacionales. */
export const SHIPPING_AGENCIES = ['Shalom', 'Olva'] as const;
export type ShippingAgency = (typeof SHIPPING_AGENCIES)[number];

/** DNI: 8 dígitos. */
export const isValidDni = (value: string) => /^\d{8}$/.test(value.replace(/\s/g, ''));

/** Departamento → provincia → distritos (INEI, con tildes). */
export type Ubigeo = Record<string, Record<string, string[]>>;

let ubigeoPromise: Promise<Ubigeo> | null = null;

/** Se descarga solo cuando el cliente elige envío a provincias (~10 KB comprimido, en su propio archivo). */
export function loadUbigeo(): Promise<Ubigeo> {
  ubigeoPromise ??= import('@/data/ubigeo-pe.json').then(module => module.default as Ubigeo);
  return ubigeoPromise;
}

/** Sin tildes ni mayúsculas, para buscar "carabayllo" o "junin". */
export const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export interface DistrictMatch {
  department: string;
  province: string;
  district: string;
}

/** Busca un distrito en todo el Perú: "carabayllo" → Lima · Lima · Carabayllo. Primero los que empiezan igual. */
export function searchDistricts(data: Ubigeo, query: string, limit = 8): DistrictMatch[] {
  const term = normalizeText(query);
  if (term.length < 2) return [];

  const starts: DistrictMatch[] = [];
  const contains: DistrictMatch[] = [];
  for (const [department, provinces] of Object.entries(data)) {
    for (const [province, districts] of Object.entries(provinces)) {
      for (const district of districts) {
        const name = normalizeText(district);
        if (name.startsWith(term)) starts.push({ department, province, district });
        else if (name.includes(term)) contains.push({ department, province, district });
      }
    }
  }
  return [...starts, ...contains].slice(0, limit);
}
