import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

export interface ContactFormData {
  name: string;
  email?: string;
  phone?: string;
}

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule
  ],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [header]="title"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{width: '500px'}"
      [closeOnEscape]="true"
      [dismissableMask]="true"
      styleClass="p-fluid"
      (onHide)="onCancel()">
      
      <form [formGroup]="contactForm" class="space-y-4">
        <!-- Name Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <div class="relative">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-user"></i>
              <input 
                type="text" 
                pInputText 
                formControlName="name"
                class="w-full"
                placeholder="Enter contact name"/>
            </span>
          </div>
          <small class="text-red-500" *ngIf="contactForm.get('name')?.invalid && contactForm.get('name')?.touched">
            Name is required
          </small>
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div class="relative">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-envelope"></i>
              <input 
                type="email" 
                pInputText 
                formControlName="email"
                class="w-full"
                placeholder="Enter email address"/>
            </span>
          </div>
          <small class="text-red-500" *ngIf="contactForm.get('email')?.invalid && contactForm.get('email')?.touched">
            Please enter a valid email address
          </small>
        </div>

        <!-- Phone Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <div class="relative">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-phone"></i>
              <input 
                type="tel" 
                pInputText 
                formControlName="phone"
                class="w-full"
                placeholder="Enter phone number"/>
            </span>
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <button 
            pButton 
            type="button" 
            label="Cancel" 
            icon="pi pi-times"
            class="p-button-text" 
            (click)="onCancel()">
          </button>
          <button 
            pButton 
            type="submit" 
            [label]="submitLabel"
            icon="pi pi-check"
            [loading]="isSubmitting"
            [disabled]="contactForm.invalid || isSubmitting"
            (click)="onSubmit()">
          </button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: []
})
export class ContactFormComponent {
  @Input() visible = false;
  @Input() title = 'Add New Contact';
  @Input() submitLabel = 'Add Contact';
  @Input() isSubmitting = false;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<ContactFormData>();

  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: ['']
    });
  }

  onCancel(): void {
    this.contactForm.reset();
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.submit.emit(this.contactForm.value);
    }
  }
}
