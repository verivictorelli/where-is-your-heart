import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { addDoc, collection, getDocs, getFirestore } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";



const firebaseConfig = {
  apiKey: "AIzaSyBglod0L8_0cB94IqgykjuHMIPA6AyoYDI",
  authDomain: "where-s-your-heart.firebaseapp.com",
  databaseURL: "https://where-s-your-heart-default-rtdb.firebaseio.com",
  projectId: "where-s-your-heart",
  storageBucket: "where-s-your-heart.appspot.com",
  messagingSenderId: "757746670949",
  appId: "1:757746670949:web:b771fe1d3d16446194d58c",
  measurementId: "G-GEYHPCLV63"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let zIndexCounter = 1;
const MAX_TOP = window.innerHeight * 0.8 - 100;
const MAX_LEFT = window.innerWidth * 0.8 - 100;

document.addEventListener('DOMContentLoaded', () => {
    updateScreenFromFirestore();

    document.getElementById('addPostButton').addEventListener('click', () => {
        document.body.classList.add('blur-background');
        const addPostSection = document.createElement('div');
        addPostSection.id = 'addPostSection';
        addPostSection.innerHTML = `
            <div class="new-post-it" id="newPostIt">
                <h2>My heart is...</h2>
                <textarea id="postTextArea" placeholder="Write your message..."></textarea>
                <button id="closeButton">Close</button>
                <button id="postButton">Post</button>
            </div>
        `;
        document.body.appendChild(addPostSection);

        const newPostIt = document.getElementById('newPostIt');
        newPostIt.style.zIndex = zIndexCounter++;

        document.getElementById('postButton').addEventListener('click', () => {
            document.body.classList.remove('blur-background');
            const postTextArea = document.getElementById('postTextArea');
            const message = postTextArea.value.trim();
            if (message !== '') {
                const top = getRandomPosition(MAX_TOP);
                const left = getRandomPosition(MAX_LEFT);
                addPost(message, top, left);
                addPostSection.remove();
            }
        });

        document.getElementById('closeButton').addEventListener('click', () => {
            document.body.classList.remove('blur-background');
            addPostSection.remove();
        });
    });

    document.getElementById('infoButton').addEventListener('click', () => {
        document.body.classList.toggle('blur-background');
        const infoText = document.getElementById('infoText');
        infoText.classList.toggle('hidden');
        const infoButton = document.getElementById('infoButton');
        if (infoText.classList.contains('hidden')) {
            infoButton.innerText = 'Info';
            updateScreenFromFirestore();
        } else {
            infoButton.innerText = 'Close';
            document.getElementById('postContainer').innerHTML = '';
        }
    });
});

async function updateScreenFromFirestore() {
    const postContainer = document.getElementById('postContainer');
    postContainer.innerHTML = '';

    try {
        const postsCollectionRef = collection(db, "posts");
        const querySnapshot = await getDocs(postsCollectionRef);

        querySnapshot.forEach((doc) => {
            const postData = doc.data();
            const postIt = createPostIt(postData.message, postData.top, postData.left);
            postContainer.appendChild(postIt);
        });
    } catch (e) {
        console.error("Error getting documents: ", e);
    }
}


// Event listener for the button to open the modal
document.getElementById('addFirebasePostButton').addEventListener('click', () => {
    document.body.classList.add('blur-background');
    const addPostModal = document.getElementById('addPostModal');
    addPostModal.style.display = 'block';

    // Event listener for the close button
    document.getElementsByClassName('close')[0].addEventListener('click', () => {
        document.body.classList.remove('blur-background');
        addPostModal.style.display = 'none';
    });

    // Event listener for the post button
    document.getElementById('postButton').addEventListener('click', async () => {
        const postTextArea = document.getElementById('postTextArea');
        const message = postTextArea.value.trim();
        if (message !== '') {
            const top = getRandomPosition(MAX_TOP);
            const left = getRandomPosition(MAX_LEFT);
            await addPostToFirestore(message, top, left);
            document.body.classList.remove('blur-background');
            addPostModal.style.display = 'none';
        }
    });
});

// Function to add the post to Firestore
async function addPostToFirestore(message, top, left) {
    try {
        const docRef = await addDoc(collection(db, "posts"), {
            message: message,
            top: top,
            left: left
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

function addPost(message, top, left) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.push({ message: message, top: top, left: left });
    localStorage.setItem('posts', JSON.stringify(posts));
    updateScreenFromFirestore();
}


function getRandomPosition(max) {
    return Math.floor(Math.random() * max);
}

function createPostIt(message, top, left) {
    const postIt = document.createElement('div');
    postIt.className = 'post-it';
    postIt.innerHTML = `
        <div class="box-post"> <h2>My heart is...</h2>
        <p>${message}</p></div>
    `;
    postIt.style.top = `${top}px`;
    postIt.style.left = `${left}px`;
    postIt.style.zIndex = zIndexCounter++;
    postIt.style.transform = `rotate(${getRandomRotation()}deg)`;
    postIt.style.backgroundColor = getRandomColor(); 
    postIt.style.transform = `rotate(${getRandomRotation()}deg)`; 
    return postIt;
}

function getRandomRotation() {
    return Math.floor(Math.random() * 7) - 3; 
}

function getRandomColor() {
    const colors = ['#fefbf1', '#fffdf8'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

let isDragging = false;
let selectedPost = null;
let offsetX, offsetY;

document.addEventListener('mousedown', function(event) {
    if (event.target.classList.contains('post-it')) {
        isDragging = true;
        selectedPost = event.target;
        offsetX = event.clientX - parseFloat(window.getComputedStyle(selectedPost).left);
        offsetY = event.clientY - parseFloat(window.getComputedStyle(selectedPost).top);
    }
});

document.addEventListener('mousemove', function(event) {
    if (isDragging && selectedPost) {
        const newX = event.clientX - offsetX;
        const newY = event.clientY - offsetY;
        const maxX = window.innerWidth - parseFloat(window.getComputedStyle(selectedPost).width);
        const maxY = window.innerHeight - parseFloat(window.getComputedStyle(selectedPost).height);
        const boundedX = Math.max(0, Math.min(newX, maxX));
        const boundedY = Math.max(0, Math.min(newY, maxY));
        selectedPost.style.left = `${boundedX}px`;
        selectedPost.style.top = `${boundedY}px`;
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
    selectedPost = null;
});

// Array of background image URLs
const backgroundImages = [
    'url(images/bg-1.jpg)',
    'url(images/bg-2.jpg)',
    'url(images/bg-3.jpg)',
    'url(images/bg-4.jpg)',
    'url(images/bg-5.jpg)',
    'url(images/bg-6.jpg)',
    'url(images/bg-7.jpg)',
    'url(images/bg-8.jpg)',
    'url(images/bg-9.jpg)',
    'url(images/bg-10.jpg)',
    'url(images/bg-11.jpg)',
    // Add more image URLs as needed
];

// Generate a random index to select a background image
const randomIndex = Math.floor(Math.random() * backgroundImages.length);

// Set the background image of the body
document.body.style.backgroundImage = backgroundImages[randomIndex];
