import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../shared/shared.module';
import { HomeComponent } from './home.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [
        SharedModule,
        ButtonModule,
        CardModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render hero section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome to Our Platform');
  });

  it('should render all feature cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const features = compiled.querySelectorAll('.grid-cols-1.md\\:grid-cols-3 > div');
    expect(features.length).toBe(3);
  });

  it('should render statistics section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const stats = compiled.querySelectorAll('.md\\:grid-cols-4 > div');
    expect(stats.length).toBe(4);
  });

  it('should render CTA section with buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('p-button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
