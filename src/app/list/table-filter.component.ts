import { Component, Input, Output, EventEmitter } from '@angular/core';
import { JobData } from '../interfaces';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-table-filter',
  standalone: true,
  imports: [MatExpansionModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './table-filter.component.html'
})
export class TableFilterComponent {
  @Input() jobs: JobData[] = [];
  @Output() jobFilteredChange = new EventEmitter<JobData[]>();
  searchValueJobs = '';
  typeFilter = '';
  decisionFilter = '';

  filterJobs() {
    let filtered = this.jobs;
    if (this.typeFilter && this.typeFilter !== 'all') {
      filtered = filtered.filter(job => job.type?.toLowerCase().includes(this.typeFilter.toLowerCase()));
    }
    if (this.decisionFilter && this.decisionFilter !== 'all') {
      filtered = filtered.filter(job => job.decision?.toLowerCase().includes(this.decisionFilter.toLowerCase()));
    }
    this.jobFilteredChange.emit(filtered);
  }

  handleReset() {
    this.typeFilter = '';
    this.decisionFilter = '';
    this.searchValueJobs = '';
    this.jobFilteredChange.emit(this.jobs);
  }
}
