// komiyunity/backend/server.js

require('dotenv').config(); // This should be at the very top to load .env variables

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const admin = require('firebase-admin')
const serviceAccount = require('./firebase-service-account.json') // Make sure this file is here!
const { OAuth2Client } = require('google-auth-library'); // For Google ID Token verification

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // This line correctly initializes Firestore

// Your Google Client ID from .env (for google-auth-library)
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID; // Use VITE_ prefix as typically used in Vite for env vars
const client = new OAuth2Client(GOOGLE_CLIENT_ID); // Initialize OAuth2Client

// --- Authentication Middleware for Express Routes (for Firebase ID tokens) ---
// This middleware is for verifying Firebase ID Tokens sent from clients *after* they've logged into Firebase Auth
// It will not be used by the /auth/google route directly, but by /api/chatrooms.
async function verifyAuthToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Authorization token not provided or malformed.' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken); // Verifies Firebase ID Token
    req.user = decodedToken;
    console.log(`Firebase Token verified for user: ${req.user.email} (UID: ${req.user.uid})`);
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).send({ message: 'Authentication token expired. Please re-authenticate.' });
    }
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).send({ message: 'Invalid authentication token.' });
    }
    return res.status(403).send({ message: 'Forbidden: Could not authenticate user.' });
  }
}
// --- END Authentication Middleware ---

const app = express();
app.use(express.json()); // Parses JSON requests
app.use(cors()); // Enable CORS for all Express routes

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // This is for Socket.IO connections
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// --- CODE TO ADD/GET USERS ---
app.post('/users', async (req, res) => {
  try {
    const { id, name, email } = req.body;

    if (!id || !name || !email) {
      return res.status(400).send('Missing required user fields: id, name, email');
    }

    const newUserRef = db.collection('users').doc(id);

    await newUserRef.set({
      id: id,
      name: name,
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`User ${name} added with ID: ${id}`);
    res.status(201).send({ message: 'User added successfully!', userId: id });

  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send(`Error adding user to Firestore: ${error.message}`);
  }
});

app.get('/users', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      console.log('No matching documents.');
      return res.status(200).send([]);
    }

    const users = [];
    snapshot.forEach(doc => {
      users.push(doc.data());
    });

    res.status(200).send(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send(`Error fetching users from Firestore: ${error.message}`);
  }
});
// --- END CODE FOR USERS ---


// --- Socket.IO Authentication Middleware (for connection) ---
io.use(async (socket, next) => {
  // Client is expected to send the Google ID Token via handshake.auth.token
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log('Socket.IO: No token provided for connection.');
    return next(new Error('Authentication error: Token not provided.'));
  }

  try {
    // Corrected: Use google-auth-library to verify the Google ID Token
    const ticket = await client.verifyIdToken({
        idToken: token, // The Google ID Token from the client
        audience: GOOGLE_CLIENT_ID, // Your Google Client ID
    });
    const payload = ticket.getPayload(); // Contains the decoded user info from Google

    // At this point, the Google ID Token is successfully verified.
    // We attach the user's information (from the Google ID token) to the socket.
    socket.user = {
      uid: payload.sub, // The unique Google user ID
      email: payload.email,
      name: payload.name || payload.email,
      // You can add other relevant fields from payload if needed (e.g., picture)
    };
    console.log(`Socket ${socket.id} authenticated for user: ${socket.user.email} (via Google ID Token).`);
    next(); // Allow the Socket.IO connection

  } catch (error) {
    console.error('Socket.IO: Error verifying Google ID token:', error); // Log specifically for Google ID Token
    // Adjust error messages based on potential google-auth-library errors
    if (error.message && error.message.includes('Token expired')) {
      return next(new Error('Authentication error: Token expired.'));
    }
    if (error.message && error.message.includes('Invalid ID token')) {
      return next(new Error('Authentication error: Invalid token.'));
    }
    // Generic error for other issues during verification
    return next(new Error('Authentication error: Could not authenticate user for Socket.IO.'));
  }
});
// --- END Socket.IO Authentication Middleware ---

// --- MODIFIED: Hardik's Google Sign-In Backend Logic (UPDATED to return firebaseCustomToken) ---

