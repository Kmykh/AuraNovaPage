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
