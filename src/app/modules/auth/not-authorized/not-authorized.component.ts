import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-not-authorized',
  standalone: true,
  templateUrl: './not-authorized.component.html',
  styleUrl: './not-authorized.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotAuthorizedComponent {

}
