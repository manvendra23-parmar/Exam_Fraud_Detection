const admin = require('firebase-admin');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) return;
    
    const backendDir = path.join(__dirname, '..');
    const files = [
        'serviceAccountKey.json',
        'exam-fraud-detection-firebase-adminsdk-fbsvc-8b6689a7a5.json',
        ...fs.readdirSync(backendDir).filter(file => file.includes('firebase-adminsdk') && file.endsWith('.json'))
    ];
    
    for (const file of files) {
        const filePath = path.join(backendDir, file);
        if (fs.existsSync(filePath)) {
            try {
                admin.initializeApp({ credential: admin.credential.cert(require(filePath)) });
                return;
            } catch (error) {
                console.error(`Error loading ${file}:`, error.message);
            }
        }
    }
    
    console.error("Firebase Admin initialization failed. Add service account key file to backend directory.");
}

initializeFirebaseAdmin();

const auth = admin.auth();
const GOOGLE_CLIENT_ID = '1018610670162-8rv5bar6jo564jrf7lqqina0tbkvbt7p.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

async function signIn(req, res) {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ error: "idToken is required" });
        }

        const decodedToken = await auth.verifyIdToken(idToken);
        const userRecord = await auth.getUser(decodedToken.uid);
        
        res.status(200).json({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL
        });
    } catch (error) {
        res.status(401).json({ 
            error: true, 
            code: error.code, 
            message: error.message 
        });
    }
}

async function signUp(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const userRecord = await auth.createUser({
            email,
            password,
            emailVerified: false
        });
        
        res.status(200).json({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL
        });
    } catch (error) {
        res.status(400).json({ 
            error: true, 
            code: error.code, 
            message: error.message 
        });
    }
}

async function googleSignIn(req, res) {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ error: "Google ID token is required" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        if (!payload.email) {
            return res.status(400).json({ error: "Email not found in token" });
        }
        
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(payload.email);
            
            if (payload.picture && !userRecord.photoURL) {
                await auth.updateUser(userRecord.uid, {
                    photoURL: payload.picture,
                    displayName: payload.name || userRecord.displayName
                });
                userRecord = await auth.getUser(userRecord.uid);
            }
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                userRecord = await auth.createUser({
                    email: payload.email,
                    displayName: payload.name,
                    photoURL: payload.picture,
                    emailVerified: payload.email_verified || false
                });
            } else {
                throw error;
            }
        }
        
        res.status(200).json({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName || payload.name,
            photoURL: userRecord.photoURL || payload.picture
        });
    } catch (error) {
        res.status(400).json({ 
            error: true, 
            code: error.code || 'auth/unknown-error', 
            message: error.message || 'Authentication failed'
        });
    }
}

module.exports = { signIn, signUp, googleSignIn };

