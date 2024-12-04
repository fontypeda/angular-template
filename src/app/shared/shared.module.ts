import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeNgModule } from './primeng.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModule],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModule],
})
export class SharedModule {}
