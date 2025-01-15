import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { PageLayoutComponent } from '../../components/shared/page-layout/page-layout.component';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    CardModule,
    PageLayoutComponent
  ],
  template: `
    <app-page-layout
      title="Analytics"
      description="Track your music library statistics">
      
      <!-- Stats Grid -->
      <div class="grid">
        <!-- Summary Cards -->
        <div class="col-12 md:col-6 lg:col-3">
          <p-card styleClass="h-full">
            <div class="text-center">
              <i class="pi pi-music text-3xl text-primary mb-2"></i>
              <h3 class="text-xl font-semibold">Total Songs</h3>
              <p class="text-4xl font-bold text-surface-900">{{ totalSongs }}</p>
            </div>
          </p-card>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <p-card styleClass="h-full">
            <div class="text-center">
              <i class="pi pi-clock text-3xl text-primary mb-2"></i>
              <h3 class="text-xl font-semibold">Total Duration</h3>
              <p class="text-4xl font-bold text-surface-900">{{ totalHours }}h</p>
            </div>
          </p-card>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <p-card styleClass="h-full">
            <div class="text-center">
              <i class="pi pi-users text-3xl text-primary mb-2"></i>
              <h3 class="text-xl font-semibold">Artists</h3>
              <p class="text-4xl font-bold text-surface-900">{{ uniqueArtists }}</p>
            </div>
          </p-card>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <p-card styleClass="h-full">
            <div class="text-center">
              <i class="pi pi-inbox text-3xl text-primary mb-2"></i>
              <h3 class="text-xl font-semibold">Albums</h3>
              <p class="text-4xl font-bold text-surface-900">{{ uniqueAlbums }}</p>
            </div>
          </p-card>
        </div>

        <!-- Charts -->
        <div class="col-12 md:col-6">
          <p-card header="Top Genres" styleClass="h-full">
            <p-chart type="doughnut" [data]="genreData" [options]="chartOptions"></p-chart>
          </p-card>
        </div>

        <div class="col-12 md:col-6">
          <p-card header="Monthly Uploads" styleClass="h-full">
            <p-chart type="bar" [data]="uploadData" [options]="chartOptions"></p-chart>
          </p-card>
        </div>
      </div>
    </app-page-layout>
  `
})
export class StatsComponent implements OnInit {
  // Summary stats
  totalSongs: number = 0;
  totalHours: number = 0;
  uniqueArtists: number = 0;
  uniqueAlbums: number = 0;

  // Chart data
  genreData: any;
  uploadData: any;
  chartOptions: any;

  ngOnInit() {
    this.loadStats();
    this.initializeCharts();
  }

  loadStats() {
    // TODO: Load real stats from API
    this.totalSongs = 1234;
    this.totalHours = 82;
    this.uniqueArtists = 245;
    this.uniqueAlbums = 156;
  }

  initializeCharts() {
    this.genreData = {
      labels: ['Rock', 'Pop', 'Jazz', 'Classical', 'Electronic'],
      datasets: [{
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }]
    };

    this.uploadData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Uploads',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: '#36A2EB'
      }]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }
}
