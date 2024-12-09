export class SectorRfxStandardField {
	Id: number;
	RfxLabelId: number | undefined | null;
	DisplayName: string | null;
	StandardFieldName?: string | null;

	constructor(init?: Partial<SectorRfxStandardField>) {
		Object.assign(this, init);
	}
}
