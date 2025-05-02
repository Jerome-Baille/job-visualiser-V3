import { Component, Input, Output, EventEmitter } from '@angular/core';
import { JobData } from '../../interfaces';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-filter',
  standalone: true,
  imports: [
    CommonModule,
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
  @Input() jobs: JobData[] = [];
  @Output() jobFilteredChange = new EventEmitter<JobData[]>();
  searchValueJobs = '';
  typeFilter = 'all';
  decisionFilter = 'all';  filterJobs() {
    let filtered = this.jobs;
    
    // Filter by search text
    if (this.searchValueJobs.trim()) {
      const searchTerm = this.searchValueJobs.toLowerCase().trim();
      filtered = filtered.filter(job => {
        const nameMatch = typeof job.name === 'string' && job.name.toLowerCase().includes(searchTerm);
        const companyMatch = typeof job.company === 'string' && job.company.toLowerCase().includes(searchTerm);
        const descriptionMatch = typeof job['description'] === 'string' && job['description'].toLowerCase().includes(searchTerm);
        
        return nameMatch || companyMatch || descriptionMatch;
      });
    }
    
    // Filter by type
    if (this.typeFilter && this.typeFilter !== 'all') {
      filtered = filtered.filter(job => 
        typeof job.type === 'string' && job.type.toLowerCase().includes(this.typeFilter.toLowerCase())
      );
    }
      // Filter by decision/status
    if (this.decisionFilter && this.decisionFilter !== 'all') {
      filtered = filtered.filter(job => 
        typeof job.decision === 'string' && job.decision.toLowerCase().includes(this.decisionFilter.toLowerCase())
      );
    }
    
    this.jobFilteredChange.emit(filtered);
  }

  handleReset() {
    this.typeFilter = 'all';
    this.decisionFilter = 'all';
    this.searchValueJobs = '';
    this.jobFilteredChange.emit(this.jobs);
  }
}
