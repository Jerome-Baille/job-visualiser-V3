import { Component, OnInit } from '@angular/core';
import { OpportunitiesStats } from '../../interfaces';
import { JobService } from '../../services/job.service';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexTitleSubtitle, ApexPlotOptions, ApexFill, ApexStroke, ApexYAxis, ApexLegend, ApexTooltip, ApexResponsive, ApexNonAxisChartSeries, ApexTheme } from 'ng-apexcharts';

@Component({
  selector: 'app-chart-container',
  standalone: true,
  imports: [NgIf, MatIconModule, NgApexchartsModule],
  templateUrl: './chart-container.component.html',
  styleUrls: ['./chart-container.component.scss']
})
export class ChartContainerComponent implements OnInit {
  stats: OpportunitiesStats | null = null;
  loading = true;

  // Chart options
  applicationsPerMonthSeries: ApexAxisChartSeries = [];
  applicationsPerMonthChart: ApexChart = { type: 'line', height: 250, width: '100%', toolbar: { show: false } };
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

  constructor(private jobService: JobService) {}

  async ngOnInit() {
    this.loading = true;
    try {
      this.stats = await this.jobService.getOpportunitiesStats();
      this.setChartsFromStats();
    } finally {
      this.loading = false;
    }
  }

  setChartsFromStats() {
    if (!this.stats) return;
    // Applications per month (convert object to sorted arrays)
    const months = Object.keys(this.stats.applicationsPerMonth).sort();
    const counts = months.map(m => this.stats!.applicationsPerMonth[m]);
    this.applicationsPerMonthSeries = [{ name: 'Applications', data: counts }];
    this.applicationsPerMonthXAxis = { categories: months };

    // Decision outcomes (handle 'in progress' key)
    const d = this.stats.decisionOutcomes;
    this.decisionSeries = [
      d.positive || 0,
      d.negative || 0,
      d['in progress'] || 0,
      d.expired || 0,
      d.unknown || 0
    ];

    // Funnel (map new keys)
    this.funnelSeries = [{
      name: 'Funnel',
      data: [
        this.stats.funnel.totalApplications,
        this.stats.funnel.totalResponses,
        this.stats.funnel.totalInterviews
      ]
    }];
    this.conversionAppToResponse = this.stats.conversionRates.applicationsToResponses;
    this.conversionResponseToInterview = this.stats.conversionRates.responsesToInterviews;
  }
}
