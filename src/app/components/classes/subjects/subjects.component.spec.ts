import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectsComponent } from './subjects.component';
import { SubjectsService } from './subject.service';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Subject } from '../classes.model';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

const mockSubjects: Subject[] = [
  { id: '1', name: 'Math', isPublic: false },
  { id: '2', name: 'Physics', isPublic: true },
];

const subjectsServiceStub = {
  getSubjects$: jasmine
    .createSpy('getSubjects$')
    .and.returnValue(of(mockSubjects)),
  addSubject: jasmine.createSpy('addSubject'),
  updateSubject: jasmine.createSpy('updateSubject'),
  deleteSubject: jasmine.createSpy('deleteSubject'),
};

const toastrStub = {
  success: jasmine.createSpy('success'),
  error: jasmine.createSpy('error'),
};

describe('SubjectsComponent', () => {
  let component: SubjectsComponent;
  let fixture: ComponentFixture<SubjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SubjectsComponent,
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatInputModule,
      ],
      providers: [
        { provide: SubjectsService, useValue: subjectsServiceStub },
        { provide: ToastrService, useValue: toastrStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load subjects from service', (done) => {
    component.subjects$.subscribe((subjects) => {
      expect(subjects.length).toBe(2);
      expect(subjects[0].name).toBe('Math');
      done();
    });
  });

  it('should toggle add input visibility', () => {
    expect(component.showAddInput).toBeFalse();
    component.toggleAddInput();
    expect(component.showAddInput).toBeTrue();
    component.toggleAddInput();
    expect(component.showAddInput).toBeFalse();
  });

  it('should handle edit errors gracefully', () => {
    const subj = mockSubjects[0];
    subjectsServiceStub.updateSubject.and.throwError('fail');
    component.startEdit(subj);
    component.editForm.setValue({ name: 'Fail Name' });

    const errSpy = spyOn(console, 'error');
    component.saveEdit(subj);
    expect(toastrStub.error).toHaveBeenCalledWith(
      'საგნის რედაქტირება ვერ მოხდა'
    );
    expect(errSpy).toHaveBeenCalled();
  });

  it('should cancel editing', () => {
    component.editingId = '1';
    component.cancelEdit();
    expect(component.editingId).toBeNull();
  });

  it('should handle delete errors gracefully', () => {
    const subj = mockSubjects[0];
    subjectsServiceStub.deleteSubject.and.throwError('fail');
    const errSpy = spyOn(console, 'error');

    component.deleteSubject(subj);
    expect(toastrStub.error).toHaveBeenCalledWith('საგნის წაშლა ვერ მოხერხდა');
    expect(errSpy).toHaveBeenCalled();
  });

  it('should render subjects list', async () => {
    fixture.detectChanges();
    const listItems = fixture.debugElement.queryAll(By.css('li'));
    expect(listItems.length).toBe(2);
  });

  it('should open add form when button clicked', () => {
    const button = fixture.debugElement.query(By.css('button.primary-btn'));
    button.nativeElement.click();
    fixture.detectChanges();

    expect(component.showAddInput).toBeTrue();
  });

  it('should call startEdit when edit button clicked', () => {
    spyOn(component, 'startEdit');
    fixture.detectChanges();

    const editBtns = fixture.debugElement.queryAll(By.css('.edit-btn'));
    if (editBtns.length) {
      editBtns[0].nativeElement.click();
      expect(component.startEdit).toHaveBeenCalled();
    }
  });

  it('should call deleteSubject when delete button clicked', () => {
    spyOn(component, 'deleteSubject');
    fixture.detectChanges();

    const deleteBtns = fixture.debugElement.queryAll(By.css('.delete-btn'));
    if (deleteBtns.length) {
      deleteBtns[0].nativeElement.click();
      expect(component.deleteSubject).toHaveBeenCalled();
    }
  });
});
