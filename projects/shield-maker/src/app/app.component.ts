import {  Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteActivatedEvent } from '@angular/material/autocomplete';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
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

  mode: 'material' | 'custom' = 'material';

  customSvgFile: File | null = null;

  constructor(
    private _iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public shieldService: ShieldService
  ) { }

  ngOnInit(): void {
    this.lookUpIcon.pipe(debounceTime(250)).subscribe((iconLabel) => {
      this.customSvgFile = null;
      this.shieldService.svgAsString.next('');

      this._lookUpIcon(iconLabel)
    });

    this.shieldService.style.subscribe(() => this.lookUpIcon.next(this.shieldService.icon.value));
    this.shieldService.version.subscribe(() => this.lookUpIcon.next(this.shieldService.icon.value));

    this.myControl = new FormControl(this.shieldService.icon.value); 

    this.myControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      map(value => this._filter(value))
    ).subscribe((res) => {
      this.filteredOptions = res;
    });

    this.myControl.valueChanges.subscribe((option) => {
      this.shieldService.version.next(this.shieldService.iconNameToVersion[option]?.toString?.())
      this.lookUpIcon.next(option);
    });

    this.shieldService.svgAsString.subscribe((svgString) => {
      this.mode = svgString === '' ? 'material' : 'custom';
    });

    this.lookUpIcon.next(this.shieldService.icon.value);
  }

  onAutoCompleteOptionActivation(event: MatAutocompleteActivatedEvent): void {
    const option = event.option?.value;
    this.shieldService.version.next(this.shieldService.iconNameToVersion[option]?.toString?.())
    this.lookUpIcon.next(option);
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();

    return this.shieldService.materialIconNames.filter(option => option.toLowerCase().startsWith(filterValue));
  }

  getMaterialUrl(): string {
    return `https://fonts.gstatic.com/s/i/${this.shieldService.namespace()}`
  }

  onUpload(event: Event): void {
    const files = (event.target as any).files;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = ((e: any) => { 
      const encodedSVG =  e.target.result.split('data:image/svg+xml;base64,')[1];
      const svg = atob(encodedSVG);

      this.shieldService.svgAsString.next(svg);
    });

    reader.readAsDataURL(file);
  }

  doesNotExist = new Set<string>();

  private _lookUpIcon(iconLabel: string): void {
    const url = `https://fonts.gstatic.com/s/i/${this.shieldService.style.value}/${iconLabel}/v${this.shieldService.version.value}/${this.shieldService.size.value}px.svg`;

    if (this.doesNotExist.has(url)) {
      return;
    }

    fetch(url).then((res) => {
      if (!res.ok) {
        this.doesNotExist.add(url)
        return;
      }

      this.shieldService.icon.next(iconLabel);

      this._iconRegistry.addSvgIconInNamespace(
        this.shieldService.namespace(),
        this.shieldService.icon.value,
        this.domSanitizer.bypassSecurityTrustResourceUrl(this.getMaterialUrl())
      );

      this.shieldService.iconRotation.next(this.shieldService.iconRotation.value);
      
      this.loaded = true;
    });
  }

  randomInputs(): void {
    this.shieldService.primary.next(this.generateRandomColor());
    this.shieldService.iconColor.next(this.generateRandomColor());
    this.shieldService.secondary.next(this.generateRandomColor());
  }

  generateRandomColor(): string {
    // https://css-tricks.com/snippets/javascript/random-hex-color/
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }
}
