import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoleServices } from '../services/role.service';
import { EMPTY, Subject, switchMap, takeUntil } from 'rxjs';
import { Role } from '../Generictype.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	public isEditMode: boolean = false;
	private roleUkey: string|number;
	public recordId: string = '';
	public role: Role;
	permissionList: [] = [];
	AddEditEventReasonForm: FormGroup;
	private unsubscribe$: Subject<void> = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private roleService: RoleServices,
	private cdr:ChangeDetectorRef
	) {
		this.AddEditEventReasonForm = this.fb.group({});
	}
	ngOnInit(): void {
		this.getRoleDetails();
	}

	private getRoleDetails() {
		this.activatedRoute.params
			.pipe(
				takeUntil(this.unsubscribe$),
				switchMap((param) => {
					if (param['id']) {
						this.roleUkey = param['id'];
						return this.roleService
							.getRoleByUkey(this.roleUkey)
							.pipe(takeUntil(this.unsubscribe$));
					} else {
						return EMPTY;
					}
				})
			)
			.subscribe((data: GenericResponseBase<Role>) => {
				if (data.Succeeded && data.Data) {
					this.role = data.Data;
					this.recordId = this.role.RoleCode;
					this.roleService.dataContainer.next(this.role);
					this.roleService
						.GetRoleActionMappingForViewByRoleNoAsync(this.role.RoleNo)
						.pipe(takeUntil(this.unsubscribe$))
						.subscribe((value) => {
							if(value.Succeeded)
 							 	this.permissionList = value.Data;
							this.cdr.markForCheck();
						});
				}
			});
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}


