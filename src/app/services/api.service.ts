import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Generic GET request
   * @param endpoint - API endpoint
   * @param params - Optional query parameters
   * @returns Observable of type T
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const options = { params: new HttpParams({ fromObject: params || {} }) };
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, options)
      .pipe(catchError(this.handleError));
  }

  /**
   * Generic POST request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns Observable of type T
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Generic PUT request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns Observable of type T
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Generic DELETE request
   * @param endpoint - API endpoint
   * @returns Observable of type T
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Error handler
   * @param error - HTTP error
   * @returns Observable error
   */
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
