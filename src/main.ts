import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

const firebaseConfigured = !!environment.firebaseConfig.apiKey;

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    ...(firebaseConfigured ? [
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideFirestore(() => getFirestore()),
      provideAuth(() => getAuth()),
    ] : []),
  ],
}).catch(err => console.error(err));
