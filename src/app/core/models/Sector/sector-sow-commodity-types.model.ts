export class SectorSowCommodityType {
	Id: number;
	SowCommodityConfigId: number | null;
	CommodityTypeName?: string | null;
	CurrentCommodityTypeName: string | null;
	Active: boolean;

	constructor(init?: Partial<SectorSowCommodityType>) {
		Object.assign(this, init);
	}
}
