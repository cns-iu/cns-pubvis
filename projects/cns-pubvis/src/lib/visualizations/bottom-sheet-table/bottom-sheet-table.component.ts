import { Component, Input } from '@angular/core';
import { BoundField } from '@ngx-dino/core';

@Component({
  selector: 'cns-pubvis-bottom-sheet-table',
  templateUrl: './bottom-sheet-table.component.html',
  styleUrls: ['./bottom-sheet-table.component.scss']
})
export class BottomSheetTableComponent {
  @Input() title: string;
  @Input() data: any[];
  @Input() idField: BoundField<any>;
  @Input() fields: BoundField<any>[];
  @Input() sort: boolean | ((a: any, b: any) => number) = false;

  isOpen = false;

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }
}
