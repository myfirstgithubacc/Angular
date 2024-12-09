import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { IconService } from '../../../services/masters/icon.service';

@Component({
	selector: 'xrm-icon',
	templateUrl: './xrm-icon-library.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class XRMIconLibraryComponent implements OnInit {
  @Input() name: string;
  @Input() viewBox: number;
  @Input() size: number = 20; 
  @Input() fill: string = 'none';
  @Input() strokeWidth: number = 1.5;
  @Input() color: string | undefined = 'black';
  @Input() svgPath: string = ''; 
  constructor(private iconService: IconService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
  	// Load the SVG file containing all icons
  	this.iconService.getSvg().subscribe(
  		data => {
  			// Extract the path based on the icon name
  			const parser = new DOMParser();
  			const svgDoc = parser.parseFromString(data, 'image/svg+xml');
  			const iconPath = svgDoc.getElementById(this.name);
  			if (iconPath) {
  				this.svgPath = iconPath.getAttribute('d') || '';
  			}
        this.cdr.markForCheck();
  		},
  		error => {
  			console.error();
  		}
  	);
  }
}

export const eyeDimension = "M15 12C15 13.6569 13.6569 15 12 15 10.3431 15 9 13.6569 9 12 9 10.3431 10.3431 9 12 9 13.6569 9 15 10.3431 15 12ZM22 12C22 12 21.3721 13.3535 20 15 17.5 18 15.0908 19.3 12 19.3 8.9092 19.3 6.7329 18 4 15 2.5566 13.4156 2 12 2 12 2 12 2.5566 10.5844 4 9 6.7329 6 8.9092 4.7 12 4.7 15.0908 4.7 17.5 6 20 9 21.4434 10.5844 22 12 22 12Z";
export const eyeOffDimension = "M10.2347 9.57417C9.89648 9.82069 9.61181 10.1362 9.40135 10.5C9.14609 10.9413 9 11.4536 9 12C9 13.6569 10.3431 15 12 15C12.1704 15 12.3374 14.9858 12.5 14.9586C12.969 14.8799 13.401 14.6924 13.7694 14.423M12.3064 9.0155C13.8193 9.16899 15 10.4466 15 12C15 12.2619 14.9664 12.516 14.9034 12.7582M7.59301 5.88126C6.41717 6.58124 5.26855 7.6075 4 9.00004C2.55663 10.5845 2 12 2 12C2 12 2.55663 13.4156 4 15C6.73289 18 8.9092 19.3 12 19.3C13.6223 19.3 15.0568 18.9419 16.4152 18.1677M10.2516 4.85764C10.8059 4.75149 11.3848 4.69999 12 4.69999C15.0908 4.69999 17.5 6.00004 20 9.00004C21.4434 10.5845 22 12 22 12C22 12 21.3721 13.3535 20 15C19.535 15.558 19.0732 16.0571 18.6096 16.5M4.86 2.12378L19.2069 21.8764";
export const sunDimension = "M17.035 16.8628L18.4737 18.2521M6.96422 7.1376L5.52554 5.74828M16.8622 6.96483L18.2515 5.52615M7.13699 17.0356L5.74768 18.4743M12 19L12 21.5M5 12.0007L2.5 12.0007M12 5V2.5M19 12.0007H21.5M16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51472 16.5 7.5 14.4853 7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12Z";
export const moonDimension = "M21.9367 12.1798C21.9445 12.0142 21.7556 11.918 21.6194 12.0125C17.9975 14.5271 13.2671 14.2577 10.6375 11.2328C8.51113 8.78665 8.36031 5.2309 9.96369 2.24817C10.045 2.09689 9.9173 1.91492 9.74978 1.95283C9.33954 2.04568 8.93054 2.16543 8.5249 2.31307C3.33512 4.202 0.659253 9.94042 2.54818 15.1302C4.4371 20.32 10.1755 22.9958 15.3653 21.1069C19.2698 19.6858 21.7514 16.0858 21.9367 12.1798Z";
export const checkDimension = "M3.5 10.9961L7.86271 16.7388C8.03355 16.9637 8.35659 17.0026 8.57588 16.8246L20.5 7.1499";
export const xDimension = "M4.5 4.5L12 12M12 12L19.5 19.5M12 12L19.5 4.5M12 12L4.5 19.5";
export const plusDimension = "M19.5 12H12M12 12H4.5M12 12V4.5M12 12V19.5";
export const minusDimension = "M6 12H18";
export const chevronDownDimension = "M5 9L11.9349 14.9442C11.9724 14.9763 12.0276 14.9763 12.0651 14.9442L19 9";
export const chevronUpDimension = "M19 15L12.0651 9.05578C12.0276 9.02368 11.9724 9.02368 11.9349 9.05578L5 15";
export const chevronRightDimension = "M9 19L14.9442 12.0651C14.9763 12.0276 14.9763 11.9724 14.9442 11.9349L9 5";