import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    children: [
      {
        path: 'therapy-choice',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../therapy-choice/therapy-choice.module').then(m => m.TherapyChoicePageModule)
          }
        ]
      },
      {
        path: 'my-sessions',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../my-sessions/my-sessions.module').then(m => m.MySessionsPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/dashboard/therapy-choice',
        pathMatch: 'full'
      }      
    ]
  },
  {
    path: '',
    redirectTo: '/dashboard/therapy-choice',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardPageRoutingModule {}
