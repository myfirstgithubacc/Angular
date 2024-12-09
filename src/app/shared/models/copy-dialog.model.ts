/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable line-comment-position */
export interface DialogData {
    type: 'upload' | 'dropdown'; // Specifies that type can only be 'upload' or 'dropdown'
    controlName: string; // Name of the form control
    notRequired?: boolean; // Optional boolean indicating if the control is not required
    validationMessage?: string; // Optional validation message for the control
    validationMessageDynamicParam?: any; // Optional dynamic parameter for validation message
    IsTreePresent?: boolean; // Optional boolean indicating if TreeValues control is present
}
export interface DialogActionButton{
    text: string;
    value: any;
    btnLocalizaedParam?: any;
    themeColor?: string;
    Id?: string;
}
