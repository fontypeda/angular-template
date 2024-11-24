import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FEATURES_ROUTES } from './features.routes';
import { FeaturesComponent } from './features.component';

@NgModule({
  imports: [
    RouterModule.forChild(FEATURES_ROUTES),
    FeaturesComponent
  ]
})
export class FeaturesModule {}
