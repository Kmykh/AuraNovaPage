import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  stock: number;
  isAvailable: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => set((state) => {
        if (!newItem.isAvailable || newItem.stock <= 0) return state;

        const existingItem = state.items.find(item => item.productId === newItem.productId);
        if (existingItem) {
          const updatedQuantity = Math.min(existingItem.quantity + newItem.quantity, existingItem.stock);
          return {
            items: state.items.map(item =>
              item.productId === newItem.productId
                ? { ...item, quantity: updatedQuantity }
                : item
            )
          };
        }
        
        const addedItem = { ...newItem, quantity: Math.min(newItem.quantity, newItem.stock) };
        return { items: [...state.items, addedItem] };
      }),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.productId !== productId)
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item => {
          if (item.productId === productId) {
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
