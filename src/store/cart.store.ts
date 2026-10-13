import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  phraseText?: string;
  phraseFont?: string;
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
    item.phraseBackground || ''
  ];
  return parts.join('|');
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
      version: 2,
      // v1 guardaba los colores y flores como texto con comas: se convierten a listas
      migrate: (persisted, version) => {
        const state = persisted as { items?: CartItem[] } | undefined;
        if (!state?.items || version >= 2) return state as CartState;
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
