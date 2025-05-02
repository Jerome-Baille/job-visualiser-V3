import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobData, PaginationInfo } from '../interfaces';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { TableFilterComponent } from './table-filter.component';
import { JobService } from '../services/job.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list-table',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, TableFilterComponent],
  templateUrl: './list-table.component.html'
})
export class ListTableComponent implements OnInit, AfterViewInit, OnDestroy {
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
  
  private destroy$ = new Subject<void>();
  private isNavigatingFromPaginator = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private jobService: JobService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit() {
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

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    
    // Synchronize the paginator with the current component state
    this.syncPaginatorWithCurrentState();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  /**
   * Synchronizes the paginator with the current component state
   */
  private syncPaginatorWithCurrentState() {
    if (this.paginator) {
      console.log('Syncing paginator with state:', { 
        currentPage: this.currentPage, 
        pageSize: this.pageSize,
        currentPaginatorIndex: this.paginator.pageIndex
      });
      this.paginator.pageIndex = this.currentPage;
      this.paginator.pageSize = this.pageSize;
      // Force change detection
      setTimeout(() => {
        console.log('After sync:', { paginator: this.paginator.pageIndex, currentPage: this.currentPage });
      }, 0);
    }
  }
  async loadJobs(page: number = 0, pageSize: number = 10) {
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
  onPageChange(event: PageEvent) {
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

  applyFilter(filteredJobs: JobData[]) {
    // When filtering, we'll use client-side data and reset server pagination
    this.dataSource.data = filteredJobs;
    // Reset pagination info for filtered results
    if (this.paginationInfo) {
      this.totalItems = filteredJobs.length;
    }
    
    // Reset to first page when filtering
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
