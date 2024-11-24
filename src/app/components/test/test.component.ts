import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../primeng.module';
import { ConfirmationService, MessageService } from 'primeng/api';

interface City {
  name: string;
  code: string;
}

interface TimelineEvent {
  title: string;
  description: string;
}

type StatusSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PrimeNgModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  cities: City[] = [
    { name: 'New York', code: 'NY' },
    { name: 'San Francisco', code: 'SF' },
    { name: 'Los Angeles', code: 'LA' },
    { name: 'Chicago', code: 'CH' },
    { name: 'Seattle', code: 'SE' }
  ];

  timelineEvents: TimelineEvent[] = [
    {
      title: 'Modern UI Components',
      description: 'Built with PrimeNG, offering a rich set of UI components.'
    },
    {
      title: 'Responsive Design',
      description: 'Fully responsive layout using Tailwind CSS.'
    },
    {
      title: 'Dark Mode Support',
      description: 'Seamless dark mode integration with system preferences.'
    },
    {
      title: 'Type Safety',
      description: 'Built with TypeScript for better development experience.'
    }
  ];

  tableData = [
    { id: 1, name: 'Project Alpha', status: 'Active' },
    { id: 2, name: 'Project Beta', status: 'Pending' },
    { id: 3, name: 'Project Gamma', status: 'Completed' },
    { id: 4, name: 'Project Delta', status: 'On Hold' },
    { id: 5, name: 'Project Epsilon', status: 'Active' },
    { id: 6, name: 'Project Zeta', status: 'Pending' },
    { id: 7, name: 'Project Eta', status: 'Completed' }
  ];

  selectedCity: City | null = null;
  selectedDate: Date | null = null;
  rating: number = 0;
  checked: boolean = false;
  sliderValue: number = 50;
  knobValue: number = 60;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {}

  getStatusSeverity(status: string): StatusSeverity {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warn';
      case 'On Hold':
        return 'danger';
      case 'Completed':
        return 'info';
      default:
        return 'secondary';
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // Add your filter logic here
  }

  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Operation completed successfully' });
  }

  showInfo() {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Information message' });
  }

  showWarn() {
    this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Warning message' });
  }

  showError() {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error occurred' });
  }

  confirmDelete() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this record?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record deleted' });
      }
    });
  }
}
