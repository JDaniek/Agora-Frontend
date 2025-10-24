import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-asesor',
  imports: [],
  templateUrl: './dashboard-asesor.html',
  styleUrl: './dashboard-asesor.css'
})
export class DashboardAsesor {
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}
