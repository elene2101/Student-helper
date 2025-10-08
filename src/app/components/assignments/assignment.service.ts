import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { switchMap, map, filter, startWith, shareReplay } from 'rxjs';
import { Assignment } from './assignments.model';
import { Timestamp } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class AssignmentsService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private assignmentsCol = collection(this.firestore, 'assignments');

  private assignments$ = authState(this.auth).pipe(
    filter((user) => !!user?.uid),
    switchMap((user) => {
      const q = query(this.assignmentsCol, where('userId', '==', user?.uid));
      return collectionData(q, { idField: 'id' }).pipe(
        map((assignments) =>
          assignments.map((a: any) => ({
            ...a,
            deadline: a.deadline.toDate(),
            deadlineTime: a.deadlineTime.toDate(),
          }))
        )
      );
    }),
    startWith([]),
    shareReplay(1)
  );

  getAssignments$() {
    return this.assignments$;
  }

  async addAssignment(a: Assignment): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not logged in');

    await addDoc(this.assignmentsCol, {
      ...a,
      completed: false,
      deadline: Timestamp.fromDate(new Date(a.deadline)),
      userId,
    });
  }

  async updateAssignment(id: string, data: Partial<Assignment>): Promise<void> {
    const docRef = doc(this.firestore, `assignments/${id}`);
    return updateDoc(docRef, data);
  }

  async deleteAssignment(id: string): Promise<void> {
    const docRef = doc(this.firestore, `assignments/${id}`);
    await deleteDoc(docRef);
  }
}
