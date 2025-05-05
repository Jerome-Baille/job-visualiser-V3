import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { JobData, PaginationInfo } from '../../interfaces';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TableFilterComponent } from '../table-filter/table-filter.component';
import { JobService } from '../../services/job.service';
import { SnackbarService } from '../../services/snackbar.service';
import { tokenRefreshCounter } from '../../interceptors/http.interceptor';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list-table',
  standalone: true,
  imports: [
    NgIf, 
    NgClass,
    NgFor,
    MatCardModule, 
    MatTableModule,    MatPaginatorModule, 
    MatSortModule, 
    MatProgressSpinnerModule,
    MatIconModule,
    RouterModule,
    TableFilterComponent,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './list-table.component.html',
  styleUrls: ['./list-table.component.scss']
})

export class ListTableComponent implements OnInit, AfterViewInit, OnDestroy {
  decisionStatuses = [
    { label: 'Positive', value: 'positive' },
    { label: 'Negative', value: 'negative' },
    { label: 'Expired', value: 'expired' },
    { label: 'In progress', value: 'in progress' },
    { label: 'Unknown', value: 'unknown' }
  ];

  // Column definitions
  displayedColumns: string[] = ['name', 'company', 'type', 'applicationDate', 'decision'];
  mobileDisplayedColumns: string[] = ['name', 'company']; // Only show these columns on mobile
  
