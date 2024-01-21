import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginRegPage } from './login-reg.page';

const routes: Routes = [
  {
    path: '',
    component: LoginRegPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRegPageRoutingModule {}
