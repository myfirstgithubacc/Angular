type nullableString = string | null;
export class SectorBackground {
	Id: number | null;
	ComplianceType: nullableString;
	ComplianceFieldName: nullableString;
	ComplianceItemLabel: nullableString;
	IsVisibleToClient: boolean|null;
	IsApplicableForProfessional: boolean|null;
	IsApplicableForLi: boolean|null;
	IsApplicableForSow: boolean|null;
	IsMandatorySign: boolean|null;
	IsShowHide: boolean|null;
	DisplayOrder: number | null;

	constructor(init?: Partial<SectorBackground>) {
		Object.assign(this, init);
	}
}
