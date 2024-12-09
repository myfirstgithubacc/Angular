
import { ToJson } from '../models/responseTypes/to-json.model';

export class Contractor extends ToJson {
	Id:number;
	UKey:string;
	Code: string;
	FirstName: string;
	LastName: string;
	MiddleName: string;
	FullName: string;
	UID: string;
	StatusName:string;
	AddedToDNR: boolean;
	WorkEmail: string;
	CreatedBy: number;
	CreatedOn: Date;
	LastModifiedBy: number;
	LastModifiedOn: Date;
	Disabled: boolean;
	PhoneNoExtension: string;
	ReasonForChange: string;
	constructor(init?: Partial<Contractor>) {
		super();
		Object.assign(this, init);
	}
}
