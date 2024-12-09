export class OrgTypeData {
	OrgName: string;
	IsVisible: boolean;
	IsMandatory?: boolean;

	constructor(OrgName: string, IsVisible: boolean, IsMandatory?: boolean) {
	  this.OrgName = OrgName;
	  this.IsVisible = IsVisible;
	  this.IsMandatory = IsMandatory;
	}
}
