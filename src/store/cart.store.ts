import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { itemColors, itemFlowers } from '@/lib/product-options';

export interface CartItem {
  cartItemId?: string; // ID único que combina productId y personalizaciones
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  stock: number;
  isAvailable: boolean;
  /** Un color por elemento (antes se guardaban unidos con comas) */
  selectedColors?: string[];
  selectedFlowerTypes?: string[];
  /** @deprecated carritos guardados con la versión anterior */
  selectedPrimaryColor?: string;
  /** @deprecated */
  selectedSecondaryColor?: string;
  /** @deprecated */
  selectedFlowerType?: string;
  /** @deprecated */
  selectedFlowerColor?: string;
  hasLights?: boolean;
  hasButterfly?: boolean;
  hasPhraseCard?: boolean;
  /** Mensaje de la tarjeta */
  phraseText?: string;
  phraseFont?: string;
  phraseTo?: string;
  phraseFrom?: string;
  /** marfil, rosa, pergamino, noir, salvia o foto */
  phraseTheme?: string;
  /** Foto propia de fondo (data URL comprimida, ~100-250 KB). Se sube solo al confirmar el pedido. */
  cardPhoto?: string;
  /** @deprecated v2: diseño de la tarjeta */
  phraseBackground?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const generateCartItemId = (item: CartItem): string => {
  const parts = [
    item.productId,
    itemColors(item).join('+'),
    itemFlowers(item).join('+'),
    item.hasLights ? 'lights' : '',
    item.hasButterfly ? 'butterfly' : '',
    item.hasPhraseCard ? 'card' : '',
    item.phraseText || '',
    item.phraseFont || '',
    item.phraseTo || '',
    item.phraseFrom || '',
    item.phraseTheme || item.phraseBackground || '',
    // La foto no entra completa en el id: basta su tamaño y el final para distinguirla
    item.cardPhoto ? `${item.cardPhoto.length}:${item.cardPhoto.slice(-24)}` : '',
  ];
  return parts.join('|');
};

/**
 * localStorage con respaldo: si una foto de tarjeta no cabe, se guarda el carrito sin fotos
 * (siguen en memoria mientras la pestaña esté abierta) en lugar de perder todo el carrito.
 */
const safeStorage: StateStorage = {
  getItem: name => {
    try { return localStorage.getItem(name); } catch { return null; }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      try {
        const parsed = JSON.parse(value);
        parsed.state.items = parsed.state.items.map((item: CartItem) => ({ ...item, cardPhoto: undefined }));
        localStorage.setItem(name, JSON.stringify(parsed));
      } catch {
        // Sin espacio ni para el carrito: queda solo en memoria
      }
    }
  },
  removeItem: name => {
    try { localStorage.removeItem(name); } catch { /* sin almacenamiento */ }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => set((state) => {
        if (!newItem.isAvailable || newItem.stock <= 0) return state;

        const newItemId = generateCartItemId(newItem);
        const itemToAdd = { ...newItem, cartItemId: newItemId };

        const existingItem = state.items.find(item => (item.cartItemId || item.productId) === newItemId);
        if (existingItem) {
          const updatedQuantity = Math.min(existingItem.quantity + newItem.quantity, existingItem.stock);
          return {
            items: state.items.map(item =>
              (item.cartItemId || item.productId) === newItemId
                ? { ...item, quantity: updatedQuantity }
                : item
            )
          };
        }
        
        const addedItem = { ...itemToAdd, quantity: Math.min(newItem.quantity, newItem.stock) };
        return { items: [...state.items, addedItem] };
      }),

      removeItem: (cartItemId) => set((state) => ({
        items: state.items.filter(item => (item.cartItemId || item.productId) !== cartItemId)
      })),

      updateQuantity: (cartItemId, quantity) => set((state) => ({
        items: state.items.map(item => {
          if ((item.cartItemId || item.productId) === cartItemId) {
            const validQuantity = Math.max(1, Math.min(quantity, item.stock));
            return { ...item, quantity: validQuantity };
          }
          return item;
        })
      })),

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'auranova-cart-storage',
      storage: createJSONStorage(() => safeStorage),
      version: 3,
      // v1 guardaba los colores y flores como texto con comas: se convierten a listas.
      // v2 guardaba el diseño de la tarjeta como phraseBackground.
      migrate: (persisted, version) => {
        const state = persisted as { items?: CartItem[] } | undefined;
        if (!state?.items || version >= 3) return state as CartState;
        if (version === 2) {
          const items = state.items.map(item => ({ ...item, phraseTheme: item.phraseTheme ?? item.phraseBackground, phraseBackground: undefined }));
          return { ...state, items } as CartState;
        }
        const items = state.items.map(item => {
          const migrated: CartItem = {
            ...item,
            selectedColors: itemColors(item),
            selectedFlowerTypes: itemFlowers(item),
            selectedPrimaryColor: undefined,
            selectedSecondaryColor: undefined,
            selectedFlowerType: undefined,
            selectedFlowerColor: undefined,
          };
          return { ...migrated, cartItemId: generateCartItemId(migrated) };
        });
        return { ...state, items } as CartState;
      },
    }
  )
);
