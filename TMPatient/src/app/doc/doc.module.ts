import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocPageRoutingModule } from './doc-routing.module';

import { DocPage } from './doc.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocPageRoutingModule
  ],
  declarations: [DocPage]
})
export class DocPageModule {}
