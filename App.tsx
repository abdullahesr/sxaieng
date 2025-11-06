import React, { useState, useCallback, useEffect } from 'react';
import { getPopularPredictions } from './services/geminiService';
import { MatchPrediction } from './types';
import MatchTable from './components/MatchTable';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTopButton from './components/ScrollToTopButton'; // Import the new component

function App() {
  // TEMPORARY: API key added directly for testing. Please remove for production and use environment variables.
  const TEMPORARY_API_KEY = 'AIzaSyBtGAxV-9zbvgC14XD1aZUKr-K4OYq0D6E';

  const [predictions, setPredictions] = useState<MatchPrediction[]>([]);
  const [sourceUrls, setSourceUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rawOutput, setRawOutput] = useState<string | null>(null); // For debugging/displaying raw output if parsing fails

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPredictions([]);
    setSourceUrls([]);
    setRawOutput(null); // Clear raw output on new fetch
    try {
      // Check if API key is selected via window.aistudio (as per guidelines for some models, good practice here)
      // Note: This check might be redundant if TEMPORARY_API_KEY is always used, but kept for future flexibility.
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey && typeof window.aistudio.openSelectKey === 'function') {
          console.warn("API key not selected. Opening selection dialog.");
          await window.aistudio.openSelectKey();
          // After prompting, assume selection was successful and proceed.
          // If the subsequent API call fails, the error handler will catch "Requested entity was not found."
        }
      }

      const result = await getPopularPredictions(TEMPORARY_API_KEY); // Pass the temporary API key
      setPredictions(result.predictions);
      setSourceUrls(result.sourceUrls);
      setRawOutput(result.rawTextOutput);

      if (result.predictions.length === 0 && result.rawTextOutput.includes("No popular matches found for today.")) {
         setError("No popular matches found for today. Please try again later.");
      } else if (result.predictions.length === 0 && !result.rawTextOutput.includes("No popular matches found for today.")) {
        // Generic error if no predictions but no specific message from AI
        setError("There was a problem fetching popular predictions or no suitable data was found. Please try again.");
      }

    } catch (err) {
      console.error("Failed to fetch predictions in App:", err);
      // If the error message indicates key issue after openSelectKey, prompt again.
      if ((err as Error).message.includes("API Key selection required")) {
         setError("API key selection failed or is required. Please click the 'Run SxAI' button again to select the key.");
      } else {
         setError(`An error occurred while fetching predictions: ${(err as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps - fetchPredictions is memoized, but its dependencies are stable.

  useEffect(() => {
    // Initial fetch when component mounts
    fetchPredictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="relative w-full max-w-4xl text-center py-6 bg-white shadow-md rounded-lg mb-8">
        {/* Back button added here */}
        <a
          href="https://codertv.xyz/engai/main-home.html"
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
          aria-label="Go Back"
          title="Go Back to Home Page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </a>

        <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight sm:text-5xl flex items-center justify-center">
          <img
            src="https://media.lordicon.com/icons/wired/gradient/2512-artificial-intelligence-ai-alt.gif"
            alt="SxAI Logo"
            className="inline-block h-16 w-16 sm:h-24 sm:w-24 mr-3"
          />
          SxAI
        </h1>
        <p className="mt-3 text-xl text-gray-600">Today's Popular Betting Analysis</p>
        <p className="mt-1 text-lg text-gray-500 italic">Sx finds the most played matches of the day for you</p>
      </header>

      <main className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-6 sm:p-8 lg:p-10 mb-8">
        <div className="flex justify-center mb-6 sticky top-4 z-10"> {/* Sticky call-to-action */}
          <button
            onClick={fetchPredictions}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-lg sm:text-xl"
          >
            {loading ? 'Sx is Working...' : 'Run SxAI'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded break-words" role="alert">
            <p className="font-bold">Error!</p>
            <p className="break-words">{error}</p>
            {/* Optionally display raw output for debugging if an error occurred */}
            {rawOutput && (
                <div className="mt-4 text-sm text-red-600">
                    <p className="font-semibold">Raw Output (For Debugging):</p>
                    <pre className="whitespace-pre-wrap break-words bg-red-50 p-2 rounded-md max-h-48 overflow-auto">{rawOutput}</pre>
                </div>
            )}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {predictions.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center border-b-2 pb-2 border-blue-200">
                  🔥 Today's Popular Predictions
                </h2>
                <MatchTable predictions={predictions} />

                {sourceUrls.length > 0 && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow-inner border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Sources:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 px-3">
                      {sourceUrls.map((url, index) => (
                        <li key={index} className="break-all">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            {!loading && !error && predictions.length === 0 && (
                <p className="text-center text-gray-600 mt-4 text-lg">
                    Popular match predictions have not been loaded yet. Click the "Run SxAI" button to start!
                </p>
            )}
          </>
        )}
      </main>

      <footer className="w-full max-w-4xl mt-8 py-4 text-center text-gray-500 text-sm border-t border-gray-200">
        Developed by Eser Software SxAI
      </footer>
      <ScrollToTopButton /> {/* Add the scroll to top button */}
    </div>
  );
}

export default App;
