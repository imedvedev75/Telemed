import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { LoginPage } from './login.page';
//import { RegisterPage } from '../register/register.page';
//import { RegisterPageModule } from '../register/register.module';

const routes: Routes = [
  {
    path: '',
    component: LoginPage
  }
];

@NgModule({
  entryComponents: [],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    //RegisterPageModule,
    RouterModule.forChild(routes),
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