  // Flag to track current display columns based on screen size
  isMobile = false;
  async onDecisionChange(job: JobData, newDecision: string) {
    if (!job.id || job.decision === newDecision) return;
    const updatedJob = { ...job, decision: newDecision };
    try {
      await this.jobService.putOpportunity(updatedJob);
      job.decision = newDecision;
      this.snackbarService.success(`Job "${job.name}" status updated to ${newDecision}`);
    } catch (error) {
      console.error('Error updating the decision', error);
      this.snackbarService.error('Failed to update job status. Please try again.');
    }
  }goToDetail(job: JobData): void {
    if (job && job.id) {
      this.router.navigate(['/job', job.id]);
    }
  }
  dataSource = new MatTableDataSource<JobData>([]);
  loading = true;
  totalItems = 0;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50];
  currentPage = 0;
  allJobs: JobData[] = []; // For filtering functionality
  paginationInfo: PaginationInfo | null = null;
  Math = Math; // For use in the template

  // Format a date string or Date object to dd/MM/yyyy for table display
  public formatDateDDMMYYYY(date: string | Date): string {
    if (!date) return '';
    let d: Date;
    if (typeof date === 'string') {
      // Try to parse ISO or dd/MM/yyyy
      if (date.includes('-')) {
        // ISO format
        const [year, month, day] = date.split('T')[0].split('-');
        d = new Date(Number(year), Number(month) - 1, Number(day));
      } else if (date.includes('/')) {
        // dd/MM/yyyy
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
  
  private destroy$ = new Subject<void>();
  private isNavigatingFromPaginator = false;

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;  constructor(
    private jobService: JobService,
    private route: ActivatedRoute,
    private router: Router,
    private snackbarService: SnackbarService
  ) {
    // Use effect to react to token refresh counter changes
    effect(() => {
      // Get the current value of the refresh counter signal
      const refreshCount = tokenRefreshCounter();
      
      // Skip the initial effect execution when the component is created
      if (refreshCount > 0) {
        console.log('Token refreshed, reloading data...');
        this.loadJobs(this.currentPage, this.pageSize);
      }
    });
  }ngOnInit(): void {
    // Check initial screen size and set up responsive columns
    this.checkScreenSize();
    
    // Listen for window resize events
    window.addEventListener('resize', this.onResize.bind(this));
    
    // Listen to URL query params changes and update the component state accordingly
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {        
        // Skip if this navigation was triggered by our paginator
        // to avoid creating an infinite loop
        if (this.isNavigatingFromPaginator) {
          this.isNavigatingFromPaginator = false;
          return;
        }        const pageParam = params.get('page');
        const pageSizeParam = params.get('pageSize');
        const typeParam = params.get('type');
        const statusParam = params.get('status');
        const searchParam = params.get('search');
        const includeExpiredParam = params.get('includeExpired');
        
        // Handle page - explicitly parse as number and subtract 1 for 0-based index
        if (pageParam) {
          const pageNum = parseInt(pageParam, 10);
          if (!isNaN(pageNum) && pageNum > 0) {
            this.currentPage = pageNum - 1; // Convert from 1-based (URL) to 0-based (component)
          } else {
            this.currentPage = 0;
          }
        } else {
          this.currentPage = 0;
        }

        // Handle page size
        if (pageSizeParam) {
          const size = parseInt(pageSizeParam, 10);
          if (!isNaN(size) && this.pageSizeOptions.includes(size)) {
            this.pageSize = size;
          }
        }        // Handle filter params
        this.filterType = typeParam || 'all';
        this.filterStatus = statusParam || 'all';
        this.filterSearch = searchParam || '';
        this.includeExpired = includeExpiredParam === 'true';

        // Load the data for the current page with filters
        this.loadJobs(this.currentPage, this.pageSize);
        
        // Sync paginator after a small delay to ensure it's available
        setTimeout(() => this.syncPaginatorWithCurrentState(), 0);
      });
  }

  ngAfterViewInit(): void {
    // Assign paginator and sort after view init
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    // Synchronize the paginator with the current component state
    Promise.resolve().then(() => this.syncPaginatorWithCurrentState());
  }

  ngOnDestroy(): void {
    // Remove resize listener when component is destroyed
    window.removeEventListener('resize', this.onResize.bind(this));
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle window resize events
   */
  private onResize(): void {
    this.checkScreenSize();
  }
  /**
   * Check current screen size and update displayed columns accordingly
   */
  private checkScreenSize(): void {
    const isMobileView = window.innerWidth <= 768;
    // Update displayed columns based on screen size
    if (isMobileView) {
      this.displayedColumns = ['name', 'company'];
    } else {
      this.displayedColumns = ['name', 'company', 'type', 'applicationDate', 'decision'];
    }
  }
  
  /**
   * Synchronizes the paginator with the current component state
   */
  private syncPaginatorWithCurrentState(): void {
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage;
      this.paginator.pageSize = this.pageSize;
    }
  }  // Current filter values
  filterType: string = 'all';
  filterStatus: string = 'all';
  filterSearch: string = '';
  includeExpired: boolean = false;

  async loadJobs(page: number = 0, pageSize: number = 10): Promise<void> {
    this.loading = true;
    try {
      let status = this.filterStatus;

      // Special case for status - if we're filtering for unknown AND includeExpired is true
      const response = await this.jobService.getOpportunities(
        pageSize, 
        page * pageSize,
        this.filterType,
        status,
        this.filterSearch
      );
      this.paginationInfo = response.pagination;
      this.totalItems = response.pagination.total;
      
      // Process the job data
      let jobs = response.data.map(job => ({ 
        ...job, 
        id: job.id ? Number(job.id) : undefined 
      }));

      // If including expired and we're filtering by unknown, we need to add a client-side filter
      // for expired jobs too
      if (this.includeExpired && this.filterStatus === 'unknown') {
        // Make another request to get expired jobs
        const expiredResponse = await this.jobService.getOpportunities(
          pageSize, 
          page * pageSize,
          this.filterType,
          'expired',
          this.filterSearch
        );
        
        // Add the expired jobs to our dataset
        const expiredJobs = expiredResponse.data.map(job => ({ 
          ...job, 
          id: job.id ? Number(job.id) : undefined 
        }));
        
        // Combine the unknown and expired jobs
        jobs = [...jobs, ...expiredJobs];
        
        // Update the total count to reflect both sets
        this.totalItems += expiredResponse.pagination.total;
      }
      
      this.dataSource.data = jobs;
      this.allJobs = jobs;
      
      // Ensure paginator reflects current page
      this.syncPaginatorWithCurrentState();
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      this.snackbarService.error('Failed to load jobs. Please try again.');
    } finally {
      this.loading = false;
    }
  }onPageChange(event: PageEvent): void {
    // Set flag to prevent processing the URL change
    this.isNavigatingFromPaginator = true;
    
    // Update component state
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    // Update URL query params and then load data directly
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage + 1, // URL uses 1-based indexing
        pageSize: this.pageSize
      },
      queryParamsHandling: 'merge',
    }).then(() => {
      // Load data directly instead of depending on URL change subscription
      this.loadJobs(this.currentPage, this.pageSize);
    });
  }
  onFilterChange(filter: { type: string; status: string; search: string }): void {
    this.filterType = filter.type;
    this.filterStatus = filter.status;
    this.filterSearch = filter.search;
    
    // Reset to first page when filtering
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
      // Update URL to reflect we're on page 1
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1,
        type: filter.type !== 'all' ? filter.type : null,
        status: filter.status !== 'all' ? filter.status : null,
        search: filter.search ? filter.search : null,
        includeExpired: this.includeExpired ? 'true' : null
      },
      queryParamsHandling: 'merge',
    }).then(() => {
      // Load jobs with the new filter parameters
      this.loadJobs(this.currentPage, this.pageSize);
    });
  }
}
