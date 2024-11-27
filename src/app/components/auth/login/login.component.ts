import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PrimeNgModule } from '../../../primeng.module';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { primaryColors, secondaryColors } from '../../../config/colors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading: boolean = false;
  errorMessage: string | null = null;
  meshStyle: { [key: string]: string } = {};

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.meshStyle = {
      backgroundColor: primaryColors[500],
      backgroundImage: `
        radial-gradient(at 40% 20%, ${primaryColors[100]} 0px, transparent 50%),
        radial-gradient(at 80% 0%, ${primaryColors[200]} 0px, transparent 50%),
        radial-gradient(at 0% 50%, ${primaryColors[50]} 0px, transparent 50%),
        radial-gradient(at 80% 50%, ${primaryColors[400]} 0px, transparent 50%),
        radial-gradient(at 0% 100%, ${secondaryColors[200]} 0px, transparent 50%),
        radial-gradient(at 80% 100%, ${primaryColors[600]} 0px, transparent 50%),
        radial-gradient(at 0% 0%, ${secondaryColors[300]} 0px, transparent 50%)
      `
    };
  }

  ngOnInit(): void {
    this.errorMessage = '';
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Login successful!'
        });
        setTimeout(() => this.router.navigate(['/']), 1000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
}
