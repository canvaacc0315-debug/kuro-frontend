export function calculateAnswerConfidence({ scopeSize, answerLength }) {
  if (!scopeSize || !answerLength) return "low";
  if (scopeSize > answerLength * 3) return "high";
  if (scopeSize > answerLength) return "medium";
  return "low";
}