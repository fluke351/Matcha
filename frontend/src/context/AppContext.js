import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  user: null,
  currentMatch: null,
  messagesByMatch: {},
  isMatching: false,
  interests: [],
  blocked: [],
  matches: [],
  settings: {
    notificationsEnabled: true,
    testMode: false,
  },
  privacy: {
    showOnlineStatus: true,
    shareDistance: true,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: { ...(state.user || {}), ...(action.payload || {}) } };
    case 'SET_MATCH':
      return { ...state, currentMatch: action.payload };
    case 'SET_MESSAGES':
      if (!action.payload?.matchId) return state;
      return {
        ...state,
        messagesByMatch: {
          ...state.messagesByMatch,
          [action.payload.matchId]: action.payload.messages || [],
        },
      };
    case 'ADD_MESSAGE':
      if (!action.payload?.matchId) return state;
      return {
        ...state,
        messagesByMatch: {
          ...state.messagesByMatch,
          [action.payload.matchId]: [
            ...(state.messagesByMatch[action.payload.matchId] || []).filter(m => m.id !== action.payload.id),
            action.payload,
          ],
        },
      };
    case 'SET_IS_MATCHING':
      return { ...state, isMatching: action.payload };
    case 'SET_INTERESTS':
      return { ...state, interests: action.payload };
    case 'SET_BLOCKED':
      return { ...state, blocked: action.payload };
    case 'ADD_MATCH':
      if (!action.payload) return state;
      if (state.matches.some(m => m.id === action.payload.id)) return state;
      return { ...state, matches: [action.payload, ...state.matches] };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...(action.payload || {}) } };
    case 'SET_PRIVACY':
      return { ...state, privacy: { ...state.privacy, ...(action.payload || {}) } };
    case 'LOGOUT':
      return initialState;
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
