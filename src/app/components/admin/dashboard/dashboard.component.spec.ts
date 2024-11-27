import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display dashboard stats', () => {
    component.totalUsers = 100;
    component.activeSessions = 50;
    component.systemStatus = 'Healthy';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.stat-card:nth-child(1) p')?.textContent).toContain('100');
    expect(compiled.querySelector('.stat-card:nth-child(2) p')?.textContent).toContain('50');
    expect(compiled.querySelector('.stat-card:nth-child(3) p')?.textContent).toContain('Healthy');
  });

  it('should display recent activities', () => {
    const mockActivities = [
      { time: new Date(), description: 'Test activity' }
    ];
    component.recentActivities = mockActivities;
    fixture.detectChanges();

    const activityElements = fixture.nativeElement.querySelectorAll('.activity-item');
    expect(activityElements.length).toBe(mockActivities.length);
  });
});
