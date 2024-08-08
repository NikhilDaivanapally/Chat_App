import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import { rootReducer} from "./rootReducer";
// import { persistStore } from "redux-persist";
// import { useDispatch, useSelector } from "react-redux";
const store = configureStore({
  // reducer: persistReducer(rootPersistConfig, rootReducer),
  reducer:rootReducer,
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
    apiSlice.middleware,
  ],
});
// const Persistor = persistStore(store);

export { store};
