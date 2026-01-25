import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updatePassword as firebaseUpdatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './config';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { User } from '../../domain/entities/User';
import { FIREBASE_COLLECTIONS } from '../../core/constants/constants';

export class AuthRepository implements IAuthRepository {
    async login(email: string, password: string): Promise<User> {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, FIREBASE_COLLECTIONS.USERS, userCredential.user.uid));

        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                id: userCredential.user.uid,
                name: data.name,
                email: userCredential.user.email || '',
                nickname: data.nickname,
                bio: data.bio,
                photoUrl: data.photoUrl,
                pushToken: data.pushToken,
                createdAt: data.createdAt?.toDate() || new Date(),
            };
        }

        throw new Error('User not found in database');
    }

    async register(email: string, password: string, name: string): Promise<User> {
        console.log('AuthRepository.register calling firebase...');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
            console.log('User created in Auth, UID:', userId);

            const newUser: User = {
                id: userId,
                name,
                email,
                nickname: name.split(' ')[0], // Default nickname is first name
                photoUrl: '', // Default empty
                createdAt: new Date(),
            };

            // Save extended user info to Firestore
            console.log('Saving to Firestore...');
            await setDoc(doc(db, FIREBASE_COLLECTIONS.USERS, userId), {
                name,
                email,
                nickname: newUser.nickname,
                photoUrl: newUser.photoUrl,
                createdAt: newUser.createdAt,
            });
            console.log('Saved to Firestore successfully');

            return newUser;
        } catch (e) {
            console.error('Error in AuthRepository.register', e);
            throw e;
        }
    }

    async logout(): Promise<void> {
        return signOut(auth);
    }

    async updatePushToken(userId: string, token: string): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.USERS, userId);
        await updateDoc(docRef, {
            pushToken: token
        });
    }

    async getCurrentUser(): Promise<User | null> {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                unsubscribe();
                if (firebaseUser) {
                    try {
                        const userDoc = await getDoc(doc(db, FIREBASE_COLLECTIONS.USERS, firebaseUser.uid));
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            resolve({
                                id: firebaseUser.uid,
                                name: data.name,
                                email: firebaseUser.email || '',
                                nickname: data.nickname,
                                bio: data.bio,
                                photoUrl: data.photoUrl,
                                pushToken: data.pushToken,
                                createdAt: data.createdAt?.toDate() || new Date(),
                            });
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        console.error('Error fetching user profile:', error);
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    }

    async updateProfile(userId: string, data: Partial<User>): Promise<void> {
        const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, userId);
        await updateDoc(userRef, data);
    }

    async uploadProfilePhoto(userId: string, imageUri: string): Promise<string> {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const filename = `profiles/${userId}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    }

    async changePassword(newPassword: string): Promise<void> {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('No authenticated user');
        }
        await firebaseUpdatePassword(user, newPassword);
    }
}
