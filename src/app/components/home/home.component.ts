import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeNgModule } from '../../shared/primeng.module';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PrimeNgModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
