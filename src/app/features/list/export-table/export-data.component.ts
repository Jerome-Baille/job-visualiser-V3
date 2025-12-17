import { Component, inject } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { JobService } from '../../../core/services/job.service';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-export-data',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
],
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.scss']
})
export class ExportDataComponent {
  private jobService = inject(JobService);
  private snackbar = inject(SnackbarService);

  selectedFormat = '';
  selectedYear = '';  
  years: string[] = [];
  
  formatOptions = [
    { value: 'excel', icon: 'table_chart', label: 'Excel' },
    { value: 'pdf', icon: 'picture_as_pdf', label: 'PDF' }
  ];
  
  get selectedFormatOption() {
    return this.formatOptions.find(option => option.value === this.selectedFormat);
  }

  constructor() {
    // Add "All Years" option first
    this.years.push('All Years');
    
    const currentYear = new Date().getFullYear();
    for (let year = 2022; year <= currentYear; year++) {
      this.years.push(year.toString());
    }
  }

  async handleExportClick() {
    try {
      await this.jobService.exportOpportunities(this.selectedYear, this.selectedFormat);
      this.snackbar.success('Your data has been exported successfully!');
    } catch {
      this.snackbar.error('An error occurred while exporting your data. Please try again later.');
    }
  }
}
