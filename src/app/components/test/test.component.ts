import { Component, OnInit } from '@angular/core';
import { PrimeNgModule } from '../../primeng.module';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';

interface City {
  name: string;
  code: string;
}

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [PrimeNgModule, AsyncPipe, FormsModule],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
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

  ngOnInit(): void {
    this.themeService.darkMode$.subscribe((isDark: boolean) => {
      this.darkMode = isDark;
    });
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
}
