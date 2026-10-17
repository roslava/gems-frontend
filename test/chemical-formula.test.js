import test from 'node:test';
import assert from 'node:assert/strict';
import { formatChemicalFormula, chemicalFormulaGroups, formatChemicalFormulasInText } from '../src/chemicalFormula.js';

test('atom counts use subscripts while hydration coefficients stay on the baseline', () => {
  assert.equal(formatChemicalFormula('CuAl6(PO4)4(OH)8·4H2O'), 'CuAl₆(PO₄)₄(OH)₈·4H₂O');
  assert.equal(formatChemicalFormula('SiO₂·nH₂O'), 'SiO₂·nH₂O');
  assert.equal(formatChemicalFormula('Fe12O3'), 'Fe₁₂O₃');
});
test('wrapping preserves complete groups and every character of the formula', () => {
  const groups = chemicalFormulaGroups('CuAl6(PO4)4(OH)8·4H2O');
  assert.deepEqual(groups, ['Cu', 'Al₆', '(PO₄)₄', '(OH)₈', '·4H₂', 'O']);
  for (const formula of ['Ca3(Al(OH)2)2', '(Ca,Na)(Al,Si)4O8', 'SiO₂·nH₂O', 'X₃Y₂(SiO₄)₃']) {
    assert.equal(chemicalFormulaGroups(formula).join(''), formatChemicalFormula(formula));
  }
});

test('composition formulas get subscripts while prose and hydration coefficients stay intact', () => {
  assert.equal(formatChemicalFormulasInText('Алюмосиликат Be3Al2Si6O18.'), 'Алюмосиликат Be₃Al₂Si₆O₁₈.');
  assert.equal(formatChemicalFormulasInText('Состав: CuAl6(PO4)4(OH)8·4H2O; 2026 год, 3 мм.'), 'Состав: CuAl₆(PO₄)₄(OH)₈·4H₂O; 2026 год, 3 мм.');
  assert.equal(formatChemicalFormulasInText('Version2, SiO₂ и H2O'), 'Version2, SiO₂ и H₂O');
});
