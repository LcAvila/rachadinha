import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updatePassword as firebaseUpdatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './config';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { User } from '../../domain/entities/User';
import { FIREBASE_COLLECTIONS } from '../../core/constants/constants';

/**
 * @class AuthRepository
 * Implementação do repositório de autenticação utilizando Firebase Auth e Firestore.
 */
export class AuthRepository implements IAuthRepository {

    /**
     * Realiza o login do usuário.
     * Suporta login via email ou nome de usuário.
     * @param identifier Email ou nome de usuário.
     * @param password Senha.
     * @returns Usuário autenticado completo.
     */
    async login(identifier: string, password: string): Promise<User> {
        let email = identifier;

        // Se o identificador não for um email (não contém @), buscamos o email associado ao username
        if (!identifier.includes('@')) {
            const usersRef = collection(db, FIREBASE_COLLECTIONS.USERS);
            // Query para encontrar documento com o username fornecido
            const q = query(usersRef, where("username", "==", identifier));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error('auth/user-not-found');
            }

            // Recupera o email do documento encontrado
            email = querySnapshot.docs[0].data().email;
        }

        // Tenta realizar o login no Firebase Auth com email e senha
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Busca os dados complementares do usuário no Firestore
        const userDoc = await getDoc(doc(db, FIREBASE_COLLECTIONS.USERS, userCredential.user.uid));

        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                id: userCredential.user.uid,
                name: data.name,
                email: userCredential.user.email || '',
                username: data.username,
                nickname: data.nickname,
                bio: data.bio,
                photoUrl: data.photoUrl,
                pushToken: data.pushToken,
                // Conversão segura de datas
                createdAt: data.createdAt?.toDate() || new Date(),
            };
        }

        throw new Error('Usuário não encontrado no banco de dados');
    }

    /**
     * Verifica se um nome de usuário está disponível.
     * @param username Nome de usuário a verificar.
     * @returns true se disponível, false caso contrário.
     */
    async checkUsernameAvailability(username: string): Promise<boolean> {
        const usersRef = collection(db, FIREBASE_COLLECTIONS.USERS);
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        // Se vazio, significa que ninguém usa esse username
        return querySnapshot.empty;
    }

    /**
     * Registra um novo usuário.
     * Cria a conta no Firebase Auth e o registro correspondente no Firestore.
     * @param email Email.
     * @param password Senha.
     * @param name Nome completo.
     * @param username Nome de usuário opcional.
     */
    async register(email: string, password: string, name: string, username?: string): Promise<User> {
        console.log('AuthRepository.register chamando firebase...');
        try {
            // Cria usuário no Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;
            console.log('Usuário criado no Auth, UID:', userId);

            // Prepara objeto do usuário
            const newUser: User = {
                id: userId,
                name,
                email,
                username: username || email.split('@')[0], // Fallback se não houver username
                nickname: name.split(' ')[0], // Apelido padrão é o primeiro nome
                photoUrl: '',
                createdAt: new Date(),
            };

            // Salva informações estendidas no Firestore
            console.log('Salvando no Firestore...');
            await setDoc(doc(db, FIREBASE_COLLECTIONS.USERS, userId), {
                name,
                email,
                username: newUser.username,
                nickname: newUser.nickname,
                photoUrl: newUser.photoUrl,
                createdAt: newUser.createdAt,
            });
            console.log('Salvo no Firestore com sucesso');

            return newUser;
        } catch (e) {
            console.error('Erro no AuthRepository.register', e);
            throw e;
        }
    }

    /**
     * Desloga o usuário atual.
     */
    async logout(): Promise<void> {
        return signOut(auth);
    }

    /**
     * Atualiza o token de notificação push no Firestore.
     * @param userId ID do usuário.
     * @param token Novo token.
     */
    async updatePushToken(userId: string, token: string): Promise<void> {
        const docRef = doc(db, FIREBASE_COLLECTIONS.USERS, userId);
        await updateDoc(docRef, {
            pushToken: token
        });
    }

    /**
     * Recupera o usuário atualmente logado.
     * Ouve a mudança de estado de autenticação uma única vez.
     * @returns Usuário ou null.
     */
    async getCurrentUser(): Promise<User | null> {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                unsubscribe(); // Remove listener após a primeira execução
                if (firebaseUser) {
                    try {
                        // Busca dados do Firestore
                        const userDoc = await getDoc(doc(db, FIREBASE_COLLECTIONS.USERS, firebaseUser.uid));
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            resolve({
                                id: firebaseUser.uid,
                                name: data.name,
                                email: firebaseUser.email || '',
                                username: data.username,
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
                        console.error('Erro ao buscar perfil do usuário:', error);
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**
     * Atualiza dados parciais do perfil do usuário.
     */
    async updateProfile(userId: string, data: Partial<User>): Promise<void> {
        const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, userId);
        await updateDoc(userRef, data);
    }

    /**
     * Faz upload da foto de perfil para o Firebase Storage.
     * @param userId ID do usuário.
     * @param imageUri URI local da imagem.
     * @returns URL pública da imagem.
     */
    async uploadProfilePhoto(userId: string, imageUri: string): Promise<string> {
        const response = await fetch(imageUri);
        const blob = await response.blob(); // Converte para blob
        const filename = `profiles/${userId}.jpg`;
        const storageRef = ref(storage, filename);

        // Upload para o Storage
        await uploadBytes(storageRef, blob);
        // Recupera URL de download
        return await getDownloadURL(storageRef);
    }

    /**
     * Altera a senha do usuário logado.
     */
    async changePassword(newPassword: string): Promise<void> {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Nenhum usuário autenticado');
        }
        await firebaseUpdatePassword(user, newPassword);
    }
}
