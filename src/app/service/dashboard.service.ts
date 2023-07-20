import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private SERVER_URL = environment.serverUrl;

  constructor(private http: HttpClient) {
  }

  public getHttpTraces(): Observable<any> {
    return this.http.get<any>(`${this.SERVER_URL}/httptrace`);
  }

  public getSystemHealth(): Observable<any> {
    return this.http.get<any>(`${this.SERVER_URL}/health`);
  }

  public getSystemCpu(): Observable<any> {
    return this.http.get<any>(`${this.SERVER_URL}/metrics/system.cpu.count`);
  }

  public getProcessUpTime(): Observable<any> {
    return this.http.get<any>(`${this.SERVER_URL}/metrics/process.uptime`);
  }
}
