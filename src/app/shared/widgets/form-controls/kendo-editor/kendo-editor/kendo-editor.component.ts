import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';

@Component({selector: 'app-kendo-editor',
	templateUrl: './kendo-editor.component.html',
	styleUrls: ['./kendo-editor.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KendoEditorComponent {
	public formControl!: FormControl;

	@Input()
	set controlName(value: string) {
		this.formControl = this.parentF.form.get(value) as FormControl;
	}
  @Input() value : string;
  @Input() editorControl: string;
  @Input() height: string;
  @Input() listControlName: FormControl;

  @Output() onChangeEditor = new EventEmitter<any>();
  @Output() onBlurEditor = new EventEmitter<any>();
  @Output() onFocusEditor = new EventEmitter<any>();
  @Output() onPasteEditor = new EventEmitter<any>();

  constructor(public parentF: FormGroupDirective){}

  onChange(e: any) {
  	this.onChangeEditor.emit(e);
  }
  onBlur(e: any) {
  	this.onBlurEditor.emit(e);
  }
  onFocus(e: any) {
  	this.onFocusEditor.emit(e);
  }
  onPaste(e: any) {
  	this.onPasteEditor.emit(e);
  }

}
