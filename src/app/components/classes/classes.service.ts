import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { Auth, authState, User } from '@angular/fire/auth';
import { ClassSchedule } from './classes.model';
import { filter, map, Observable, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClassScheduleService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private schedulesCol = collection(this.firestore, 'schedules');

  public getSchedules$(): Observable<ClassSchedule[]> {
    return authState(this.auth).pipe(
      filter((user): user is User => !!user),
      switchMap((user) => {
        const q = query(this.schedulesCol, where('userId', '==', user.uid));
        return collectionData(q, { idField: 'id' }).pipe(
          map((schedules: any[]) =>
            schedules.map((s) => ({
              ...s,
              startDate: s.startDate.toDate(),
              endDate: s.endDate.toDate(),
              startTime: s.startTime.toDate(),
              endTime: s.endTime.toDate(),
            }))
          )
        ) as Observable<ClassSchedule[]>;
      })
    );
  }

  public addSchedule(schedule: ClassSchedule) {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not logged in');

    return addDoc(this.schedulesCol, {
      ...schedule,
      userId,
    });
  }

  public updateSchedule(id: string, data: Partial<ClassSchedule>) {
    const docRef = doc(this.firestore, `schedules/${id}`);
    return updateDoc(docRef, data);
  }

  public deleteSchedule(id: string) {
    const docRef = doc(this.firestore, `schedules/${id}`);
    return deleteDoc(docRef);
  }

  checkDuplicateActiveSchedule(subjectId: string): Observable<boolean> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not logged in');
    const q = query(
      this.schedulesCol,
      where('userId', '==', userId),
      where('subjectId', '==', subjectId)
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map((schedules: any[]) => {
        const now = new Date();
        return schedules.some((s) => {
          const endDate = s.endDate?.toDate
            ? s.endDate.toDate()
            : new Date(s.endDate);
          return endDate >= now;
        });
      })
    );
  }
}
