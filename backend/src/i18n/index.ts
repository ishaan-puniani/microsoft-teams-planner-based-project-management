import _get from 'lodash/get';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Available languages in the application.
 */
const availableLanguages = ['en', 'hi', 'es'];

/**
 * Cache for loaded language dictionaries.
 */
const languageCache: { [key: string]: any } = {};

/**
 * Loads a language dictionary from JSON file.
 */
function loadLanguageDictionary(languageCode: string): any {
  // Return cached dictionary if already loaded
  if (languageCache[languageCode]) {
    return languageCache[languageCode];
  }

  try {
    // Try to load the specific language file
    const languageFilePath = path.join(
      __dirname,
      `${languageCode}.json`,
    );

    if (fs.existsSync(languageFilePath)) {
      const languageData = fs.readFileSync(
        languageFilePath,
        'utf8',
      );
      const dictionary = JSON.parse(languageData);

      // Cache the loaded dictionary
      languageCache[languageCode] = dictionary;
      return dictionary;
    }
  } catch (error) {
    console.warn(
      `Failed to load language file for '${languageCode}':`,
      error.message,
    );
  }

  // Fallback to English if specific language not found
  if (languageCode !== 'en') {
    return loadLanguageDictionary('en');
  }

  // If even English fails, return empty object
  console.error(
    'Could not load any language dictionary, including fallback English',
  );
  return {};
}

/**
 * Replaces the parameters of a message with the args.
 */
function format(message: string, args: any[]): string {
  if (!message) {
    return '';
  }

  return message.replace(
    /{(\d+)}/g,
    function (match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match;
    },
  );
}

/**
 * Checks if the key exists on the language.
 */
export const i18nExists = (
  languageCode: string,
  key: string,
): boolean => {
  const dictionary = loadLanguageDictionary(languageCode);
  const message = _get(dictionary, key);
  return Boolean(message);
};

/**
 * Returns the translation based on the key.
 */
export const i18n = (
  languageCode: string,
  key: string,
  ...args: any[]
): string => {
  const dictionary = loadLanguageDictionary(languageCode);
  const message = _get(dictionary, key);

  if (!message) {
    return key;
  }

  return format(message, args);
};

/**
 * Gets available languages.
 */
export const getAvailableLanguages = (): string[] => {
  return [...availableLanguages];
};

/**
 * Preloads a language dictionary for better performance.
 */
export const preloadLanguage = (
  languageCode: string,
): void => {
  loadLanguageDictionary(languageCode);
};

/**
 * Clears the language cache.
 */
export const clearLanguageCache = (): void => {
  Object.keys(languageCache).forEach((key) => {
    delete languageCache[key];
  });
};
