import { Component, OnInit } from '@angular/core';
import { PrimeNgModule } from '../../primeng.module';
import { ThemeService } from '../../services/theme.service';
import { AsyncPipe } from '@angular/common';

interface City {
  name: string;
  code: string;
}

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [PrimeNgModule, AsyncPipe],
  template: `
  <!-- These classes will automatically switch in dark mode -->
    <div class="flex justify-end p-4 bg-theme-bg dark:bg-theme-bg-dark text-theme-text dark:text-theme-text-dark">
      <p-inputSwitch 
        [(ngModel)]="darkMode" 
        (onChange)="toggleDarkMode()"
        class="mr-2">
      </p-inputSwitch>
      <span class="text-sm">{{ (themeService.darkMode$ | async) ? 'Dark' : 'Light' }} Mode</span>
    </div>
    <div class="grid grid-cols-3 gap-4 p-4">

    <!-- For surface colors -->
    <div class="bg-theme-surface dark:bg-theme-surface-dark">
      hallo
    </div>
      <!-- Card 1 -->
      <p-card header="Primary Card" class="col-span-1">
        <div class="bg-primary-100 p-4 rounded-lg mb-4">
          <h3 class="text-primary-900 mb-2">Primary Background</h3>
          <p-button label="Primary Button" styleClass="p-button-primary"></p-button>
        </div>
      </p-card>

      <!-- Card 2 -->
      <p-card header="Form Elements" class="col-span-1">
        <div class="space-y-4">
          <p-dropdown 
            [options]="cities" 
            [(ngModel)]="selectedCity" 
            optionLabel="name" 
            placeholder="Select a City" 
            [style]="{'width': '100%'}"
            class="w-full">
          </p-dropdown>
        </div>
      </p-card>

      <!-- Card 3 -->
      <p-card header="Interactive Elements" class="col-span-1">
        <div class="space-y-4">
          <p-checkbox label="Check me" [(ngModel)]="checked"></p-checkbox>
          <div>
            <p-radioButton name="group1" value="Option 1" [(ngModel)]="selectedValue" label="Option 1"></p-radioButton>
            <p-radioButton name="group1" value="Option 2" [(ngModel)]="selectedValue" label="Option 2"></p-radioButton>
          </div>
        </div>
      </p-card>

      <!-- Full width card -->
      <p-card header="Wide Content" class="col-span-3">
        <div class="bg-primary-50 p-4 rounded-lg">
          <p-table [value]="tableData" [rows]="3" [paginator]="true">
            <ng-template pTemplate="header">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr>
                <td>{{item.id}}</td>
                <td>{{item.name}}</td>
                <td>{{item.status}}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </p-card>
    </div>
  `,
  styles: []
})
export class TestComponent implements OnInit {
  checked = false;
  selectedValue = 'Option 1';
  darkMode = false;
  selectedCity: City | undefined;

  cities: City[] = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
  ];

  tableData = [
    { id: 1, name: 'Item 1', status: 'Active' },
    { id: 2, name: 'Item 2', status: 'Pending' },
    { id: 3, name: 'Item 3', status: 'Completed' },
    { id: 4, name: 'Item 4', status: 'Active' },
    { id: 5, name: 'Item 5', status: 'Pending' }
  ];

  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
