import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeKa from '@angular/common/locales/ka';

registerLocaleData(localeKa);

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
