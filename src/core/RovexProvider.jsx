import { createContext, useReducer } from "react";
import { initialRovexState } from "./rovexState";

export const RovexContext = createContext(null);

function rovexReducer(state, action) {
  switch (action.type) {
    case "SET_PDF":
      return { ...state, pdf: { ...state.pdf, ...action.payload } };

    case "ADD_CHAT_MESSAGE":
      return {
        ...state,
        chat: {
          ...state.chat,
          messages: [...state.chat.messages, action.payload],
        },
      };

    case "SET_SCOPE":
      return {
        ...state,
        chat: { ...state.chat, scope: action.payload },
      };

    case "SET_OCR_TEXT":
      return {
        ...state,
        ocr: { ...state.ocr, ...action.payload },
      };

    case "ADD_BOOKMARK":
      return {
        ...state,
        bookmarks: [...state.bookmarks, action.payload],
      };

    case "SET_STUDY_MODE":
      return {
        ...state,
        studyMode: { ...state.studyMode, ...action.payload },
      };

    default:
      return state;
  }
}

export function RovexProvider({ children }) {
  const [state, dispatch] = useReducer(rovexReducer, initialRovexState);

  return (
    <RovexContext.Provider value={{ state, dispatch }}>
      {children}
    </RovexContext.Provider>
  );
}   