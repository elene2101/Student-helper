import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, combineLatest, map, switchMap } from 'rxjs';
import { Subject } from '../classes.model';

@Injectable({ providedIn: 'root' })
export class SubjectsService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private subjectsCol = collection(this.firestore, 'subjects');

  getSubjects$(): Observable<Subject[]> {
    const publicQ = query(this.subjectsCol, where('isPublic', '==', true));
    const public$ = collectionData(publicQ, { idField: 'id' }) as Observable<
      Subject[]
    >;

    return authState(this.auth).pipe(
      switchMap((user) => {
        if (user?.uid) {
          const privateQ = query(
            this.subjectsCol,
            where('userId', '==', user.uid)
          );
          const private$ = collectionData(privateQ, {
            idField: 'id',
          }) as Observable<Subject[]>;
          return combineLatest([public$, private$]).pipe(
            map(([pub, priv]) => [...priv, ...pub])
          );
        } else {
          return public$;
        }
      })
    );
  }

  async addSubject(name: string, isPublic = false): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!name.trim()) throw new Error('Subject name is required');

    await addDoc(this.subjectsCol, {
      name: name.trim(),
      userId: isPublic ? null : userId ?? null,
      isPublic,
    });
  }

  async updateSubject(id: string, name: string): Promise<void> {
    const subjectDoc = doc(this.firestore, 'subjects', id);
    await updateDoc(subjectDoc, { name: name.trim() });
  }

  async deleteSubject(id: string): Promise<void> {
    const subjectDoc = doc(this.firestore, 'subjects', id);
    await deleteDoc(subjectDoc);
  }
}
