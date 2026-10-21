import katex from 'katex';

/**
 * Rendering sicuro di stringhe LaTeX tramite KaTeX
 */
export function renderLatex(latexStr, displayMode = false) {
  try {
    return katex.renderToString(latexStr, {
      displayMode,
      throwOnError: false
    });
  } catch (e) {
    return latexStr;
  }
}
