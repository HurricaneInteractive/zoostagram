import * as firebase from 'firebase'
import FirebaseConfig from './config/firebase-config';

var config = {
    apiKey: FirebaseConfig.APIKEY,
    authDomain: FirebaseConfig.AUTHDOMAIN,
    databaseURL: FirebaseConfig.DATABASEURL,
    projectId: FirebaseConfig.PROJECTID,
    storageBucket: FirebaseConfig.STORAGEBUCKET,
    messagingSenderId: FirebaseConfig.MESSAGINGSENDERID
}

firebase.initializeApp(config)

export default firebase