"use client";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import themeReducer from "./reducers/themeSlice";
import multiCategoriesReducer from "./reducers/multiCategoriesSlice";
import cartReducer from "./reducers/cartSlice";
import locationReducer from "./reducers/locationSlice";
import settingReducer from "./reducers/settingSlice";
import userReducer from "./reducers/userDataSlice";
import helperReducer from "./reducers/helperSlice";
import translationReducer from "./reducers/translationSlice";
import reorderReducer from "./reducers/reorderSlice";
import paymentReducer from "./reducers/paymentSlice";
import chatUIReducer from './reducers/chatUISlice';
// Custom storage implementation for Next.js
const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

// Create a storage wrapper that returns Promises
const createWebStorage = () => {
  const storage = {
    getItem: (key) => {
      return new Promise((resolve) => { 
        resolve(localStorage.getItem(key));
      });
    },
    setItem: (key, item) => {
      return new Promise((resolve) => {
        resolve(localStorage.setItem(key, item));
      });
    },
    removeItem: (key) => {
      return new Promise((resolve) => {
        resolve(localStorage.removeItem(key));
      });
    },
  };
  return storage;
};

const storage =
  typeof window !== "undefined" ? createWebStorage() : createNoopStorage();

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  theme: themeReducer,
  multiCategories: multiCategoriesReducer,
  cart: cartReducer,
  location: locationReducer,
  settingsData: settingReducer,
  userData: userReducer,
  helper: helperReducer,
  translation: translationReducer,
  reorder: reorderReducer,
  payment: paymentReducer,
  chatUI: chatUIReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
