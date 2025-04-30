import { Component, Input, OnInit } from '@angular/core';
import { JobData } from '../interfaces';

@Component({
  selector: 'app-list-table',
  templateUrl: './list-table.component.html',
  styleUrls: ['./list-table.component.scss']
})
export class ListTableComponent implements OnInit {
  @Input() jobs: JobData[] = [];
  @Input() jobFiltered: JobData[] = [];
  @Input() currentPage = 1;
  @Input() recordsPerPage = 20;

  columns: any[] = [];

  ngOnInit() {
    this.setColumns(window.innerWidth);
  }

  setColumns(width: number) {
    if (width > 768) {
      this.columns = [
        { label: 'Job position', accessor: 'name', sortable: true },
        { label: 'Company', accessor: 'company', sortable: true },
        { label: 'Type', accessor: 'type', sortable: false },
        { label: 'Date', accessor: 'applicationDate', sortable: true },
        { label: 'Decision', accessor: 'decision', sortable: false },
      ];
    } else {
      this.columns = [
        { label: 'Title', accessor: 'name', sortable: true },
        { label: 'Company', accessor: 'company', sortable: true },
      ];
    }
  }
}
