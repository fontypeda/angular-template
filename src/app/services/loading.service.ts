import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();

  constructor(private router: Router) {
    // Subscribe to router events to track loading state
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loading.next(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loading.next(false);
      }
    });
  }

  setLoading(isLoading: boolean) {
    this.loading.next(isLoading);
  }
}
