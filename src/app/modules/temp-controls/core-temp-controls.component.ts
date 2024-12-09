import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { CopyItemService } from '@xrm-shared/services/copy-item.service';
import { CopyDialogComponent } from '@xrm-shared/widgets/popupdailog/copy-dialog/copy-dialog.component';
import { ServiceService } from './service.service';

@Component({selector: 'app-core-temp-controls',
  templateUrl: './core-temp-controls.component.html',
  styleUrls: ['./core-temp-controls.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoreTempControlsComponent implements OnInit {
  dialogRef: DialogRef;
  copyDailogInfo: CopyDialogComponent;
  copyInfo: any;
  treeData: any = {};
  constructor(private _dialog: DialogService,
    private service: ServiceService,
    private cd: ChangeDetectorRef,
    private copyItemService: CopyItemService
  ) { }

  ngOnInit(): void {
    this.copyItemService.getChanges().subscribe((Data: any) => {
      if (Data.controlName == "SourceLocation") {
        this.copyDailogInfo.treeData = {
          treeData:
            [{
              text: "All",
              items: [
                {
                  text: "Four",
                  value: "4"
                },
                {
                  text: "Five",
                  value: "5"
                }
              ]
            }
            ],
          label: "Select the records",
          tooltipVisible: true,
          tooltipTitleParams: [],
          tooltipTitle: "Select the records to copy!!",
        }


      }
      else {
        this.copyDailogInfo.treeData = {
          treeData:
            [{
              text: "All",
              items: [
                {
                  text: "One",
                  value: "1"
                },
                {
                  text: "Two",
                  value: "2"
                },
                {
                  text: "Three",
                  value: "3"
                }
              ]
            }
            ],
          label: "Select the records",
          tooltipVisible: true,
          tooltipTitleParams: [],
          tooltipTitle: "Select the records to copy!",
        }
      }
      this.cd.detectChanges();
      console.log("Form Data: ", this.copyDailogInfo.formGroup)
    });

    this.copyItemService.getSourceId().subscribe({
      next: (data: any) => {
        if (data) {
          this.service.getdropdown(data).subscribe((data: any) => {
            this.copyItemService.setItemListForCopyItems(data.Data);
          });
        }
        else {
          console.log("remove and hide the item tree");
        }
      }
    })
  }


  gridHeaderBtnEvent() {
    this.service.get().subscribe({
      next: (data: any) => {
        let drpData = {
          source: "FromSector",
          destination: "ToSector",
          drpData: data.Data
        };
        this.copyItemService.setEntityListForCopyItems(drpData);
      }
    });
    this.dialogRef = this._dialog.open({
      content: CopyDialogComponent,
      actions: [{ text: "Yescopy", themeColor: "primary" }, { text: "Nocopy" }],
      width: 420,
      preventAction: (ev: any, dialog) => {
        if (ev.text.toLowerCase().includes('no')) {
          dialog?.close();
        }
        const formGroup = (dialog?.content.instance as CopyDialogComponent)
          .formGroup;
        if (!formGroup.valid) {
          formGroup?.markAllAsTouched();
        }
        return !formGroup.valid;
      },
    });
    this.copyDailogInfo = this.dialogRef.content.instance as CopyDialogComponent;
    this.copyDailogInfo.title = "DoyouwanttocopytheselectedReasonForRequesttoanotherSector";
    this.copyDailogInfo.copydialogdata = this.copydialogdata;
    this.copyDailogInfo.treeData = this.treeData;
    //see which button is clicked...
    this.dialogRef.result.subscribe((data: any) => {
      console.log("form returned", this.copyDailogInfo.formGroup);
    });
  }

  copydialogdata = [
    {
      type: "dropdown",
      labels: { drpLabel: "FromSector" },
      tooltipVisible: true,
      tooltipTitleParams: [],
      tooltipTitle: "FromSector",
      drpData: [
        { Text: "Presort", Value: "1" },
        { Text: "Honeywells", Value: "2" },
        { Text: "PBA", Value: "3" },
        { Text: "BlueMoon", Value: "4" }
      ],
      controlName: "sourcesector"
    },
    {
      type: "dropdown",
      labels: { drpLabel: "FromLocation" },
      tooltipVisible: true,
      tooltipTitleParams: [],
      tooltipTitle: "FromLocation",
      drpData: [
        { Text: "Presort", Value: "1" },
        { Text: "Honeywells", Value: "2" },
        { Text: "PBA", Value: "3" },
        { Text: "BlueMoon", Value: "4" }
      ],
      controlName: "SourceLocation",
      Tree: true
    },
    {
      type: "dropdown",
      labels: { drpLabel: "ToSector" },
      tooltipVisible: true,
      tooltipTitleParams: [],
      tooltipTitle: "ToSector",
      drpData: [
        { Text: "Presort", Value: "1" },
        { Text: "Honeywells", Value: "2" },
        { Text: "PBA", Value: "3" },
        { Text: "BlueMoon", Value: "4" }
      ],
      controlName: "DestinationSector"
    },
    {
      type: "dropdown",
      labels: { drpLabel: "ToLocation" },
      tooltipVisible: true,
      tooltipTitleParams: [],
      tooltipTitle: "ToSector",
      drpData: [
        { Text: "Presort", Value: "1" },
        { Text: "Honeywells", Value: "2" },
        { Text: "PBA", Value: "3" },
        { Text: "BlueMoon", Value: "4" }
      ],
      controlName: "DestinationLocation"
    }
  ]

}
