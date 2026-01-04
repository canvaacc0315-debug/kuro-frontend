    // Global, future-proof state (NOT used yet)

export const initialRovexState = {
  pdf: {
    file: null,
    currentPage: 1,
    totalPages: 0,
    extractedText: "",
  },

  chat: {
    messages: [],
    scope: {
      type: "entire", // entire | page | range | bookmarks
      value: null,
    },
    confidence: "medium",
  },

  ocr: {
    rawText: "",
    correctedText: "",
    confidenceMap: [],
  },

  bookmarks: [],

  studyMode: {
    active: false,
    step: 0,
    progress: 0,
  },

  drive: {
    connected: false,
    files: [], // google drive metadata only
  },

  ui: {
    activePanel: null,
    animationsEnabled: true,
  },
};