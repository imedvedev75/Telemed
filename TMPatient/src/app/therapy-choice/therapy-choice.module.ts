import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TherapyChoicePageRoutingModule } from './therapy-choice-routing.module';

import { TherapyChoicePage } from './therapy-choice.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TherapyChoicePageRoutingModule
  ],
  declarations: [TherapyChoicePage]
})
export class TherapyChoicePageModule {}
