import { Injectable, OnDestroy } from '@angular/core';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { ViewComponent } from '../../candidate-pool/view/view.component';
import { ListComponent } from '../../candidate-pool/list/list.component';
import { Subject, takeUntil } from 'rxjs';
import { GridConfiguration } from '@xrm-shared/services/common-constants/gridSetting';
import { SubmittalsService } from './submittals.service';
import { ActivatedRouteResponse, CandidateDetails, ICandidateData } from './Interfaces';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ParentEntity } from '../../Constants/ParentEntity.enum';
import { NavigationStart, Router } from '@angular/router';


@Injectable({
	providedIn: 'root'
})
export class SubmittalsPopUpService implements OnDestroy {

	private dialogRefList: DialogRef;
	private dialogRefView: DialogRef;
	private unsubscribe$: Subject<void> = new Subject<void>();


	constructor(
    private dialogService: DialogService,
    private gridConfiguration: GridConfiguration,
    private submittalService: SubmittalsService,
    private router: Router
	)
	{
		this.router.events.pipe(takeUntil(this.unsubscribe$)).subscribe((event) => {
			if (event instanceof NavigationStart) {
				this.dialogRefList.close();
				this.dialogRefView.close();
			}
		});
	}

	public openDialogBox(): void{
		const actionItemsTrue = this.gridConfiguration.showViewEditIcon(this.onView.bind(this), 'Fill'),
			actionItemsFalse = this.gridConfiguration.showViewEditIcon(this.onView.bind(this), this.onAddEdit.bind(this), 'Fill'),
			actionList = [
				{
					Status: true,
					Items: actionItemsTrue
				},
				{
					Status: false,
					Items: actionItemsFalse
				}
			];
		this.dialogRefList = this.dialogService.open({
			title: '<span class="k-icon k-i-close" (click)="closeDialog()"></span>',
			content: ListComponent,
			cssClass: 'fill-requestv2-dialog fill-requestv2-dialog-popup'
		});
		this.dialogRefList.content.instance.overrideActions = true;
		this.dialogRefList.content.instance.showTabs = false;
		this.dialogRefList.content.instance.ActionList = actionList;
		this.dialogRefList.content.instance.parentEntity = ParentEntity.Submittal;
	}

	private onView(dataItem: CandidateDetails): void {
		this.openDialogView(dataItem.UKey);
	}

	private onAddEdit(candidateDataItem: CandidateDetails): void {
		this.submittalService.getCandidateByUkey(candidateDataItem.UKey)
			.pipe(takeUntil(this.unsubscribe$)).subscribe((res:GenericResponseBase<ICandidateData>) => {
				if(res.Succeeded && res.Data){
					this.submittalService.CandidateDetailsFromPool.next(res.Data);
				}
			});
		this.dialogRefList.close();

	}

	private openDialogView(id: string): void {
		this.dialogRefView = this.dialogService.open({
			title: '<span class="k-icon k-i-close" (click)="closeDialog()"></span>',
			content: ViewComponent,
			cssClass: 'fill-requestv2-dialog fill-requestv2-dialog-popup'
		});
		this.dialogRefView.content.instance.parentEntity = ParentEntity.Submittal;
		this.dialogRefView.content.instance.activatedRoute.params
			.pipe(takeUntil(this.unsubscribe$)).subscribe((param: ActivatedRouteResponse | null) => {
				if(param) {
					param.id = id;
					this.dialogRefView.content.instance.getCandidatePoolById(param.id);
				}
			});
	}

	public navigateToSbmtlList(): void{
		this.dialogRefView.close();
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}

