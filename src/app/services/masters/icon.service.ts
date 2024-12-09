import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { shareReplay, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private svgCache: Observable<string> | null = null;

  constructor() {}

  getSvg(): Observable<string> {
    if (!this.svgCache) {
      this.svgCache = from(fetch('assets/icon/xrm-icons/icons.svg').then(response => response.text())).pipe(
        shareReplay(1),
        catchError(() => {
          this.svgCache = null; 
          return of('');
        })
      );
    }
    return this.svgCache;
  }
}