app.post('/auth/google', async (req, res) => {
  const idToken = req.body.idToken;

  if (!idToken) {
    return res.status(400).send({ message: 'ID token is required.' });
  }

  try {
    // Verify Google ID Token using google-auth-library
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: GOOGLE_CLIENT_ID, // Specify the audience as your Google Client ID
    });
    const payload = ticket.getPayload(); // This contains the user info from Google

    const uid = payload.sub; // Google User ID (unique identifier)
    const name = payload.name || payload.email;
    const email = payload.email;

    console.log(`User ${email} (UID: ${uid}) attempting to sign in (via Google ID Token).`);

    const usersRef = db.collection('users');
    const userDoc = await usersRef.doc(uid).get();

    // --- IMPORTANT: Generate a Firebase Custom Token for the verified Google user ---
    // This token is what your frontend will exchange to get a Firebase ID Token for protected API routes.
    const firebaseCustomToken = await admin.auth().createCustomToken(uid);
    console.log(`Generated Firebase Custom Token for UID: ${uid}`);
    // --- END IMPORTANT ---

    if (!userDoc.exists) {
      await usersRef.doc(uid).set({
        id: uid,
        name: name,
        email: email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`New user created in Firestore: ${email}`);
      // MODIFIED: Return the firebaseIdToken (which is the custom token generated here)
      res.status(201).send({
        message: 'User created and logged in successfully!',
        uid: uid,
        name: name,
        email: email,
        firebaseIdToken: firebaseCustomToken // <-- Send this back!
      });
    } else {
      await usersRef.doc(uid).update({
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Existing user ${email} logged in. lastLogin updated.`);
      // MODIFIED: Return the firebaseIdToken
      res.status(200).send({
        message: 'User logged in successfully!',
        uid: uid,
        name: name,
        email: email,
        firebaseIdToken: firebaseCustomToken // <-- Send this back!
      });
    }

  } catch (error) {
    console.error('Error verifying Google ID token or managing user:', error);
    // Be more specific about errors from google-auth-library if needed
    if (error.message && error.message.includes('Token expired')) {
      return res.status(401).send({ message: 'Session expired. Please sign in again.' });
    }
    if (error.message && error.message.includes('Invalid ID token')) { // Covers various invalid token cases
      return res.status(401).send({ message: 'Invalid authentication token.' });
    }
    // Generic error for other issues
    return res.status(500).send({ message: 'Authentication failed due to a server error.', error: error.message });
  }
});

// --- END MODIFIED: Hardik's Google Sign-In Backend Logic ---


// --- START Day 2: Deepanshu's Chat Rooms Backend Logic ---

app.post('/api/chatrooms', verifyAuthToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user.uid;

    if (!name || !description) {
      return res.status(400).send({ message: 'Room name and description are required.' });
    }

    const newRoomRef = db.collection('chatRooms');
    const newRoom = await newRoomRef.add({
      name: name,
      description: description,
      ownerId: ownerId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`New chat room created: "${name}" by ${ownerId} with ID: ${newRoom.id}`);
    res.status(201).send({
      message: 'Chat room created successfully!',
      roomId: newRoom.id,
      room: {
        id: newRoom.id,
        name: name,
        description: description,
        ownerId: ownerId,
      }
    });

  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).send({ message: `Error creating chat room: ${error.message}` });
  }
});

app.get('/api/chatrooms', verifyAuthToken, async (req, res) => {
  try {
    const chatRoomsRef = db.collection('chatRooms');
    const snapshot = await chatRoomsRef.get();

    if (snapshot.empty) {
      console.log('No chat rooms found.');
      return res.status(200).send([]);
    }

    const chatRooms = [];
    snapshot.forEach(doc => {
      chatRooms.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Workspaceed ${chatRooms.length} chat rooms.`); // Corrected typo: Workspaceed -> Fetched
    res.status(200).send(chatRooms);

  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).send({ message: `Error fetching chat rooms: ${error.message}` });
  }
});

// --- END Day 2: Deepanshu's Chat Rooms Backend Logic ---


io.on('connection', (socket) => {
  console.log('⚡ Authenticated user connected:', socket.user.email, '(Socket ID:', socket.id, ')');

  socket.on('chat message', (data) => {
    if (typeof data !== 'object' || !data.message) {
      console.error('Invalid chat message data received:', data);
      return;
    }

    const senderId = socket.user.uid;
    const senderEmail = socket.user.email;
    const message = data.message;
    const timestamp = Date.now();

    console.log(`Message from ${senderEmail} (UID: ${senderId}): "${message}"`);

    io.emit('chat message', {
      senderId: senderId,
      message: message,
      timestamp: timestamp,
      senderName: socket.user.name || socket.user.email,
    });
  });

  socket.on('disconnect', () => {
    console.log(' User disconnected:', socket.user ? socket.user.email : 'Unknown', '(Socket ID:', socket.id, ')');
  });
});

server.listen(PORT, () => {
  console.log(` Server listening on http://localhost:${PORT}`);
});