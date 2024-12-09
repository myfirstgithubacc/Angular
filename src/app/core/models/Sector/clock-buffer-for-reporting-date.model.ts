import { ToJson } from '../responseTypes/to-json.model';

export class ClockBufferForReportingDate extends ToJson{
	Hours: number | undefined | null;
	Minutes: number | undefined | null;

	constructor(init?: Partial<ClockBufferForReportingDate>) {
		super();
		Object.assign(this, init);
	}
}
