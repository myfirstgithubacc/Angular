import { FormControl, FormGroup } from '@angular/forms';

export function candiateDetailsModel() {
    return new FormGroup({
        FirstName: new FormControl<string | null>(null),
        MiddleName: new FormControl<string | null>(null),
        LastName: new FormControl<string | null>(null),
        Email: new FormControl<string | null>(null),
        PhoneNumber: new FormControl<number | null>(null),
        PhoneExt: new FormControl<number | null>(null),
    });
}
