import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ShieldService } from '../shield.service';

@Component({
  selector: 'app-canvas',
  template: `
    <svg #exportSvg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px"
      y="0px" viewBox="0 0 250 250" style="enable-background:new 0 0 250 250;" xml:space="preserve">
      <style type="text/css">
        .st0 {
          fill: {{ shieldService.primary | async }};
        }

        .st1 {
          fill: {{ shieldService.secondary | async }};
        }

        mat-icon path, mat-icon circle, mat-icon rect, mat-icon polygon {
          fill: {{ shieldService.iconColor | async }};
        }

        mat-icon path[fill="none"], mat-icon circle[fill="none"], mat-icon rect[fill="none"], mat-icon polygon[fill="none"] {
          fill: none;
        }
      </style>
      <g>
        <polygon class="st0" points="125,30 125,30 125,30 31.9,63.2 46.1,186.3 125,230 125,230 125,230 203.9,186.3 218.1,63.2  " />
        <polygon class="st1" points="125,30 125,52.2 125,52.1 125,153.4 125,153.4 125,230 125,230 203.9,186.3 218.1,63.2 125,30  " />
        <foreignObject [attr.x]="shieldService.iconX | async" [attr.y]="shieldService.iconY | async" [attr.width]="shieldService.iconSize | async" [attr.height]="shieldService.iconSize | async">
          <mat-icon [style.width.px]="shieldService.iconSize | async" [style.height.px]="shieldService.iconSize | async" [svgIcon]="namespace + ':' + (shieldService.icon | async)"></mat-icon>
        </foreignObject>
      </g>
    </svg>
    <div class="menu-buttons">
      <button (click)='export()' color="primary" mat-icon-button disableRipple>
        <mat-icon>download</mat-icon>
      </button>
    </div>

    <div class="menu-buttons left">
      <a target="_blank" href="https://twitter.com/alexbodurri" color="primary" mat-icon-button disableRipple>
        <img src="assets/twitter.svg" alt="Aleksander Bodurri's twitter">
      </a>
      <a target="_blank" href="https://github.com/aleksanderbodurri" color="primary" mat-icon-button disableRipple>
        <img src="assets/github.svg" alt="Aleksander Bodurri's Github">
      </a>
    </div>
  `,
  styles: [`
    .menu-buttons {
      position: absolute;
      top: 15px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: space-between;

      &.left {
        left: 20px;
        flex-direction: row;
        width: 100px;
      }

      &:not(.left) {
        right: 20px;
        flex-direction: column;
        height: 100px;
      }

      button {
        
        mat-icon {
          font-size: 50px;
          width: 50px;

          &:hover {
            opacity: 0.8;
          }
        }
      }

      img {
        width: 50px;
        height: 50px;

        &:hover {
          opacity: 0.8;
        }
      }
    }
  `]
})
export class CanvasComponent implements OnInit {
  @ViewChild('exportSvg') svgToExport: any;

  subscriptions: Subscription[] = []

  namespace: string = '';

  constructor(public shieldService: ShieldService) {}

  ngOnInit(): void {
    this.shieldService.icon.subscribe(() => this.namespace = this.shieldService.namespace());
  }

  export() {
    const xmlString = new XMLSerializer().serializeToString(this.svgToExport.nativeElement);
    const downloadLink = document.createElement('a');

    downloadLink.download = `shield.svg`;
    downloadLink.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xmlString)}`;
    downloadLink.click();
  }
}
