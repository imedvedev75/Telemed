import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TherapyChoicePage } from './therapy-choice.page';

const routes: Routes = [
  {
    path: '',
    component: TherapyChoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TherapyChoicePageRoutingModule {}
