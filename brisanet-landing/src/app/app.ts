import { Component, signal } from '@angular/core';
import { Header } from './header/header';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Header],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  protected readonly title = signal('brisanet-landing');
}