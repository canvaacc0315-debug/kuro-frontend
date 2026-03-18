export function buildPrompt(userInput, scope) {
  let scopeText = "Use the entire document.";

  if (scope?.type === "page") {
    scopeText = `Use only page ${scope.value}.`;
  }

  if (scope?.type === "range") {
    scopeText = `Use only pages ${scope.value[0]} to ${scope.value[1]}.`;
  }

  if (scope?.type === "bookmarks") {
    scopeText = "Use only bookmarked pages.";
  }

  return `
You are an AI assistant answering strictly from the PDF.

${scopeText}

Rules:
- Do not use outside knowledge
- If the PDF does not contain the answer, say so
- Be concise and accurate

User question:
${userInput}
`;
}