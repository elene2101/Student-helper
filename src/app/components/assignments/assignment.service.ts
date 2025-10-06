import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface Assignment {
  id?: string;
  subject: string;
  description: string;
  deadline: string;
  completed: boolean;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
//elene
export class AssignmentService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  getAssignments(userId: string) {
    const assignmentsRef = collection(this.firestore, 'assignments');
    const q = query(assignmentsRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' });
  }

  addAssignment(assignment: Omit<Assignment, 'id' | 'userId'>) {
    const userId = this.auth.currentUser?.uid;
    const assignmentsRef = collection(this.firestore, 'assignments');
    return addDoc(assignmentsRef, {
      ...assignment,
      userId,
      completed: false,
    });
  }

  updateAssignment(id: string, data: Partial<Assignment>) {
    const docRef = doc(this.firestore, `assignments/${id}`);
    return updateDoc(docRef, data as any);
  }

  deleteAssignment(id: string) {
    const docRef = doc(this.firestore, `assignments/${id}`);
    return deleteDoc(docRef);
  }
}
