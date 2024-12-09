import { ToJson } from './responseTypes/to-json.model';

export class RequisitionLibrary extends ToJson {
	Id: number;
	UKey: string;
	SectorId: number;
	SectorName: number;
	LaborCategoryId: number;
	LaborCategoryName: string;
	JobCategoryId: number;
	JobCategoryName: string;
	LocationId: number;
	LocationName: string;
	JobLevel: string;
	ReqLibraryBenefitAdders: ReqLibraryBenefitAdders[];
	PositionDesc: string;
	SkillDesc: string;
	EducationDesc: string;
	ExperienceDesc: string;
	Disabled: boolean;
	reasonForChange: string;
	CreatedBy: number;
	CreatedOn: Date;
	LastModifiedBy?: string;
	LastModifiedOn: Date;
	ReasonForChange: string;

	constructor(init?: Partial<RequisitionLibrary>) {
		super();
		Object.assign(this, init);
	}
}

export class ReqLibraryBenefitAdders extends ToJson {
	LocalizedLabelKey: string;
	Value: number;
	ReqLibraryBenefitAdderId: number;

	constructor(init?: Partial<ReqLibraryBenefitAdders>) {
		super();
		Object.assign(this, init);
	}
}
