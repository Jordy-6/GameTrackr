import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: ` <main class="container mx-auto p-4"><router-outlet></router-outlet></main> `,
  styleUrls: [],
})
export class App {
  protected readonly title = signal('GameTrackr');
}
