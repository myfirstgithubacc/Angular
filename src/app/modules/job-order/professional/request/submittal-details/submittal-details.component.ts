import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LocalizationService } from '@xrm-shared/services/Localization/localization.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { ClientDetails, PRDetails } from '../../../submittals/services/Interfaces';
import { ProfessionalRequestService } from '../../services/professional-request.service';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { IStatusCardData, IStatusCardItem } from '@xrm-shared/models/common.model';
import { RequiredStrings } from '../../../submittals/services/Constants.enum';

@Component({
	selector: 'app-submittal-details',
	templateUrl: './submittal-details.component.html'
})
export class SubmittalDetailsComponent implements OnInit, OnDestroy {

	public profReqData: PRDetails;
	public headerForm:FormGroup;
	private sectorLabel: string = 'Sector';
	public isShowRequestDetail: boolean = false;
	public profReqUkey:string;
	public statusData:IStatusCardData = {
		items: []
	};
	private unsubscribe$: Subject<void> = new Subject<void>();

	constructor(
		private pageTitleService: PageTitleService,
		private title: Title,
		private localisationService: LocalizationService,
		private profReqService: ProfessionalRequestService,
		private activatedRoute: ActivatedRoute
	) { };

	ngOnInit() {
		const uKey:string = this.activatedRoute.snapshot.params['uKey'];
		this.profReqUkey = uKey;
		this.handleProfReqData(uKey);
		this.setTitlePage('ProfessionalRequestOrSubmittal');
	}

	private getCommonHeaderData(): void{
		this.statusData.items=[
			this.makeHeaderColumn(RequiredStrings.ProfessionalRequestID, this.profReqData.RequestCode, ['basic-title']),
			this.makeHeaderColumn(this.sectorLabel, this.profReqData.Sector),
			this.makeHeaderColumn(RequiredStrings.JobCategory, this.profReqData.JobCategory)
		];
	}

	private makeHeaderColumn(title:string, item:string, cssClass:string[] = []): IStatusCardItem{
		return {
			title: title,
			titleDynamicParam: [],
			item: item,
			itemDynamicParam: [],
			cssClass: cssClass,
			isLinkable: title == RequiredStrings.ProfessionalRequestID.toString()
				? true
				: false,
			link: '',
			linkParams: title == RequiredStrings.ProfessionalRequestID.toString()
				? item.toString()
				: RequiredStrings.EmptyString
		} as IStatusCardItem;
	}

	private handleProfReqData(uKey: string): void{
		this.profReqService.getProfReqDataForSubmittal(uKey).pipe(takeUntil(this.unsubscribe$), switchMap((res: GenericResponseBase<PRDetails>) => {
			if(res.Succeeded && res.Data){
				this.profReqData = res.Data;
				return this.profReqService.getConfigureClient();
			}
			return of(null);
		})).subscribe((res: GenericResponseBase<ClientDetails> | null) => {
			if(res?.Succeeded && res.Data){
				this.sectorLabel = this.localisationService.GetLocalizeMessage(res.Data.OrganizationLabel);
			}
			this.getCommonHeaderData();
		});
	}

	private setTitlePage(title:string): void{
		this.title.setTitle(this.localisationService.GetLocalizeMessage(title));
		this.pageTitleService.setTitle(title);
	}

	public showRequestDetails(event: string): void{
		this.isShowRequestDetail = true;
	}

	public closePanel():void{
		this.isShowRequestDetail = false;
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
