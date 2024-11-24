import { Component } from '@angular/core';
import { PrimeNgModule } from '../../primeng.module';
import { AsyncPipe } from '@angular/common';

interface City {
  name: string;
  code: string;
}

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [PrimeNgModule, AsyncPipe],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent {
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
