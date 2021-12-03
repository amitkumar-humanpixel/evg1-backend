import { IFormB } from 'src/FormB/formB.interface';

export interface IFormBTemp extends Document, IFormB {
  isDeclarationComplete: boolean;
  isSummaryComplete: boolean;
}
