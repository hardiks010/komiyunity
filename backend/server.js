const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const admin = require('firebase-admin')
const serviceAccount = require('./firebase-service-account.json') // Make sure this file is here!

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore() // This line correctly initializes Firestore

const app = express();
app.use(express.json()); // <--- ADD THIS LINE to parse JSON requests
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// --- CODE TO ADD/GET USERS (YOUR SPECIFIC TASK) ---
// Basic Structure of a User Document
// {
//   "id": "uniqueUserIdentifier",
//   "name": "User Name",
//   "email": "user@example.com",
//   "createdAt": "Firestore Timestamp",
//   "lastLogin": "Firestore Timestamp"
// }

// Route to add a new user to the 'users' collection
app.post('/users', async (req, res) => {
  try {
    const { id, name, email } = req.body; // Expecting these from the request body

    if (!id || !name || !email) {
      return res.status(400).send('Missing required user fields: id, name, email');
    }

    // Using the provided ID as the Firestore document ID (good for Firebase Auth UIDs)
    const newUserRef = db.collection('users').doc(id);

    await newUserRef.set({
      id: id,
      name: name,
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Server-generated timestamp
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`User ${name} added with ID: ${id}`);
    res.status(201).send({ message: 'User added successfully!', userId: id });

  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send(`Error adding user to Firestore: ${error.message}`);
  }
});

// Route to get all users from the 'users' collection (for testing/display)
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
      users.push(doc.data()); // doc.data() retrieves the fields of the document
    });

    res.status(200).send(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send(`Error fetching users from Firestore: ${error.message}`);
  }
});
// --- END CODE FOR USERS ---


io.on('connection', (socket) => {
  console.log('⚡ New user connected:', socket.id);

  // --- MODIFIED: Expect an object { message: string, senderId: string } from the client ---
  socket.on('chat message', (data) => {
    // Basic validation to ensure the incoming data is an object with message and senderId
    if (typeof data !== 'object' || !data.message || !data.senderId) {
      console.error('Invalid chat message data received:', data);
      return; // Stop processing if data is invalid
    }

    const { message, senderId } = data; // Destructure the incoming object
    const timestamp = Date.now(); // Add a timestamp for consistent display

    console.log(`Message from ${senderId}: "${message}"`);

    // Broadcast the full message object to all connected clients
    io.emit('chat message', {
      senderId: senderId,
      message: message,
      timestamp: timestamp,
      // You can add other info like senderName later if needed
    });
  });

  socket.on('disconnect', () => {
    console.log(' User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(` Server listening on http://localhost:${PORT}`);
});