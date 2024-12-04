import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent {
  // Assets
  logoPath = 'assets/images/logo.svg';
  illustrationPath = 'assets/images/404.svg';
  backGroundPath = 'assets/images/bg.jpg';

  // Text content
  title = 'Page not found';
  message = "Sorry, we couldn't find the page you're looking for.";
  backToHomeText = 'Back to home';
  supportText = 'Contact support';
  statusText = 'Status';
}
