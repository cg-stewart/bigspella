import fetch, { Response } from "node-fetch";

export module WordService {
  export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

  type DictionaryResponse = {
    meta: {
      id: string;
      stems: string[];
      offensive: boolean;
    };
    fl: string; // part of speech
    shortdef: string[]; // short definitions
  }[];

  type ThesaurusResponse = {
    meta: {
      id: string;
      stems: string[];
      syns: string[][];
      ants: string[][];
      offensive: boolean;
    };
    fl: string; // part of speech
    shortdef: string[]; // short definitions
  }[];

  const WORD_LENGTH_BY_DIFFICULTY: Record<DifficultyLevel, number> = {
    EASY: 5,
    MEDIUM: 7,
    HARD: 9,
    EXPERT: 11,
  };

  // Common English words that are good for the game
  const WORD_LIST = [
    "apple", "beach", "cloud", "dance", "eagle",
    "flame", "grape", "heart", "ivory", "jumbo",
    "knife", "lemon", "music", "night", "ocean",
    "piano", "queen", "river", "storm", "table",
    // Add more words as needed
  ];

  async function getWordDetails(word: string, dictionaryApiKey: string, thesaurusApiKey: string) {
    try {
      // Get dictionary data
      const dictionaryUrl = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${dictionaryApiKey}`;
      const dictionaryRes: Response = await fetch(dictionaryUrl);
      const dictionaryData = await dictionaryRes.json() as DictionaryResponse;
      
      // Get thesaurus data
      const thesaurusUrl = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${word}?key=${thesaurusApiKey}`;
      const thesaurusRes: Response = await fetch(thesaurusUrl);
      const thesaurusData = await thesaurusRes.json() as ThesaurusResponse;

      const dictData = dictionaryData[0];
      const thesData = thesaurusData[0];

      if (!dictData || !thesData || typeof dictData === 'string' || typeof thesData === 'string') {
        throw new Error('Word not found');
      }

      return {
        word: dictData.meta.id,
        partOfSpeech: dictData.fl,
        definition: dictData.shortdef[0],
        stems: dictData.meta.stems,
        synonyms: thesData.meta.syns[0] || [],
        antonyms: thesData.meta.ants[0] || [],
        offensive: dictData.meta.offensive,
      };
    } catch (error) {
      console.error('Error getting word details:', error);
      throw error;
    }
  }

  export async function getRandomWord(
    difficulty: DifficultyLevel = "MEDIUM",
    dictionaryApiKey: string,
    thesaurusApiKey: string
  ) {
    // Get a random word from our list that matches the difficulty
    const targetLength = WORD_LENGTH_BY_DIFFICULTY[difficulty];
    const candidates = WORD_LIST.filter(word => 
      Math.abs(word.length - targetLength) <= 2 // Allow some flexibility in length
    );

    if (candidates.length === 0) {
      throw new Error(`No words found for difficulty level: ${difficulty}`);
    }

    const randomWord = candidates[Math.floor(Math.random() * candidates.length)];
    
    try {
      const wordDetails = await getWordDetails(randomWord, dictionaryApiKey, thesaurusApiKey);
      
      // Skip offensive words
      if (wordDetails.offensive) {
        return getRandomWord(difficulty, dictionaryApiKey, thesaurusApiKey);
      }

      return wordDetails;
    } catch (error) {
      console.error('Error in getRandomWord:', error);
      // If there's an error, try another word
      return getRandomWord(difficulty, dictionaryApiKey, thesaurusApiKey);
    }
  }
}
