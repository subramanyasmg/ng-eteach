import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-circle-progress',
  imports: [],
  standalone: true,
  templateUrl: './circle-progress.component.html',
  styleUrl: './circle-progress.component.scss'
})
export class CircleProgressComponent {

  @Input() progress = 0; // progress in percentage (0 to 100)
  

  private radius = 22.5;
  private circumference = 2 * Math.PI * this.radius;

  get dashOffset(): number {
    return this.circumference - (this.progress / 100) * this.circumference;
  }

  get circumferenceValue(): number {
    return this.circumference;
  }

}
