import { ToJson } from '../responseTypes/to-json.model';

export class ClockBufferForShiftStart extends ToJson{
	Hours: number | undefined | null;
	Minutes: number | undefined | null;

	constructor(init?: Partial<ClockBufferForShiftStart>) {
		super();
		Object.assign(this, init);
	}
}
