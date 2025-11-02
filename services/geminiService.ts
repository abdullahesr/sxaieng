import { GoogleGenAI, GenerateContentResponse, GroundingChunk as GenAIGroundingChunk } from "@google/genai";
import { MatchPrediction, GroundingChunk } from '../types';

interface GetPredictionsResult {
  predictions: MatchPrediction[];
  sourceUrls: string[];
  rawTextOutput: string; // To aid debugging if parsing fails
}

/**
 * Parses a Markdown table string into an array of MatchPrediction objects.
 * Assumes the input Markdown table follows the specified format.
 * @param markdown The Markdown table string.
 * @returns An array of MatchPrediction objects.
 */
const parseMarkdownTable = (markdown: string): MatchPrediction[] => {
  const lines = markdown.split('\n')
                      .map(line => line.trim())
                      .filter(line => line.startsWith('|') && !line.startsWith('|-'));

  if (lines.length < 1) {
    console.warn("No data rows found or invalid markdown table format.");
    return [];
  }

  // The first line is the header, subsequent lines are data rows.
  // Example: | Match | Prediction | Popularity | Form | Short Comment |
  const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
  const dataRows = lines.slice(1); // Data starts after the header and separator line (which was filtered out).

  const predictions: MatchPrediction[] = [];
  dataRows.forEach(row => {
    const cells = row.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length === headers.length) {
      predictions.push({
        match: cells[0],
        prediction: cells[1],
        popularity: cells[2],
        form: cells[3],
        comment: cells[4].replace(/^“|”$/g, ''), // Remove leading/trailing quotes from comment
      });
    } else {
      console.warn("Row cells count mismatch with header count. Skipping row:", row);
    }
  });

  return predictions;
};


export const getPopularPredictions = async (tempApiKey?: string): Promise<GetPredictionsResult> => {
  // Use temporary API key if provided, otherwise fall back to environment variable
  const apiKeyToUse = tempApiKey || process.env.API_KEY;

  if (!apiKeyToUse) {
    throw new Error("API_KEY is not defined. Please ensure it's set in the environment or provided temporarily.");
  }

  // Create a new instance of GoogleGenAI before each API call to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: apiKeyToUse });

  const prompt = `You are a highly analytical sports betting expert. Your task is to find the most popular football (soccer) matches for today and their most wagered predictions from online sources.

Perform a Google Search to find current popular betting matches and their most common predictions (e.g., "Home Win", "Draw", "Away Win", "Over/Under 2.5").

After finding the information, present it in a table format with the following columns in English:
- Match: The names of the two teams playing (e.g., "Manchester City vs Liverpool")
- Prediction: The most popular betting prediction (e.g., "Home Win", "Draw", "Over 2.5")
- Popularity: The estimated popularity or percentage of bets for this prediction (e.g., "68%", "Very Popular"). If an exact percentage is not available, provide a qualitative measure.
- Form: A brief summary of the teams' recent performance (e.g., "Man City: 4 wins in last 5 matches")
- Short Comment: A concise, analytical comment in a "coach language" style. This comment should highlight why the prediction is popular, considering recent form, and potentially include a subtle warning about popular predictions. Examples: "Home team is in form, a popular choice", "High probability of a draw, popular pick", "Caution: Popular bets don't always win, consider your own analysis."

The output MUST be in a Markdown table format, exactly like this example:

| Match | Prediction | Popularity | Form | Short Comment |
|---|---|---|---|---|
| Manchester City vs Liverpool | Home Win | 68% | Man City: 4 wins in last 5 matches | “Home team is in form, a popular choice” |
| Arsenal vs Chelsea | Draw | 52% | Arsenal: 3W-1D-1L, Chelsea: 2W-2D-1L | “High probability of a draw, popular pick” |

Focus on clarity and conciseness for each entry. Only include matches for today. If no popular matches are found, state "No popular matches found for today."`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const rawText = response.text;
    const predictions = parseMarkdownTable(rawText);

    const sourceUrls: string[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        // Cast to our custom GroundingChunk if needed, or use GenAIGroundingChunk directly
        (response.candidates[0].groundingMetadata.groundingChunks as GenAIGroundingChunk[]).forEach((chunk: GenAIGroundingChunk) => {
            if (chunk.web?.uri) {
                sourceUrls.push(chunk.web.uri);
            }
        });
    }

    return { predictions, sourceUrls, rawTextOutput: rawText };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Check for "Requested entity was not found." for API key re-selection
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
        // Assume window.aistudio is available in this environment
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            console.log("API key invalid or not selected. Prompting user to select key.");
            // Open key selection dialog and assume success for subsequent calls in this session.
            await window.aistudio.openSelectKey();
            throw new Error("API Key selection required. Please try again after selecting.");
        }
    }
    throw new Error(`Failed to fetch predictions: ${(error as Error).message}`);
  }
};