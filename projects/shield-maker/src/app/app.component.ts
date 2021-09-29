import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSelectChange } from '@angular/material/select';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { ShieldService } from './shield.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  loaded = false;
  filteredOptions: string[] = [];
  lookUpIcon = new Subject<string>();
  myControl = new FormControl('');

  Math = Math;

  constructor(
    private _iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public shieldService: ShieldService
  ) { }

  ngOnInit(): void {
    this.lookUpIcon.pipe(debounceTime(250)).subscribe((iconLabel) => {
      this._lookUpIcon(iconLabel)
    });

    this.shieldService.style.subscribe(() => this.lookUpIcon.next(this.shieldService.icon.value));
    this.shieldService.version.subscribe(() => this.lookUpIcon.next(this.shieldService.icon.value));

    this.myControl = new FormControl(this.shieldService.icon.value); 

    this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    ).subscribe((res) => {
      this.filteredOptions = res;
    });

    this.myControl.valueChanges.subscribe((change) => {
      this.lookUpIcon.next(change);
    });

    this.lookUpIcon.next(this.shieldService.icon.value);
  }

  private _filter(value: string): string[] {
    if (value === '') {
      return []
    }

    const filterValue = value.toLowerCase();

    return this.shieldService.commonMaterialIcons.filter(option => option.toLowerCase().includes(filterValue));
  }

  getMaterialUrl(): string {
    return `https://fonts.gstatic.com/s/i/${this.shieldService.namespace()}`
  }

  private _lookUpIcon(iconLabel: string): void {
    fetch(`https://fonts.gstatic.com/s/i/${this.shieldService.style.value}/${iconLabel}/v${this.shieldService.version.value}/${this.shieldService.size.value}px.svg`).then((res) => {
      if (!res.ok) {
        return;
      }

      this.shieldService.icon.next(iconLabel);

      this._iconRegistry.addSvgIconInNamespace(
        this.shieldService.namespace(),
        this.shieldService.icon.value,
        this.domSanitizer.bypassSecurityTrustResourceUrl(this.getMaterialUrl())
      );

      this.loaded = true;
    })
  }
}
