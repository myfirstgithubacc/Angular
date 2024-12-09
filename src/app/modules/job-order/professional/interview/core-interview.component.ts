import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { PageTitleService } from '@xrm-shared/services/page-title.service';
import { Subject, takeUntil } from 'rxjs';
import { InterviewNavigationPaths } from '../constant/routes-constant';
import { InterviewRequestService } from '../services/interview-request.service';
import { IStatusCardData, IStatusCardItem } from '@xrm-shared/models/common.model';
import { CardStatus } from '../interface/interview.interface';

@Component({
	selector: 'app-core-interview',
	templateUrl: './core-interview.component.html',
	styleUrl: './core-interview.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreInterviewComponent {

	public statusForm: FormGroup;
	public show:boolean = false;
	public statusData: IStatusCardData = {
		items: []
	};
	public interviewUkey: string;
	public Ukey:string;
	public entityId: number = XrmEntities.InterviewRequest;
	public showHeader: boolean = true;
	private unsubscribeAll$ = new Subject<void>();
	public isShowRequestDetail: boolean = false;
	public showOnInterview: boolean = true;


	// eslint-disable-next-line max-params
	constructor(
		private formBuilder: FormBuilder,
		private interviewService: InterviewRequestService,
		private eventLog: EventLogService,
		private global: PageTitleService,
		private cdr: ChangeDetectorRef,
		private renderer: Renderer2
	) {
		this.statusForm = this.formBuilder.group({
			'status': [null]
		});
	}

	ngOnInit(): void {
		this.getstatusData();
		this.updateStatusData();
	}

	private getstatusData(): void{
		this.global.getRouteObs.pipe(takeUntil(this.unsubscribeAll$)).subscribe((url) => {
			if(url == InterviewNavigationPaths.list){
				this.showHeader = false;
			}else{
				this.showHeader = true;
			}

			if(this.showHeader){
				const ukey = url.split('/');
				this.Ukey = ukey[ukey.length - magicNumber.one];
				this.show = url.includes('view');
			}

			this.cdr.markForCheck();
		});

	}

	private updateStatusData(): void{
		this.interviewService.sharedDataObservable.pipe(takeUntil(this.unsubscribeAll$))
			.subscribe((response: {
				CandidateName: string;
				SubmittalCode: string;
				InterviewCode?: string;
				Status?: string;
				Ukey?: string;
			}) => {
				this.statusData.items = [
					this.makeHeaderColumn(CardStatus.Name, response.CandidateName, ['basic-title']),
					this.makeHeaderColumn(CardStatus.SubmittalID, response.SubmittalCode),
					this.makeHeaderColumn(CardStatus.InterviewID, response.InterviewCode ?? ""),
					this.makeHeaderColumn(CardStatus.Status, response.Status ?? "")

				];
				this.interviewUkey = response.Ukey ?? "";
				this.eventLog.recordId.next(response.InterviewCode);
				this.eventLog.entityId.next(XrmEntities.InterviewRequest);
			});
	}

	private makeHeaderColumn(title: string, item: string, cssClass: string[] = []) {
		return {
			title: title,
			titleDynamicParam: [],
			item: item,
			itemDynamicParam: [],
			cssClass: cssClass,
			isLinkable: title == CardStatus.SubmittalID.toString()
				? true
				: false,
			link: '',
			linkParams: title == CardStatus.SubmittalID.toString()
				? item.toString()
				: ''
		} as IStatusCardItem;
	}

	public showRequestDetails(event: string): void {
		this.isShowRequestDetail = true;
		this.renderer.setStyle(document.body, 'overflow', 'hidden');
		this.renderer.setStyle(document.body, 'padding-right', '0');
	}

	public closePanel(): void {
		this.isShowRequestDetail = false;
		this.renderer.removeStyle(document.body, 'overflow');
		this.renderer.removeStyle(document.body, 'padding-right');
	}

	ngOnDestroy(): void {
		this.unsubscribeAll$.next();
		this.unsubscribeAll$.complete();
	}

}
