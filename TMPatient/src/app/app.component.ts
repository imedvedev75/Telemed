import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { G } from './g.service';
import { LoginPage } from './login/login.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  //rootPage:any = LoginPage;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private g: G
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    this.statusBar.styleDefault();
    this.splashScreen.hide();
    var is_logged = await this.g.check_login();
    if (!is_logged) {
      //this.router.navigate(['/login']);
    }
    else {
      var profile = await this.g.post('/get_profile', {});
      if (!profile)
        this.router.navigate(['/chat']);
      else 
        this.router.navigate(['/dashboard/therapy-choice']);
    }
  }
}
