import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgModule } from '../../../primeng.module';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PrimeNgModule],
  template: `
    <div class="p-4">
      <p-card header="Admin Dashboard">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <p-card header="Users">
            <div class="text-center">
              <div class="text-4xl mb-2">150</div>
              <div class="text-gray-600">Total Users</div>
            </div>
          </p-card>
          
          <p-card header="Orders">
            <div class="text-center">
              <div class="text-4xl mb-2">45</div>
              <div class="text-gray-600">New Orders</div>
            </div>
          </p-card>
          
          <p-card header="Revenue">
            <div class="text-center">
              <div class="text-4xl mb-2">$12,450</div>
              <div class="text-gray-600">Monthly Revenue</div>
            </div>
          </p-card>
        </div>
      </p-card>
    </div>
  `
})
export class DashboardComponent {}
