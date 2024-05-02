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

const MAX_TOP = window.innerHeight * 0.8 - 100;
const MAX_LEFT = window.innerWidth * 0.8 - 100;

document.addEventListener('DOMContentLoaded', () => {
    const moreInfoButton = document.getElementById('moreInfoButton');
    const infoText = document.getElementById('infoText');
    const postContainer = document.getElementById('postContainer');
    let isInfoVisible = false;
    let isPostTextVisible = false;

    moreInfoButton.addEventListener('click', () => {
        isInfoVisible = !isInfoVisible;
        
        if (isInfoVisible) {
            if (isPostTextVisible){
                isPostTextVisible = !isPostTextVisible;
                document.getElementById('addPostModal').style.display = 'none';
                document.body.classList.remove('blur-background');
                postTextArea.value = '';
            }
            infoText.classList.remove('hidden');
            moreInfoButton.innerText = 'Close';
            postContainer.classList.add('hidden');
            document.body.classList.add('blur-background');
        } else {
            infoText.classList.add('hidden');
            moreInfoButton.innerText = 'Info';
            postContainer.classList.remove('hidden');
            document.body.classList.remove('blur-background');
        }
    });

    document.getElementById('addFirebasePostButton').addEventListener('click', () => {
        isPostTextVisible = !isPostTextVisible
        if (isInfoVisible) {
            isInfoVisible = !isInfoVisible;
            infoText.classList.add('hidden');
            moreInfoButton.innerText = 'Info';
            postContainer.classList.remove('hidden');
            document.body.classList.remove('blur-background');
        }
        document.body.classList.add('blur-background');
        const addPostModal = document.getElementById('addPostModal');
        addPostModal.style.display = 'block';

        // Event listener for the close button
        document.getElementsByClassName('close')[0].addEventListener('click', () => {
            isPostTextVisible = !isPostTextVisible
            document.body.classList.remove('blur-background');
            addPostModal.style.display = 'none';
            postTextArea.value = '';
        });
    });
    
    // Event listener for the post button
    document.getElementById('postButton').addEventListener('click', async () => {
        const postTextArea = document.getElementById('postTextArea');
        const message = postTextArea.value.trim();
        if (message !== '') {
            const top = getRandomPosition(MAX_TOP)*(window.innerHeight/MAX_TOP);
            const left = getRandomPosition(MAX_LEFT)*(window.innerWidth/MAX_LEFT);
            
            await addPostToFirestore(message, top, left);
            document.body.classList.remove('blur-background');
            addPostModal.style.display = 'none';
            updateScreenFromFirestore();
            postTextArea.value = '';
        } else {
            
        }
    });

    updateScreenFromFirestore();
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

async function addPostToFirestore(message, top, left) {
    try {
        await addDoc(collection(db, "posts"), {
            message: message,
            top: top,
            left: left
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
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
];

const randomIndex = Math.floor(Math.random() * backgroundImages.length);
document.body.style.backgroundImage = backgroundImages[randomIndex];