import frenchBadwordsList from "french-badwords-list";

const badwords =
  frenchBadwordsList?.array ||
  frenchBadwordsList?.default ||
  [];

const badwordsRegex =
  frenchBadwordsList?.regex instanceof RegExp
    ? frenchBadwordsList.regex
    : null;

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function containsByArray(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return false;
  }

  return badwords.some((word) => {
    const normalizedWord = normalizeText(word);

    if (!normalizedWord) {
      return false;
    }

    const escaped = normalizedWord.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    return new RegExp(
      `(^|\\s)${escaped}(?=\\s|$)`,
      "i"
    ).test(normalized);
  });
}

export function containsForbiddenPresentationTerm(value) {
  const text = String(value || "");

  if (!text.trim()) {
    return false;
  }

  /*
   * french-badwords-list fournit directement une regex
   * contenant les variantes et formes de contournement
   * présentes dans sa liste.
   */
  if (badwordsRegex) {
    badwordsRegex.lastIndex = 0;

    if (badwordsRegex.test(text)) {
      badwordsRegex.lastIndex = 0;
      return true;
    }

    badwordsRegex.lastIndex = 0;
  }

  /*
   * Filet de sécurité : vérification par la liste elle-même
   * après normalisation.
   */
  return containsByArray(text);
}
