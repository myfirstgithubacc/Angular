import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Component({selector: 'app-test-pipes',
	templateUrl: './test-pipes.component.html',
	styleUrls: ['./test-pipes.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestPipesComponent implements OnInit {

	convertText: string = "795004";
	convertPhone: string = "9365896256";
	country: string="India";
	checkNullVal: string|null=null;
	checkNullVal2:string="Hi";
	checkNumberVal:number= magicNumber.zero;
	checkNumberVal2:number= magicNumber.one;
	checkNumberVal3:number= magicNumber.two;
	numArry:number[]=[
		magicNumber.tweleve, magicNumber.eighteen,
		magicNumber.one, magicNumber.five,
		magicNumber.four
	];
	strArry:string[]=["Cat", "Car", "Dog", "Elephant", "Aeroplane", "Axe"];

	
}
