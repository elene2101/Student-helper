import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { DocumentData } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  public user$: Observable<User | null> = authState(this.auth);
  public userProfile$ = this.user$.pipe(
    switchMap((user) => (user?.uid ? this.getUserProfile$(user.uid) : of(null)))
  );

  public register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  public login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  public logout() {
    return signOut(this.auth);
  }

  public saveUserProfile(
    uid: string,
    firstName: string,
    lastName: string,
    email: string
  ) {
    const userDocRef = doc(this.firestore, 'users', uid);
    return setDoc(userDocRef, {
      firstName,
      lastName,
      email,
      createdAt: new Date(),
    });
  }

  public getUserProfile$(
    uid: string
  ): Observable<{ firstName: string; lastName: string; email: string } | null> {
    const docRef = doc(this.firestore, 'users', uid);
    return docData<DocumentData>(docRef).pipe(
      map(
        (data) =>
          (data as { firstName: string; lastName: string; email: string }) ||
          null
      )
    );
  }

  public mapFirebaseError(err: any): string {
    const code = err?.code || err?.message || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'მეილი უკვე გამოყენებულია';
      case 'auth/invalid-email':
        return 'შეიყვანეთ სწორი მეილი';
      case 'auth/weak-password':
        return 'პაროლი ძალიან სუსტი არის';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'მეილი ან პაროლი არასწორია, სცადეთ თავიდან.';
      default:
        return 'შეცდომა ავტორიზაციისას';
    }
  }
}
