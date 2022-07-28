import IDaoField from "./IDaoField";

export default class DaoField implements IDaoField {
    readonly fieldName: string = null;
    value: any;
    oldValue: any;

    constructor(fieldName: string, value: any) {
        this.fieldName = fieldName;
        this.value = value;
    }
}