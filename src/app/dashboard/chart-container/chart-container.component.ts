import { Component, Input, OnChanges } from '@angular/core';
import { JobData } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexTitleSubtitle, ApexPlotOptions, ApexFill, ApexStroke, ApexYAxis, ApexLegend, ApexTooltip, ApexResponsive, ApexNonAxisChartSeries, ApexTheme } from 'ng-apexcharts';

@Component({
  selector: 'app-chart-container',
  standalone: true,
  imports: [CommonModule, MatIconModule, NgApexchartsModule],
  templateUrl: './chart-container.component.html',
  styleUrls: ['./chart-container.component.scss']
})
export class ChartContainerComponent implements OnChanges {
  @Input() jobs: JobData[] = [];

  // Chart options
  applicationsPerMonthSeries: ApexAxisChartSeries = [];
  applicationsPerMonthChart: ApexChart = { type: 'line', height: 250, toolbar: { show: false } };
  applicationsPerMonthXAxis: Partial<ApexXAxis> = { categories: [] };
  applicationsPerMonthColors = ['#FCE7AA'];

  decisionSeries: ApexNonAxisChartSeries = [];
  decisionLabels: string[] = ['Positive', 'Negative', 'In Progress', 'Expired', 'Unknown'];
  decisionColors = ['#4caf50', '#f44336', '#2196f3', '#9e9e9e', '#ffeb3b'];

  funnelSeries: ApexAxisChartSeries = [];
  funnelChart: ApexChart = { type: 'bar', height: 250, toolbar: { show: false } };
  funnelXAxis: Partial<ApexXAxis> = { categories: ['Applications', 'Responses', 'Interviews'] };
  funnelColors = ['#FFF0C5', '#2196f3', '#4caf50'];
  conversionAppToResponse: number = 0;
  conversionResponseToInterview: number = 0;

  ngOnChanges() {
    this.prepareApplicationsPerMonth();
    this.prepareDecisionChart();
    this.prepareFunnelChart();
  }

  // Remove unused response time chart properties if present

  prepareApplicationsPerMonth() {
    const monthMap: { [key: string]: number } = {};
    this.jobs.forEach(job => {
      if (job.applicationDate) {
        const month = job.applicationDate.slice(0, 7); // YYYY-MM
        monthMap[month] = (monthMap[month] || 0) + 1;
      }
    });
    const months = Object.keys(monthMap).sort();
    this.applicationsPerMonthSeries = [{ name: 'Applications', data: months.map(m => monthMap[m]) }];
    this.applicationsPerMonthXAxis = { categories: months };
  }

  prepareDecisionChart() {
    const counts: Record<'positive' | 'negative' | 'in progress' | 'expired' | 'unknown', number> = {
      positive: 0,
      negative: 0,
      'in progress': 0,
      expired: 0,
      unknown: 0
    };
    this.jobs.forEach(job => {
      if (job.decision) {
        const key = job.decision.toLowerCase() as keyof typeof counts;
        if (key in counts) counts[key]++;
        else counts.unknown++;
      } else {
        counts.unknown++;
      }
    });
    this.decisionSeries = [counts.positive, counts.negative, counts['in progress'], counts.expired, counts.unknown];
  }

  prepareFunnelChart() {
    const total = this.jobs.length;
    // Responses: jobs with a decision (positive, negative, in progress)
    const responses = this.jobs.filter(j => {
      const d = (j.decision || '').toLowerCase();
      return d === 'positive' || d === 'negative' || d === 'in progress';
    }).length;
    // Interviews: jobs for which decision is 'in progress'
    const interviews = this.jobs.filter(j => (j.decision || '').toLowerCase() === 'in progress').length;
    this.funnelSeries = [{ name: 'Funnel', data: [total, responses, interviews] }];
    this.conversionAppToResponse = total ? Math.round((responses / total) * 100) : 0;
    this.conversionResponseToInterview = responses ? Math.round((interviews / responses) * 100) : 0;
  }
}
