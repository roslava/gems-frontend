const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';

// Only atom/group counts become subscripts; hydration coefficients stay on the baseline.
export function formatChemicalFormula(formula) {
  return formula.replace(/([A-Za-z)\]₀-₉])(\d+)/g, (_, atom, count) =>
    atom + [...count].map((digit) => SUBSCRIPTS[Number(digit)]).join(''));
}

// Preserve every character, including unfamiliar notation. Balanced parentheses
// remain intact; optional breaks occur only before an element or a complete group.
export function chemicalFormulaGroups(formula) {
  const text = formatChemicalFormula(formula);
  const groups = [];
  let current = '', depth = 0;
  for (const char of text) {
    const startsGroup = /[A-Z([]/.test(char);
    const onlyPrefix = /^[·.\s\d]*$/.test(current);
    if (depth === 0 && startsGroup && current && !onlyPrefix) {
      groups.push(current);
      current = '';
    }
    if (depth === 0 && /[·.]/.test(char) && current) {
      groups.push(current);
      current = '';
    }
    current += char;
    if (char === '(' || char === '[') depth++;
    if (char === ')' || char === ']') depth = Math.max(0, depth - 1);
  }
  if (current) groups.push(current);
  return groups;
}
