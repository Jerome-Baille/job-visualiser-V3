import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';


export type DateFilterMode = 'all' | 'year' | 'single' | 'range';
export type OpportunitiesFilter = {
  type: string;
  status: string;
  search: string;
  dateMode: DateFilterMode;
  selectedYear?: string;
  startDate?: string;
  endDate?: string;
};

@Component({
  selector: 'app-table-filter',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule
],
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss'],
  providers: [provideNativeDateAdapter()]
})
export class TableFilterComponent {
  @Output() filterChange = new EventEmitter<OpportunitiesFilter>();

  private isSyncingFromInputs = false;

  @Input() set type(value: string | null | undefined) {
    this.isSyncingFromInputs = true;
    this.typeFilter = value || 'all';
    this.isSyncingFromInputs = false;
  }

  @Input() set status(value: string | null | undefined) {
    this.isSyncingFromInputs = true;
    this.decisionFilter = value || 'all';
    this.isSyncingFromInputs = false;
  }

  @Input() set search(value: string | null | undefined) {
    this.isSyncingFromInputs = true;
    this.searchValueJobs = value || '';
    this.isSyncingFromInputs = false;
  }

  @Input() set dateModeInput(value: DateFilterMode | null | undefined) {
    this.isSyncingFromInputs = true;
    this.dateMode = value || 'all';
    this.isSyncingFromInputs = false;
  }

  @Input() set selectedYearInput(value: string | null | undefined) {
    this.isSyncingFromInputs = true;
    this.selectedYear = value || '';
    this.isSyncingFromInputs = false;
  }

  @Input() set startDateInput(value: string | null | undefined) {
    this.isSyncingFromInputs = true;
    const parsed = this.parseYYYYMMDD(value);
    if (this.dateMode === 'single') {
      this.singleDate = parsed;
    }
    if (this.dateMode === 'range') {
      this.rangeStart = parsed;
    }
    this.isSyncingFromInputs = false;
  }

  @Input() set endDateInput(value: string | null | undefined) {
    this.isSyncingFromInputs = true;
    const parsed = this.parseYYYYMMDD(value);
    if (this.dateMode === 'range') {
      this.rangeEnd = parsed;
    }
    this.isSyncingFromInputs = false;
  }

  searchValueJobs = '';
  typeFilter = 'all';
  decisionFilter = 'all';

  dateMode: DateFilterMode = 'all';
  selectedYear = '';
  years: string[] = [];
  singleDate: Date | null = null;
  rangeStart: Date | null = null;
  rangeEnd: Date | null = null;

  constructor() {
    this.years.push('All Years');
    const currentYear = new Date().getFullYear();
    for (let year = 2022; year <= currentYear; year++) {
      this.years.push(year.toString());
    }
  }

  private parseYYYYMMDD(value: string | null | undefined): Date | null {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length !== 3) return null;
    const [y, m, d] = parts.map((p) => Number(p));
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    if (Number.isNaN(date.getTime())) return null;
    // Ensure it didn't overflow (e.g. 2025-02-31)
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    return date;
  }

  private formatDateYYYYMMDD(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private emitFilters(): void {
    const payload: OpportunitiesFilter = {
      type: this.typeFilter,
      status: this.decisionFilter,
      search: this.searchValueJobs,
      dateMode: this.dateMode,
    };

    if (this.dateMode === 'year') {
      payload.selectedYear = this.selectedYear || '0000';
    } else if (this.dateMode === 'single') {
      if (this.singleDate) payload.startDate = this.formatDateYYYYMMDD(this.singleDate);
    } else if (this.dateMode === 'range') {
      if (this.rangeStart) payload.startDate = this.formatDateYYYYMMDD(this.rangeStart);
      if (this.rangeEnd) payload.endDate = this.formatDateYYYYMMDD(this.rangeEnd);
    }

    this.filterChange.emit(payload);
  }

  filterJobs() {
    if (this.isSyncingFromInputs) return;
    this.emitFilters();
  }

  onDateModeChange(): void {
    // reset date inputs when switching mode
    this.selectedYear = '';
    this.singleDate = null;
    this.rangeStart = null;
    this.rangeEnd = null;
    if (this.isSyncingFromInputs) return;
    this.emitFilters();
  }

  handleReset() {
    this.typeFilter = 'all';
    this.decisionFilter = 'all';
    this.searchValueJobs = '';
    this.dateMode = 'all';
    this.selectedYear = '';
    this.singleDate = null;
    this.rangeStart = null;
    this.rangeEnd = null;
    if (this.isSyncingFromInputs) return;
    this.emitFilters();
  }
}
