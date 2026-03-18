export function detectLowConfidenceText(text) {
  const issues = [];

  [...text].forEach((char, index) => {
    if (/[^\w\s.,;:!?'"()-]/.test(char)) {
      issues.push({
        start: index,
        end: index + 1,
        level: "low",
      });
    }
  });

  return issues;
}