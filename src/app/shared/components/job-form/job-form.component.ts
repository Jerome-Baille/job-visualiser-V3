import { Component, EventEmitter, inject, Input, OnInit, Output, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { DateUtilityService, CustomDateAdapter, MY_DATE_FORMATS } from '../../services/date-utility.service';

export interface JobFormData {
  name: string;
  company: string;
  location?: string;
  type: string;
  link?: string;
  applicationDate: Date | string | null;
  interviewDate?: Date | string | null;
  decisionDate?: Date | string | null;
  decision: string;
  id?: string;
  notes?: string[];
  [key: string]: unknown;
}

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    TextFieldModule
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ],
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.scss']
})
export class JobFormComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private dateUtility = inject(DateUtilityService);

  @Input() initialData: JobFormData | null = null;
  @Input() showIcons = false;
  @Input() submitButtonText = 'Save';
  @Input() submitButtonIcon = 'save';
  @Input() isSubmitting = false;
  
  @Output() formSubmit = new EventEmitter<JobFormData>();
  @Output() linkOpen = new EventEmitter<string>();

  jobForm!: FormGroup;
  newNoteText = '';

  @ViewChildren(CdkTextareaAutosize) autosizes?: QueryList<CdkTextareaAutosize>;

  get notesArray(): FormArray {
    return this.jobForm.get('notes') as FormArray;
  }

  ngOnInit(): void {
    this.initForm();
    if (this.initialData) {
      this.loadData(this.initialData);
    }
  }

  private initForm(): void {
    this.jobForm = this.fb.group({
      name: ['', Validators.required],
      company: ['', Validators.required],
      location: [''],
      type: ['Remote', Validators.required],
      link: [''],
      applicationDate: [null, Validators.required],
      interviewDate: [null],
      decisionDate: [null],
      decision: ['unknown', Validators.required],
      id: [''],
      notes: this.fb.array([])
    });
  }

  private loadData(data: JobFormData): void {
    const processedData: Record<string, unknown> = { ...data };
    
    // Process dates
    if (data.applicationDate && typeof data.applicationDate === 'string') {
      processedData['applicationDate'] = this.dateUtility.parseStringToDate(data.applicationDate);
    }
    
    if (data.interviewDate && typeof data.interviewDate === 'string') {
      processedData['interviewDate'] = this.dateUtility.parseStringToDate(data.interviewDate);
    }
    
    if (data.decisionDate && typeof data.decisionDate === 'string') {
      processedData['decisionDate'] = this.dateUtility.parseStringToDate(data.decisionDate);
    }
    
    // Normalize values
    if (data.type) {
      processedData['type'] = this.dateUtility.normalizeJobType(String(data.type));
    }
    if (data.decision) {
      processedData['decision'] = this.dateUtility.normalizeDecision(String(data.decision));
    }

    // Load notes into FormArray
    let parsedNotes: string[] | undefined;
    const rawNotes = data.notes;
    if (typeof rawNotes === 'string') {
      try { parsedNotes = JSON.parse(rawNotes); } catch { /* ignore */ }
    } else if (Array.isArray(rawNotes)) {
      parsedNotes = rawNotes;
    }
    if (parsedNotes && Array.isArray(parsedNotes)) {
      const notesArray = this.jobForm.get('notes') as FormArray;
      notesArray.clear();
      parsedNotes.forEach(note => notesArray.push(this.fb.control(note)));
    }

    // Remove notes from processedData so patchValue doesn't try to apply it to the FormArray
    delete processedData['notes'];
    
    this.jobForm.patchValue(processedData);

    // Ensure autosize recalculates after the view updates
    setTimeout(() => this.resizeAllTextareas(), 0);
  }

  onSubmit(): void {
    if (this.jobForm.invalid) return;
    
    const formData = { ...this.jobForm.value };
    
    // Convert notes FormArray to plain array
    formData.notes = this.notesArray.controls.map(c => c.value);

    // Format dates for submission
    if (formData.applicationDate instanceof Date) {
      formData.applicationDate = this.dateUtility.formatDateForApi(formData.applicationDate);
    }
    
    if (formData.interviewDate instanceof Date) {
      formData.interviewDate = this.dateUtility.formatDateForApi(formData.interviewDate);
    }
    
    if (formData.decisionDate instanceof Date) {
      formData.decisionDate = this.dateUtility.formatDateForApi(formData.decisionDate);
    }
    
    this.formSubmit.emit(formData);
  }

  onLinkClick(url: string): void {
    this.linkOpen.emit(url);
  }

  addNote(): void {
    const text = this.newNoteText.trim();
    if (text) {
      this.notesArray.push(this.fb.control(text));
      this.newNoteText = '';
      // Give the new textarea a moment to render, then resize
      setTimeout(() => this.resizeAllTextareas(), 0);
    }
  }

  removeNote(index: number): void {
    this.notesArray.removeAt(index);
    // Recalculate heights
    setTimeout(() => this.resizeAllTextareas(), 0);
  }

  setTodayRefusal(): void {
    const now = new Date();
    this.jobForm.patchValue({
      decisionDate: now,
      decision: 'negative'
    });
  }

  get formValue(): JobFormData {
    return this.jobForm.value;
  }

  get isValid(): boolean {
    return this.jobForm.valid;
  }

  ngAfterViewInit(): void {
    // Ensure initial correct sizing once view is ready
    setTimeout(() => this.resizeAllTextareas(), 0);
  }

  private resizeAllTextareas(): void {
    this.autosizes?.forEach(s => s.resizeToFitContent(true));
  }
}
