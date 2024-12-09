import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class CoreServService {
	public Contract: BehaviorSubject<any> = new BehaviorSubject<any>(null);

}
