import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { Subject, takeUntil } from 'rxjs';
@Component({selector: 'app-loader',
	templateUrl: './loader.component.html',
	styleUrls: ['./loader.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent implements OnInit {
	public isBusy: boolean = false;

	private unsubscribe$ = new Subject<void>();
	constructor(private readonly SpinnerService: LoaderService, private cdr: ChangeDetectorRef) { }

	ngOnInit(): void {
		this.SpinnerService.isBusyObs
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((data: boolean) => {
				this.isBusy = data;
				this.detectChanges();
			});
	}

	detectChanges() {
		this.cdr.detectChanges();
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
