import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormsComponent implements OnInit {

  public userFormData: FormGroup;

  constructor(public fb: FormBuilder) {

    this.userFormData = this.fb.group({
      username: ['guddu', Validators.required],
      email: [],
      phone: []
    })

  }


  getUserData() {
    this.userFormData.reset({
      username: '',
      email: 'guddu@yopmail.com',
      phone: 0
    })
  }

  ngOnInit(): void {
    this.userFormData.setValue({
      username: 'guddu',
      email: 'guddu@yopmail.com',
      phone: 83759857435
    })
    this.userFormData.valueChanges.subscribe(data => {
      console.log(data)
    })
  }

}
