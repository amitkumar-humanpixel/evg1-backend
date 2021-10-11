

import { IFormA } from './formA.interface';

const requiresFileInformation: string[] = [
    "Orientation is provided to each registrar at commencement - please attach the registrar specific orientation checklist/materials used by the practice.",
    "Registrars continue to be employed to the current National Terms and Conditions for Employment of Registrars – please attach employment contract template",
    "Practice is accredited by AGPAL or QPA (not mandatory for ACRRM) – please attach certificate"
]

const requiresRemarks: string[] = [
    "Have there been changes to facilities or resources since last\naccreditation/reaccreditation visit? If yes, please provide detail."
]

export class FormAValidator
{
    constructor(
        private formAD: IFormA
    ){ }


    validateStandards() : string[] {
        
        let invalid: string[] = [];
        if(this.formAD.practiceStandards?.length > 0)
        {
            this.formAD.practiceStandards.forEach(s =>{
                
                if(s.status == 'true'){
                    //Test if this Field requires additional information or not.
                    if(requiresFileInformation.includes(s.title) && (s.filePath == null || s.filePath.length == 0)){
                        invalid.push(s.title);
                    }
                    if(requiresRemarks.includes(s.title) && (s.remarks == null || s.remarks == "")){
                        invalid.push(s.title);
                    }
                }else{
                    if(s.status != 'false'){
                        invalid.push(s.title);
                    }
                }
            });
        }

        return invalid;
    }
}