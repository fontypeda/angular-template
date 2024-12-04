import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { PrimeNgModule } from '../../../shared/primeng.module';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [SharedModule, PrimeNgModule],
})
export class DashboardComponent implements OnInit {
  // Chart Data
  chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Users',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: '#3B82F6',
        tension: 0.4,
      },
      {
        label: 'Sessions',
        data: [28, 48, 40, 19, 86, 27, 90],
        fill: false,
        borderColor: '#F97316',
        tension: 0.4,
      },
    ],
  };

  doughnutData = {
    labels: ['Product A', 'Product B', 'Product C'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['#3B82F6', '#F97316', '#22C55E'],
      },
    ],
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  // Recent Activities
  recentActivities = [
    {
      time: new Date(),
      user: 'John Doe',
      action: 'Logged in',
      status: 'Success',
      color: '#3B82F6',
    },
    {
      time: new Date(Date.now() - 1000 * 60 * 15),
      user: 'Jane Smith',
      action: 'Updated profile',
      status: 'Info',
      color: '#F97316',
    },
    {
      time: new Date(Date.now() - 1000 * 60 * 30),
      user: 'Bob Johnson',
      action: 'File upload',
      status: 'Warning',
      color: '#22C55E',
    },
    {
      time: new Date(Date.now() - 1000 * 60 * 45),
      user: 'Alice Brown',
      action: 'Password change',
      status: 'Success',
      color: '#A855F7',
    },
    {
      time: new Date(Date.now() - 1000 * 60 * 60),
      user: 'Charlie Wilson',
      action: 'Payment processed',
      status: 'Success',
      color: '#EC4899',
    },
  ];

  constructor() {}

  ngOnInit() {}
}
