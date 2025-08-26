// import { createBrowserHistory } from 'history';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import thunkMiddleware from 'redux-thunk';
import History from 'src/history';
// import { createMemoryRouter } from 'react-router';
import initializers from 'src/modules/initializers';
import createRootReducer from 'src/modules/reducers';

let store;

export function configureStore(preloadedState?) {
  const middlewares = [
    thunkMiddleware,
    // routerMiddleware(history),
  ].filter(Boolean);

  store = createStore(
    createRootReducer(),
    preloadedState,
    composeWithDevTools(applyMiddleware(...middlewares)),
  );

  for (const initializer of initializers) {
    initializer(store);
  }

  return store;
}

export const getHistory = () => {
  return {
    push: (path) => {
      History.push(path);
    },
  };
};

export default function getStore() {
  return store;
}
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
