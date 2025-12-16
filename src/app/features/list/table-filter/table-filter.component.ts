import { Component, Output, EventEmitter } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-table-filter',
  standalone: true,
  imports: [
    NgIf,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule, 
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss']
})
export class TableFilterComponent {
  @Output() filterChange = new EventEmitter<{ type: string; status: string; search: string }>();
  searchValueJobs = '';
  typeFilter = 'all';
  decisionFilter = 'all';

  filterJobs() {
    this.filterChange.emit({
      type: this.typeFilter,
      status: this.decisionFilter,
      search: this.searchValueJobs
    });
  }

  handleReset() {
    this.typeFilter = 'all';
    this.decisionFilter = 'all';
    this.searchValueJobs = '';
    this.filterChange.emit({ 
      type: 'all', 
      status: 'all', 
      search: '' 
    });
  }
}
