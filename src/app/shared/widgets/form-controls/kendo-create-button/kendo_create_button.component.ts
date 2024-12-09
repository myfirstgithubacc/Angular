import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { Permission } from '@xrm-shared/enums/permission.enum';
import { DynamicParam } from '@xrm-shared/services/Localization/DynamicParam.interface';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { MenuService } from '@xrm-shared/services/menu.service';
import { Subject, Subscription, of, takeUntil } from 'rxjs';

@Component({selector: 'app-kendo-create-button',
	templateUrl: './kendo_create_button.component.html',
	styleUrls: ['./kendo_create_button.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoCreateButtonComponent implements OnInit {
	@Input() buttonName: string = '';

	@Input() buttonIcon: string = '';
    @Input() xrmEntityId: number = magicNumber.zero;
    @Input() subEntityId: number = magicNumber.zero;

	@Input() isDisable: boolean;

	@Input() dynamicParams: DynamicParam[] = [];

	@Input() buttonLocalizeParam: DynamicParam[] = [];

	@Output() Click: EventEmitter<boolean> = new EventEmitter<boolean>();

	authActionIdList=[
		Permission.CREATE_EDIT__CREATE,
		Permission.CREATE_EDIT_MSP_USER__CREATE,
		Permission.CREATE_EDIT_CLIENT_USER__CREATE,
		Permission.CREATE_EDIT_STAFFING_AGENCY_USER__CREATE
	];

	isRendered: boolean=false;
	private unsubscribe$ = new Subject<void>();

	constructor(private localizationService: LocalizationService, private menuService: MenuService, private permissionService: PermissionsService) { }

	ngOnInit(): void {

		if(this.xrmEntityId!=Number(magicNumber.zero))
			this.getPermission();
	}

	onclick() { this.Click.emit(true); }

	getObject(): any {
		
		if (this.buttonLocalizeParam.length == Number(magicNumber.zero)) return null;
		return this.localizationService.GetParamObject(this.buttonLocalizeParam);
	}

	getPermission(){
  	this.menuService.getActionList(this.xrmEntityId).pipe(takeUntil(this.unsubscribe$)).subscribe((res: ApiResponse) => {
  		this.permissionService.permission=res.Data.EntityActions;
  		this.isRendered = this.authActionIdList.some((actionId: number) =>
  					this.doesValueExist(actionId));
  	});
	}

	doesValueExist(actionId: number): boolean {

		if(this.subEntityId!=Number(magicNumber.zero))
			return this.permissionService.permission.some((obj: {ActionId: number, EntityTypeId: number}) =>
				obj.ActionId == actionId && obj.EntityTypeId == this.subEntityId);
		else
  	return this.permissionService.permission.some((obj: {ActionId: number}) =>
  		obj.ActionId == actionId);
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
