import * as firebase from 'firebase'
import { FIREBASE_CONFIG } from './config/env';

var config = {
    apiKey: FIREBASE_CONFIG.APIKEY,
    authDomain: FIREBASE_CONFIG.AUTHDOMAIN,
    databaseURL: FIREBASE_CONFIG.DATABASEURL,
    projectId: FIREBASE_CONFIG.PROJECTID,
    storageBucket: FIREBASE_CONFIG.STORAGEBUCKET,
    messagingSenderId: FIREBASE_CONFIG.MESSAGINGSENDERID
}

firebase.initializeApp(config)

export default firebase