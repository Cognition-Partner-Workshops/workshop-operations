import { createContext, useContext, useReducer } from "react";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "INCREMENT": {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    }
    case "DECREMENT": {
      const item = state.items.find((item) => item.id === action.payload);
      if (item.quantity === 1) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== action.payload),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = (product) => dispatch({ type: "ADD_TO_CART", payload: product });
  const removeFromCart = (id) => dispatch({ type: "REMOVE_FROM_CART", payload: id });
  const increment = (id) => dispatch({ type: "INCREMENT", payload: id });
  const decrement = (id) => dispatch({ type: "DECREMENT", payload: id });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart: state.items, addToCart, removeFromCart, increment, decrement, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
