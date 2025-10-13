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
import { Timestamp } from 'firebase/firestore';
import { Exam } from './exams.model';

@Injectable({ providedIn: 'root' })
export class ExamsService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private examsCol = collection(this.firestore, 'exams');

  getExams$() {
    return authState(this.auth).pipe(
      filter((user) => !!user?.uid),
      switchMap((user) => {
        const q = query(this.examsCol, where('userId', '==', user?.uid));
        return collectionData(q, { idField: 'id' }).pipe(
          map((exams: any[]) =>
            exams.map((exam) => ({
              ...exam,
              date: exam.date.toDate(),
              time: exam.time.toDate(),
            }))
          )
        );
      }),
      startWith([]),
      shareReplay(1)
    );
  }

  async addExam(exam: Exam) {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not logged in');

    await addDoc(this.examsCol, {
      ...exam,
      date: Timestamp.fromDate(new Date(exam.date)),
      userId,
    });
  }

  updateExam(id: string, data: Partial<Exam>) {
    const docRef = doc(this.firestore, `exams/${id}`);
    return updateDoc(docRef, data);
  }

  deleteExam(id: string) {
    const docRef = doc(this.firestore, `exams/${id}`);
    deleteDoc(docRef);
  }
}
