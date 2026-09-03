import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  cartItemId?: string; // ID único que combina productId y personalizaciones
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  stock: number;
  isAvailable: boolean;
  selectedPrimaryColor?: string;
  selectedSecondaryColor?: string;
  selectedFlowerType?: string;
  selectedFlowerColor?: string;
  hasLights?: boolean;
  hasButterfly?: boolean;
  hasPhraseCard?: boolean;
  phraseText?: string;
  phraseFont?: string;
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
    item.selectedPrimaryColor || '',
    item.selectedSecondaryColor || '',
    item.selectedFlowerType || '',
    item.selectedFlowerColor || '',
    item.hasLights ? 'lights' : '',
    item.hasButterfly ? 'butterfly' : '',
    item.hasPhraseCard ? 'card' : '',
    item.phraseText || '',
    item.phraseFont || ''
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
    }
  )
);
