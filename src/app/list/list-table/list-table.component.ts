import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobData, PaginationInfo } from '../../interfaces';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TableFilterComponent } from '../table-filter/table-filter.component';
import { JobService } from '../../services/job.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list-table',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatTableModule, 
    MatPaginatorModule, 
    MatSortModule, 
    MatProgressSpinnerModule,
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

  async onDecisionChange(job: JobData, newDecision: string) {
    if (!job.id || job.decision === newDecision) return;
    const updatedJob = { ...job, decision: newDecision };
    try {
      await this.jobService.putOpportunity(updatedJob);
      job.decision = newDecision;
    } catch (error) {
      // Optionally show an error message
      console.error('Error updating the decision', error);
    }
  }
  displayedColumns: string[] = ['name', 'company', 'type', 'applicationDate', 'decision'];
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
  @ViewChild(MatSort) sort: MatSort | undefined;

  constructor(
    private jobService: JobService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    // Listen to URL query params changes and update the component state accordingly
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        console.log('URL params changed:', params.keys, { 
          page: params.get('page'), 
          pageSize: params.get('pageSize'),
          isNavigatingFromPaginator: this.isNavigatingFromPaginator
        });
        
        // Skip if this navigation was triggered by our paginator
        // to avoid creating an infinite loop
        if (this.isNavigatingFromPaginator) {
          this.isNavigatingFromPaginator = false;
          return;
        }

        const pageParam = params.get('page');
        const pageSizeParam = params.get('pageSize');
        
        // Handle page - explicitly parse as number and subtract 1 for 0-based index
        if (pageParam) {
          const pageNum = parseInt(pageParam, 10);
          if (!isNaN(pageNum) && pageNum > 0) {
            this.currentPage = pageNum - 1; // Convert from 1-based (URL) to 0-based (component)
            console.log(`Setting currentPage to ${this.currentPage} from URL param ${pageParam}`);
          } else {
            this.currentPage = 0;
            console.log('Invalid page param, defaulting to 0');
          }
        } else {
          this.currentPage = 0;
          console.log('No page param, defaulting to 0');
        }

        // Handle page size
        if (pageSizeParam) {
          const size = parseInt(pageSizeParam, 10);
          if (!isNaN(size) && this.pageSizeOptions.includes(size)) {
            this.pageSize = size;
          }
        }

        // Load the data for the current page
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
    this.destroy$.next();
    this.destroy$.complete();
  }
  /**
   * Synchronizes the paginator with the current component state
   */
  private syncPaginatorWithCurrentState(): void {
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage;
      this.paginator.pageSize = this.pageSize;
    }
  }
  async loadJobs(page: number = 0, pageSize: number = 10): Promise<void> {
    console.log('Loading jobs with params:', { page, pageSize, offset: page * pageSize });
    this.loading = true;
    try {
      const response = await this.jobService.getOpportunities(pageSize, page * pageSize);
      console.log('API response:', response);
      this.paginationInfo = response.pagination;
      this.totalItems = response.pagination.total;
      
      // Process the job data
      const jobs = response.data.map(job => ({ 
        ...job, 
        id: job.id ? Number(job.id) : undefined 
      }));
      
      this.dataSource.data = jobs;
      this.allJobs = jobs; // Store for filtering
      
      // Ensure paginator reflects current page
      this.syncPaginatorWithCurrentState();
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      this.loading = false;
    }
  }
  onPageChange(event: PageEvent): void {
    console.log('Page change event:', event);
    
    // Set flag to prevent processing the URL change
    this.isNavigatingFromPaginator = true;
    
    // Update component state
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    
    console.log('Updated state:', { currentPage: this.currentPage, pageSize: this.pageSize });
    
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

  applyFilter(filteredJobs: JobData[]): void {
    // When filtering, we'll use client-side data and reset server pagination
    this.dataSource.data = filteredJobs;
    // Reset pagination info for filtered results
    this.totalItems = filteredJobs.length;
    if (this.paginationInfo) {
      this.paginationInfo = {
        ...this.paginationInfo,
        total: filteredJobs.length,
        // For client-side filtering, set offset to 0 and limit to current pageSize
        offset: 0,
        limit: this.pageSize
      };
    } else {
      this.paginationInfo = {
        total: filteredJobs.length,
        offset: 0,
        limit: this.pageSize
      };
    }

    // Reset to first page when filtering
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }

    // Update URL to reflect we're on page 1
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1
      },
      queryParamsHandling: 'merge',
    });
  }
}
