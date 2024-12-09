import { Component, ViewChild, ViewEncapsulation, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';

@Component({selector: 'app-forms',
  templateUrl: './forms.component.html',
  //styleUrls: ['./forms.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormsComponent implements OnInit {
  constructor(private fb: FormBuilder) {}

  @ViewChild('password') public textbox!: TextBoxComponent;

  public ngAfterViewInit(): void {
    this.textbox.input.nativeElement.type = 'password';
  }

  public toggleVisibility(): void {
    const inputEl = this.textbox.input.nativeElement;
    inputEl.type = inputEl.type === 'password' ? 'text' : 'password';
  }

  public form: FormGroup = this.fb.group({
    username: [null, [Validators.required]],
    lastname: [null, [Validators.required]],
    password: [null, [Validators.required]],
    loggedin: [null, [Validators.required]],
  });

  public login(): void {
    this.form.controls[''];
    this.form.markAllAsTouched();
  }

  public clearForm(): void {
    this.form.reset();
  }
  ngOnInit(): void {}
}
