import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginRegPageRoutingModule } from './login-reg-routing.module';

import { LoginRegPage } from './login-reg.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginRegPageRoutingModule
  ],
  declarations: [LoginRegPage]
})
export class LoginRegPageModule {}
