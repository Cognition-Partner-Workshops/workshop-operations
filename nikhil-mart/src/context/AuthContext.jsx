import { createContext, useContext, useReducer } from "react";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "LOGOUT":
      return { ...state, user: null, isAuthenticated: false };
    case "UPDATE_PROFILE":
      return { ...state, user: { ...state.user, ...action.payload } };
    case "ADD_ADDRESS":
      return {
        ...state,
        user: {
          ...state.user,
          addresses: [...(state.user.addresses || []), { ...action.payload, id: Date.now() }],
        },
      };
    case "REMOVE_ADDRESS":
      return {
        ...state,
        user: {
          ...state.user,
          addresses: state.user.addresses.filter((a) => a.id !== action.payload),
        },
      };
    case "SET_DEFAULT_ADDRESS":
      return {
        ...state,
        user: {
          ...state.user,
          addresses: state.user.addresses.map((a) => ({
            ...a,
            isDefault: a.id === action.payload,
          })),
        },
      };
    case "ADD_ORDER":
      return {
        ...state,
        user: {
          ...state.user,
          orders: [action.payload, ...(state.user.orders || [])],
        },
      };
    case "TOGGLE_WISHLIST": {
      const exists = (state.user.wishlist || []).includes(action.payload);
      return {
        ...state,
        user: {
          ...state.user,
          wishlist: exists
            ? state.user.wishlist.filter((id) => id !== action.payload)
            : [...(state.user.wishlist || []), action.payload],
        },
      };
    }
    default:
      return state;
  }
};

const defaultUser = {
  name: "",
  email: "",
  phone: "",
  addresses: [],
  orders: [],
  wishlist: [],
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
  });

  const login = (userData) =>
    dispatch({
      type: "LOGIN",
      payload: { ...defaultUser, ...userData },
    });
  const logout = () => dispatch({ type: "LOGOUT" });
  const updateProfile = (data) => dispatch({ type: "UPDATE_PROFILE", payload: data });
  const addAddress = (address) => dispatch({ type: "ADD_ADDRESS", payload: address });
  const removeAddress = (id) => dispatch({ type: "REMOVE_ADDRESS", payload: id });
  const setDefaultAddress = (id) => dispatch({ type: "SET_DEFAULT_ADDRESS", payload: id });
  const addOrder = (order) => dispatch({ type: "ADD_ORDER", payload: order });
  const toggleWishlist = (productId) => dispatch({ type: "TOGGLE_WISHLIST", payload: productId });
  const isInWishlist = (productId) => (state.user?.wishlist || []).includes(productId);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        login,
        logout,
        updateProfile,
        addAddress,
        removeAddress,
        setDefaultAddress,
        addOrder,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
