import { Fragment } from 'react';
import { chemicalFormulaGroups } from '../chemicalFormula.js';

export default function ChemicalFormula({ formula }) {
  return <span className="chemical-formula">
    {chemicalFormulaGroups(formula).map((group, index) =>
      <Fragment key={index}>{index > 0 && <wbr />}<span className="chemical-formula-group">{group}</span></Fragment>
    )}
  </span>;
}
