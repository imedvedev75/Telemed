import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SocketIoConfig, SocketIoModule } from 'ng-socket-io';
import { SERVER_URL } from 'src/environments/environment';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { HttpClientModule } from '@angular/common/http';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { LoginPageModule } from './login/login.module';
import { RegisterPageModule } from './register/register.module';
import { IonicStorageModule } from '@ionic/storage';
import { LoginRegPage } from './login-reg/login-reg.page';
import { LoginRegPageModule } from './login-reg/login-reg.module';
import { QuestionPage } from './question/question.page';
import { QuestionPageModule } from './question/question.module';

const sio_config: SocketIoConfig = { url: SERVER_URL, options: { rejectUnauthorized: false } };

@NgModule({
  declarations: [AppComponent ],
  entryComponents: [RegisterPage, LoginPage, QuestionPage],
  imports: [BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    //LoginRegPageModule,
    LoginPageModule,
    RegisterPageModule,
    QuestionPageModule,
    IonicStorageModule.forRoot(),
    SocketIoModule.forRoot(sio_config)
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AndroidPermissions,
    Diagnostic,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
