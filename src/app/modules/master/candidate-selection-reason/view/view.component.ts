import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationPaths } from '../constant/routes-constant';
import { CandidateSelectionReasonService } from '../services/candidate-selection-reason.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { switchMap } from 'rxjs';
import { ICommonComponentData, ISelectionReasonUkeyData } from '@xrm-core/models/candidate-selection-reason/candidate-selection-reason.interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { INavigationPathMap, ISectorDetailById } from '@xrm-shared/models/common.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit {

	public AddEditEventReasonForm: FormGroup;
	public navigationPaths: INavigationPathMap = NavigationPaths;
	public Ukey: string = '';
	public selectionReasonDetails: ISelectionReasonUkeyData;
	public rfxSowSwitchConfig: boolean = false;

	// eslint-disable-next-line max-params
	constructor(
		private router: Router,
		private activatedRoutes: ActivatedRoute,
		private canSelectRsnService: CandidateSelectionReasonService,
		private toasterService: ToasterService,
		private cdr: ChangeDetectorRef,
		private destroyRef: DestroyRef
	) { }

	ngOnInit(): void {
		this.handleSelectionReasonDetails();
		this.destroyRef.onDestroy(() =>
			this.toasterService.resetToaster());
	}

	private handleSelectionReasonDetails(): void {
		this.activatedRoutes.params.pipe(
			takeUntilDestroyed(this.destroyRef),
			switchMap((param) =>
				this.canSelectRsnService.getCanSelectRsnByUkey(param['ukey'])),
			switchMap((data: GenericResponseBase<ISelectionReasonUkeyData>) => {
				if (!data.Succeeded || !data.Data) return [];
				this.handleSelectionReasonData(data.Data);
				return this.canSelectRsnService.getDataFromSector(data.Data.SectorId);
			})
		).subscribe((res: GenericResponseBase<ISectorDetailById>) => {
			if (!res.Succeeded || !res.Data) return;
			this.rfxSowSwitchConfig = res.Data.IsRfxSowRequired;
			this.cdr.markForCheck();
		});
	}

	private handleSelectionReasonData(selectionReasonData: ISelectionReasonUkeyData): void {
		this.selectionReasonDetails = selectionReasonData;
		this.canSelectRsnService.sharedDataSubject.next(this.prepareSharedData());
	}

	private prepareSharedData(): ICommonComponentData {
		return {
			'Disabled': this.selectionReasonDetails.Disabled,
			'CandidateSelectionReasonCode': this.selectionReasonDetails.Code,
			'CandidateSelectionReasonId': this.selectionReasonDetails.Id
		};
	}

	public navigateToList(): void {
		this.router.navigate([`${NavigationPaths.list}`]);
	};
}
