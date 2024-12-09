import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActionType } from '@xrm-shared/common-components/udf-implementation/constant/action-types.enum';
import { LaborCategory } from 'src/app/core/models/labor-category.model';
import { LaborCategoryService } from 'src/app/services/masters/labor-category.service';
import { NavigationPaths } from '../constant/routes-constant';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UdfCommonMethods } from '@xrm-shared/common-components/udf-implementation/common-method/udf-common-methods';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { dropdown } from '../constant/dropdown-constant';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { PermissionsService } from '@xrm-shared/services/Permissions.service';
import { LabCategory } from '../enum/enums';
import { GenericResponseBase, isSuccessfulResponse } from '@xrm-core/models/responseTypes/generic-response.interface';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	providers: [PermissionsService],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ViewComponent implements OnInit, OnDestroy {
	public laborCategory$!: Observable<LaborCategory>;
	public laborCategory: LabCategory;
	public entityID = XrmEntities.LaborCategory;
	public ukey: string;
	public recordId: string;
	public sectorId: number = magicNumber.zero;
	public recordUKey: string = '';
	public actionTypeId: number = ActionType.View;
	public pricingModelLabel: string | null;
	private ngUnsubscribe = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
		private activatedRoute: ActivatedRoute,
		public laborCategoryServc: LaborCategoryService,
		public udfCommonMethods: UdfCommonMethods,
		public route: Router,
		private toasterServc: ToasterService
	) {}

	ngOnInit(): void {
		this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((param) => {
			if (param['id']) {
				this.getById(param['id']);
				this.ukey = param["id"];
			}
		});
	}

	public getById(id: string) {
		this.laborCategoryServc.getLaborCategoryById(id).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
			next: (data: GenericResponseBase<LabCategory>) => {
				if (isSuccessfulResponse(data)) {
					this.laborCategory = data.Data;
					this.laborCategoryServc.laborDataSubject.next({'Disabled': this.laborCategory.Disabled, 'LaborCategoryCode': this.laborCategory.LaborCategoryCode, 'LaborCategoryID': this.laborCategory.Id});
					this.laborCategory.PayrollMarkUp = Number(this.laborCategory.PayrollMarkUp).toFixed(magicNumber.three);
					this.recordId = this.laborCategory.LaborCategoryCode;
					this.sectorId = this.laborCategory.SectorId;
					this.recordUKey = this.laborCategory.UKey;
					if(this.laborCategory.LaborCategoryTypeLocalizedKey == dropdown.ProfessionalRate
						 && this.laborCategory.PricingModelLocalizedKey === dropdown.BillRateBased){
						this.pricingModelLabel = dropdown.BillRateBasedPro;
					}else{
						this.pricingModelLabel=this.laborCategory.PricingModelLocalizedKey;
					}
				}
			}
		});
	}

	navigateToList() {
		this.route.navigate([NavigationPaths.list]);
	}


	ngOnDestroy() {
		this.toasterServc.resetToaster();
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

}
