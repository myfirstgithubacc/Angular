import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RevisionService } from '../service/revision.service';
import { Location } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AssingmentDetailsService } from '../../assignment-details/service/assingmentDetails.service';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { RevisionData, StatusData } from '@xrm-master/role/Generictype.model';
@Component({
	selector: 'app-revision-view',
	templateUrl: './revision-view.component.html',
	styleUrls: ['./revision-view.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevisionViewComponent implements OnInit, OnDestroy {
	@Input() public Ukey: string;
	@Input() public assingmentId: number|null;
	public revisionObject: RevisionData;
	public entityId=XrmEntities.AssignmentRevision;
	public statusData: StatusData = {
  	items: []
	};
	private unsubscribe$ = new Subject<void>();

	// eslint-disable-next-line max-params
	constructor(
	private activatedRoute: ActivatedRoute,
    private revisionService: RevisionService,
	private location: Location,
	private assignmentService:AssingmentDetailsService
	){}

	ngOnInit(): void {
  	if(this.Ukey==null || this.Ukey==undefined)
  		this.Ukey = this.activatedRoute.snapshot.params['id'];

  	if(this.Ukey)
  		this.getRevisionId();
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	getRevisionId() {
		this.revisionService.fetchRevisionDetails(this.Ukey, false, this.assingmentId).pipe(takeUntil(this.unsubscribe$))
			.subscribe(({ revisionObject, statusData }) => {
				this.revisionObject = revisionObject;
				this.statusData = statusData;
  	});
	}

	navigate(){
  	if(this.assingmentId == null || this.assingmentId == undefined)
  		this.location.back();
  	else
  		this.assignmentService.setRevisionPageIndex(magicNumber.one, this.assingmentId, this.Ukey, false);
	}

}
