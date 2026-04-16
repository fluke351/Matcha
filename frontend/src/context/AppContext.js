import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  user: null,
  currentMatch: null,
  messages: [],
  isMatching: false,
  interests: [],
  blocked: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_MATCH':
      return { ...state, currentMatch: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_IS_MATCHING':
      return { ...state, isMatching: action.payload };
    case 'SET_INTERESTS':
      return { ...state, interests: action.payload };
    case 'SET_BLOCKED':
      return { ...state, blocked: action.payload };
    default:
      return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
