import {Component, OnInit} from '@angular/core';
import {HttpErrorResponse} from "@angular/common/http";
import {Chart, ChartItem, registerables} from "chart.js";
import {SystemHealth} from "../../interface/system-health";
import {SystemCpu} from "../../interface/system-cpu";
import {DashboardService} from "../../service/dashboard.service";
import {ChartType} from "../../enum/chart-type";

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public traceList: any[] = [];
  public selectedTrace: any;
  public systemHealth!: SystemHealth;
  public systemCpu!: SystemCpu;
  public processUptime!: string;
  public http200traces: any[] = [];
  public http400traces: any[] = [];
  public http404traces: any[] = [];
  public http500traces: any[] = [];
  public httpDefaultTraces: any[] = [];
  public timestamp!: number;
  public pageSize: number = 10;
  public page: number = 1;

  constructor(private dashboardService: DashboardService) {
  }

  ngOnInit(): void {
    this.getTraces();
    this.getCpuUsage();
    this.getSystemHealth();
    this.getProccessUptime(true);
  }

  public onSelectTrace(trace: any) {
    this.selectedTrace = trace;
    document.getElementById('trace-modal')!.click();
  }

  public onRefreshData(): void {
    this.http200traces = [];
    this.http400traces = [];
    this.http404traces = [];
    this.http500traces = [];
    this.httpDefaultTraces = [];
    this.getTraces();
    this.getCpuUsage();
    this.getSystemHealth();
    this.getProccessUptime(false);
  }

  public exportTableToExcel(): void {
    const downloadLink = document.createElement('a');
    const dataType = 'application/vnd.ms-excel';
    const table = document.getElementById('httptrace-table');
    const tableHtml = table!.outerHTML.replace(/ /g, '%20');
    document.body.appendChild(downloadLink);
    downloadLink.href = 'data:' + dataType + ' ' + tableHtml;
    downloadLink.download = 'httptrace.xls';
    downloadLink.click();
  }

  private initializeBarChart(): Chart {
    const element = document.getElementById('barChart') as ChartItem;
    return new Chart(element, {
      type: ChartType.BAR,
      data: {
        labels: ['200', '404', '400', '500'],
        datasets: [{
          data: [this.http200traces.length, this.http404traces.length, this.http400traces.length, this.http500traces.length],
          backgroundColor: ['rgb(40,167,69)', 'rgb(0,123,255)', 'rgb(253,126,20)', 'rgb(220,53,69)'],
          borderColor: ['rgb(40,167,69)', 'rgb(0,123,255)', 'rgb(253,126,20)', 'rgb(220,53,69)'],
          borderWidth: 3
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Last 100 Requests as of ${this.formatDate(new Date())}`
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private initializePieChart(): Chart {
    const element = document.getElementById('pieChart') as ChartItem;
    return new Chart(element, {
      type: ChartType.PIE,
      data: {
        labels: ['200', '404', '400', '500'],
        datasets: [{
          data: [this.http200traces.length, this.http404traces.length, this.http400traces.length, this.http500traces.length],
          backgroundColor: ['rgb(40,167,69)', 'rgb(0,123,255)', 'rgb(253,126,20)', 'rgb(220,53,69)'],
          borderColor: ['rgb(40,167,69)', 'rgb(0,123,255)', 'rgb(253,126,20)', 'rgb(220,53,69)'],
          borderWidth: 3
        }]
      },
      options: {
        aspectRatio: 2,
        responsive: true,
        plugins: {
          legend: {
            display: true
          },
          title: {
            display: true,
            text: `Last 100 Requests as of ${this.formatDate(new Date())}`
          }
        },
      }
    });
  }


  private getTraces(): void {
    this.dashboardService.getHttpTraces().subscribe(
      (response: any) => {
        this.processTraces(response.traces);
        this.initializeBarChart();
        this.initializePieChart();
      },
      (error: HttpErrorResponse) => {
        console.log(error.message);
      }
    );
  }

  private getCpuUsage(): void {
    this.dashboardService.getSystemCpu().subscribe(
      (response: SystemCpu) => {
        this.systemCpu = response;
      },
      (error: HttpErrorResponse) => {
        console.log(error.message);
      }
    );
  }

  private getSystemHealth(): void {
    this.dashboardService.getSystemHealth().subscribe(
      (response: SystemHealth) => {
        this.systemHealth = response;
        this.systemHealth.components.diskSpace.details.free = this.formatBytes(this.systemHealth.components.diskSpace.details.free);
      },
      (error: HttpErrorResponse) => {
        console.log(error.message);
      }
    );
  }

  private getProccessUptime(isUpdateTime: boolean): void {
    this.dashboardService.getProcessUpTime().subscribe(
      (response: any) => {
        this.timestamp = Math.round(response.measurements[0].value);
        this.processUptime = this.formateUptime(this.timestamp);
        if (isUpdateTime) {
          this.updateTime();
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error.message);
      }
    );
  }

  private processTraces(traces: any) {
    this.traceList = traces.filter((trace: { request: { uri: string | string[]; }; }) => {
      return !trace.request.uri.includes('actuator');
    });
    this.traceList.forEach(trace => {
      switch (trace.response.status) {
        case 200:
          this.http200traces.push(trace);
          break;
        case 400:
          this.http400traces.push(trace);
          break;
        case 404:
          this.http404traces.push(trace);
          break;
        case 500:
          this.http500traces.push(trace);
          break;
        default:
          this.httpDefaultTraces.push(trace);
      }
    });
  }

  private formatBytes(bytes: any): string {
    if (bytes === 0) {
      return "0 Bytes"
    }
    const k = 1024;
    const dm = 2 < 0 ? 0 : 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  private formateUptime(timestamp: number): string {
    const hours = Math.floor(timestamp / 60 / 60);
    const minutes = Math.floor(timestamp / 60) - (hours * 60);
    const seconds = timestamp % 60;
    return hours.toString().padStart(2, '0') + 'h' +
      minutes.toString().padStart(2, '0') + 'm' + seconds.toString().padStart(2, '0') + 's';
  }

  private updateTime() {
    setInterval(() => {
      this.processUptime = this.formateUptime(this.timestamp + 1);
      this.timestamp++;
    }, 1000);
  }

  private formatDate(date: Date): string {
    const dd = date.getDate();
    const mm = date.getMonth() + 1;
    const year = date.getFullYear();
    if (dd < 10) {
      const day = `0${dd}`;
    }
    if (mm < 10) {
      const month = `0${mm}`;
    }
    return `${mm}/${dd}/${year}`;
  }

}
