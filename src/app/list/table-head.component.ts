import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-table-head',
  templateUrl: './table-head.component.html',
  styleUrls: ['./table-head.component.scss']
})
export class TableHeadComponent {
  @Input() columns: any[] = [];
  @Output() sortChange = new EventEmitter<{ accessor: string, order: 'asc' | 'desc' }>();
  sortField = '';
  order: 'asc' | 'desc' = 'asc';

  handleSortingChange(accessor: string) {
    this.order = (this.sortField === accessor && this.order === 'asc') ? 'desc' : 'asc';
    this.sortField = accessor;
    this.sortChange.emit({ accessor, order: this.order });
  }
}
