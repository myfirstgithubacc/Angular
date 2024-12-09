import { ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { UserRole } from '../user/enum/enums';
import { FieldlevelAuthorizationService } from 'src/app/services/masters/fieldlevelAuthorization.service';
import { Subject, takeUntil } from 'rxjs';

@Component({selector: 'app-FieldLevelAuth',
	templateUrl: './FieldLevelAuth.component.html',
	styleUrls: ['./FieldLevelAuth.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldLevelAuthComponent implements OnInit, OnChanges, OnDestroy {

	isEditMode: boolean = true;
	public entityType='';
	public entityId = XrmEntities.OrgLevel4;
	userDetails: any;
	AddEditUserForm: FormGroup;
	userTypeList = [
		{
			"Text": 'MSP User',
			"Value": UserRole.MSP
		},
		{
			"Text": 'Staffing Agency User',
			"Value": UserRole.StaffingAgency
		},
		{
			"Text": 'Client Users',
			"Value": UserRole.Client
		}
	];

	private unsubscribe$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
    private fb: FormBuilder,
    private fieldLevelService: FieldlevelAuthorizationService,
    private changeDetector: ChangeDetectorRef
	) {

	}
	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		this.unsubscribe$.unsubscribe();
	}

	ngOnChanges(): void {
		this.isEditMode=true;
	}

	ngOnInit() {
		this.AddEditUserForm = this.fb.group({
			RoleGroupId: [null],
			UserEmail: [null],
			UserAlternatePhoneNumber: [null],
			UserName: [null]
		});

	}

	getUserDetails() {
		// eslint-disable-next-line prefer-const
		let id = this.AddEditUserForm.get("RoleGroupId")?.value.Value;
  	this.fieldLevelService.getUserDetailsbyUserNumber(id).pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
  		if(data.Succeeded){
  			this.userDetails = data.Data;
				this.isEditMode=true;
				this.AddEditUserForm.get("UserEmail")?.setValue(this.userDetails?.UserEmail);
				this.AddEditUserForm.get("UserAlternatePhoneNumber")?.setValue(this.userDetails?.UserAlternatePhoneNumber);
				this.AddEditUserForm.get("UserName")?.setValue(this.userDetails?.UserName);

				this.changeDetector.detectChanges();
  		}
  	});
	}

	onChangeUserGroup(data: any){
		this.isEditMode=false;
		this.getUserDetails();
		this.entityType=data.Value.toString();
		this.changeDetector.detectChanges();
	}

}
