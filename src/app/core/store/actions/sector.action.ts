// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class GetSector {
	static readonly type = '[SectorList] Get';
}

export class GetSectorAllDropdowns {
	static readonly type = '[SectorAllDropdowns] Get';
	constructor(public uKey: string) { }
}

export class GetSectorByUKey {
	static readonly type = '[Sector] Get';
	constructor(public ukey: string) { }
}

export class UpdateSectorStatus {
	static readonly type = '[SectorList] UpdateStatus';

	constructor(public payload: any) { }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SetSectorDetails {
	static readonly type = '[] Set';
}

export class ResetSectorStates {
	static readonly type = '[Sector] Set';
	constructor(public payload: any, public sectionName: any){}
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class GetExisitngSectors {
	static readonly type = '[SectorAllDropdowns] Get List';
}

export class UpdateSectorStatusStatusBar {
	static readonly type = '[SectorList] UpdateStatus';

	constructor(public payload: any) { }
}
