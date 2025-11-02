
export interface MatchPrediction {
  match: string;
  prediction: string;
  popularity: string;
  form: string;
  comment: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        uri: string;
        text: string;
      }[];
    };
  };
}

// Extend Window interface for aistudio properties (for API key selection)
declare global {
  // Define the AIStudio interface for the global window properties within the global declaration
  interface AIStudio {
    // These methods are assumed to be pre-configured and always available
    // if `window.aistudio` exists, as per the coding guidelines.
    // Therefore, they should not be marked as optional.
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // The `aistudio` object itself might be optional, but if it exists,
    // its methods (`hasSelectedApiKey`, `openSelectKey`) are guaranteed.
    aistudio?: AIStudio;
  }
}