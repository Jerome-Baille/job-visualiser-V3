import { Component, Input } from '@angular/core';
import { JobData } from '../interfaces';

@Component({
  selector: 'app-table-body',
  templateUrl: './table-body.component.html',
  styleUrls: ['./table-body.component.scss']
})
export class TableBodyComponent {
  @Input() jobs: JobData[] = [];
  @Input() columns: any[] = [];
}
