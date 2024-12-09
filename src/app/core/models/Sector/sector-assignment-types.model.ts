export class SectorAssignmentType {
	Id: number | null;
	AssignmentName: string | null;
	DisplayOrder: number | null;

	constructor(init?: Partial<SectorAssignmentType>) {
		Object.assign(this, init);
	}
}
