import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
  Component,
  ViewChild,
  effect,
  signal,
  inject, OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TableFilterComponent } from '../table-filter/table-filter.component';
import { JobService } from '../../../core/services/job.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { JobData, PaginationInfo } from '../../../shared/interfaces';
import { tokenRefreshCounter } from '../../../core/interceptors/http.interceptor';

@Component({
  selector: 'app-list-table',
  standalone: true,
  imports: [
    NgClass,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    RouterModule,
    TableFilterComponent,
    MatFormFieldModule,
    MatSelectModule
],
  templateUrl: './list-table.component.html',
  styleUrls: ['./list-table.component.scss'],
})
export class ListTableComponent implements OnDestroy {
  private jobService = inject(JobService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackbarService = inject(SnackbarService);

  readonly decisionStatuses = [
    { label: 'Positive', value: 'positive' },
    { label: 'Negative', value: 'negative' },
    { label: 'Expired', value: 'expired' },
    { label: 'In progress', value: 'in progress' },
    { label: 'Unknown', value: 'unknown' },
  ];

  readonly pageSizeOptions = [10, 20, 50];
  readonly Math = Math;

  readonly loading = signal(true);
  readonly jobs = signal<JobData[]>([]);
  readonly totalItems = signal(0);
  readonly pageSize = signal(10);
  readonly currentPage = signal(0);
  readonly paginationInfo = signal<PaginationInfo | null>(null);
  readonly filterType = signal('all');
  readonly filterStatus = signal('all');
  readonly filterSearch = signal('');
  readonly includeExpired = signal(false);
  readonly displayedColumns = signal<string[]>([
    'name',
    'company',
    'type',
    'applicationDate',
    'decision',
  ]);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  dataSource = new MatTableDataSource<JobData>([]);
  private isNavigatingFromPaginator = false;

  constructor() {
    effect(() => {
      const refreshCount = tokenRefreshCounter();
      if (refreshCount > 0) {
        this.loadJobs(this.currentPage(), this.pageSize());
      }
    });

    window.addEventListener('resize', this.onResize);

    this.route.queryParamMap.subscribe((params) => {
      if (this.isNavigatingFromPaginator) {
        this.isNavigatingFromPaginator = false;
        return;
      }
      const pageParam = params.get('page');
      const pageSizeParam = params.get('pageSize');
      const typeParam = params.get('type');
      const statusParam = params.get('status');
      const searchParam = params.get('search');
      const includeExpiredParam = params.get('includeExpired');

      // Handle page
      if (pageParam) {
        const pageNum = parseInt(pageParam, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
          this.currentPage.set(pageNum - 1);
        } else {
          this.currentPage.set(0);
        }
      } else {
        this.currentPage.set(0);
      }

      // Handle page size
      if (pageSizeParam) {
        const size = parseInt(pageSizeParam, 10);
        if (!isNaN(size) && this.pageSizeOptions.includes(size)) {
          this.pageSize.set(size);
        }
      }

      this.filterType.set(typeParam || 'all');
      this.filterStatus.set(statusParam || 'all');
      this.filterSearch.set(searchParam || '');
      this.includeExpired.set(includeExpiredParam === 'true');

      this.loadJobs(this.currentPage(), this.pageSize());
      setTimeout(() => this.syncPaginatorWithCurrentState(), 0);
    });

    // Initial screen size
    this.checkScreenSize();
  }

  // Clean up
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
  }

  // Responsive columns
  private onResize = () => {
    this.checkScreenSize();
  };

  private checkScreenSize(): void {
    const isMobileView = window.innerWidth <= 768;
    if (isMobileView) {
      this.displayedColumns.set(['name', 'company']);
    } else {
      this.displayedColumns.set([
        'name',
        'company',
        'type',
        'applicationDate',
        'decision',
      ]);
    }
  }

  private syncPaginatorWithCurrentState(): void {
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage();
      this.paginator.pageSize = this.pageSize();
    }
  }

  // Format a date string or Date object to dd/MM/yyyy for table display
  public formatDateDDMMYYYY(date: string | Date): string {
    if (!date) return '';
    let d: Date;
    if (typeof date === 'string') {
      if (date.includes('-')) {
        const [year, month, day] = date.split('T')[0].split('-');
        d = new Date(Number(year), Number(month) - 1, Number(day));
      } else if (date.includes('/')) {
        const [day, month, year] = date.split('/');
        d = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        d = new Date(date);
      }
    } else {
      d = date;
    }
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  async onDecisionChange(job: JobData, newDecision: string) {
    if (!job.id || job.decision === newDecision) return;
    const updatedJob = { ...job, decision: newDecision };
    try {
      await this.jobService.putOpportunity(updatedJob);
      job.decision = newDecision;
      this.snackbarService.success(
        `Job "${job.name}" status updated to ${newDecision}`
      );
    } catch (error) {
      console.error('Error updating the decision', error);
      this.snackbarService.error(
        'Failed to update job status. Please try again.'
      );
    }
  }



  async loadJobs(page = 0, pageSize = 10): Promise<void> {
    this.loading.set(true);
    try {
      const status = this.filterStatus();
      const response = await this.jobService.getOpportunities(
        pageSize,
        page * pageSize,
        this.filterType(),
        status,
        this.filterSearch()
      );
      this.paginationInfo.set(response.pagination);
      this.totalItems.set(response.pagination.total);

      let jobs = response.data.map((job: JobData) => ({
        ...job,
        id: job.id != null ? Number(job.id) : undefined,
      }));

      if (this.includeExpired() && this.filterStatus() === 'unknown') {
        const expiredResponse = await this.jobService.getOpportunities(
          pageSize,
          page * pageSize,
          this.filterType(),
          'expired',
          this.filterSearch()
        );
        const expiredJobs = expiredResponse.data.map((job: JobData) => ({
          ...job,
          id: job.id != null ? Number(job.id) : undefined,
        }));
        jobs = [...jobs, ...expiredJobs];
        this.totalItems.set(
          this.totalItems() + expiredResponse.pagination.total
        );
      }

      this.jobs.set(jobs);
      this.dataSource.data = jobs;
      this.syncPaginatorWithCurrentState();
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      this.snackbarService.error('Failed to load jobs. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
  onPageChange(event: PageEvent): void {
    this.isNavigatingFromPaginator = true;
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: this.currentPage() + 1,
          pageSize: this.pageSize(),
        },
        queryParamsHandling: 'merge',
      })
      .then(() => {
        this.loadJobs(this.currentPage(), this.pageSize());
      });
  }

  onFilterChange(filter: {
    type: string;
    status: string;
    search: string;
  }): void {
    this.filterType.set(filter.type);
    this.filterStatus.set(filter.status);
    this.filterSearch.set(filter.search);
    this.currentPage.set(0);
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: 1,
          type: filter.type !== 'all' ? filter.type : null,
          status: filter.status !== 'all' ? filter.status : null,
          search: filter.search ? filter.search : null,
          includeExpired: this.includeExpired() ? 'true' : null,
        },
        queryParamsHandling: 'merge',
      })
      .then(() => {
        this.loadJobs(this.currentPage(), this.pageSize());
      });
  }
}
