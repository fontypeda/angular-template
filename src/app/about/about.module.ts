import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ABOUT_ROUTES } from './about.routes';
import { AboutComponent } from './about.component';

@NgModule({
  imports: [
    RouterModule.forChild(ABOUT_ROUTES),
    AboutComponent
  ]
})
export class AboutModule {}
