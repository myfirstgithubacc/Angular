
import { ToJson } from '../responseTypes/to-json.model';
type nullableBoolean = boolean | undefined | null;
type nullableNumber = number | undefined | null;

export class PasswordPolicy extends ToJson{

	UKey: string|null|undefined;
	ReqUppercase: nullableBoolean;
	ReqLowercase: nullableBoolean;
	ReqNonAlphanumeric: nullableBoolean;
	ReqDigit: nullableBoolean;
	ReqLength: nullableNumber;
	SuspendedPeriod: nullableNumber;
	PwdExpiryPeriod: nullableNumber;
	PwdExpiryNotification: nullableNumber;
	AccLockedMaxFailedAttempts: nullableNumber;
	AccLockedDuration: nullableNumber;
	ReasonForChange : string| null| undefined;


	constructor(init?: Partial<PasswordPolicy>) {
		super();
		Object.assign(this, init);
	}
}
