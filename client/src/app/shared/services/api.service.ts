import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IApiResponse, IPaginationResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: any): Observable<IApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<IApiResponse<T>>(`${this.apiUrl}${endpoint}`, { params: httpParams });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any): Observable<IApiResponse<T>> {
    return this.http.post<IApiResponse<T>>(`${this.apiUrl}${endpoint}`, body);
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any): Observable<IApiResponse<T>> {
    return this.http.put<IApiResponse<T>>(`${this.apiUrl}${endpoint}`, body);
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<IApiResponse<T>> {
    return this.http.delete<IApiResponse<T>>(`${this.apiUrl}${endpoint}`);
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: any): Observable<IApiResponse<T>> {
    return this.http.patch<IApiResponse<T>>(`${this.apiUrl}${endpoint}`, body);
  }
}
