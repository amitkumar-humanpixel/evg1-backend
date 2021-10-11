

export class ValidationError implements Error
{
    name: string;
    message: string;
    validation: string[];
    stack?: string;

    constructor(_msg: string, _val: string[]){
        this.name = "VALIDATION_FAILED";
        this.message = _msg;
        this.validation = _val ?? [];
    }
}