import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { CandidateDeclineReasonService } from 'src/app/services/masters/candidate-decline-reason.service';
import { NavigationPaths } from '../constant/routes-constant';
import { Subject, takeUntil} from 'rxjs';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { NavPathsType } from '@xrm-master/event configuration/constant/event-configuration.enum';
import { CanDecRsnData, RFXSectorDetails } from '../constant/candidate-decline-reason-interface';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';


@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy {
	public navigationPaths: NavPathsType = NavigationPaths;
	public isEditMode: boolean = false;
	public isEdit: boolean = false;
	public canDecRsnData: CanDecRsnData;
	private ngUnsubscribe$ = new Subject<void>();
	public ukey: string;
	public entityID = XrmEntities.CandidateDeclineReason;
	public Rfxswitchconfig: boolean;


	// eslint-disable-next-line max-params
	constructor(
  		private activatedRoute: ActivatedRoute,
  		private canDecRsnServc:CandidateDeclineReasonService,
  		private toasterServc: ToasterService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((param) => {
			if (param['id']) {
				this.getById(param['id']);
				this.ukey = param['id'];
			}
		});
	}


	private getById(id: string) {
		this.canDecRsnServc.getCanDeclineRsnById(id).pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
			next: (res:GenericResponseBase<CanDecRsnData>) => {
				if(res.Succeeded && res.Data){
					this.canDecRsnData = res.Data;
					this.getRfxData(this.canDecRsnData.SectorId);
					this.canDecRsnServc.declinereasonSubject.next({
						"DeclineReasonID": this.canDecRsnData.Id,
						"Disabled": this.canDecRsnData.Disabled,
						"DeclineReasonCode": this.canDecRsnData.Code
					});
				}
			}
		});
	}

	private getRfxData(id:number){
		this.canDecRsnServc.getRfxDataFromSector(id).pipe(takeUntil(this.ngUnsubscribe$))
			.subscribe((data: GenericResponseBase<RFXSectorDetails>) => {
				if(data.Succeeded && data.Data){
					this.Rfxswitchconfig = data.Data.IsRfxSowRequired;
					this.cdr.markForCheck();
				}
			});
	}

	ngOnDestroy() {
		this.ngUnsubscribe$.next();
		this.ngUnsubscribe$.complete();
		this.toasterServc.resetToaster();
	}
}

