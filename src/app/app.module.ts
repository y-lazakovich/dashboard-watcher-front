import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {NgxPaginationModule} from "ngx-pagination";
import {AppRoutingModule} from "./app-routing.module";
import {DashboardComponent} from "./component/dashboard/dashboard.component";
import {DashboardService} from "./service/dashboard.service";

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxPaginationModule
  ],
  providers: [DashboardService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
