export interface ValidationResult {
	error: boolean;
	message: string;
	toasterPlaceholder1?: string;
	toasterPlaceholder2?: string;
	index?:number;
	controlName?:string;
}
