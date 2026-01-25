import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { CoreModule } from './app/core/core.module';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AppRoutingModule, CoreModule),
    provideHttpClient(),
    provideRouter([])
  ]
}).catch(err => console.error(err));
