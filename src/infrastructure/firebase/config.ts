// Importa as funções necessárias dos SDKs do Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Configuração do projeto Firebase
// Contém as chaves e identificadores para conexão com o backend
const firebaseConfig = {
    apiKey: "AIzaSyAAB53WbXXLHS1m7T365WE3hWJSwPzUM_0",
    authDomain: "rachadinha-5dbb3.firebaseapp.com",
    databaseURL: "https://rachadinha-5dbb3-default-rtdb.firebaseio.com",
    projectId: "rachadinha-5dbb3",
    storageBucket: "rachadinha-5dbb3.firebasestorage.app",
    messagingSenderId: "86843464836",
    appId: "1:86843464836:web:ada19fcbede44c3d1276d1",
    measurementId: "G-EXZC3Z4D8W"
};

// Inicializa a instância do Firebase App
const app = initializeApp(firebaseConfig);

// Exporta as instâncias dos serviços para uso em toda a aplicação
/**
 * Serviço de Autenticação do Firebase.
 */
export const auth = getAuth(app);

/**
 * Serviço de Banco de Dados Firestore.
 */
export const db = getFirestore(app);

/**
 * Serviço de Armazenamento (Storage) do Firebase.
 */
export const storage = getStorage(app);
