const socket = io('/');

let username;
const form = document.querySelector('#chat-form');
const input = form.querySelector('input[type="text"]');
const fileInput = form.querySelector('input[type="file"]');
const messages = document.querySelector('#messages');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const reader = new FileReader();
    const file = fileInput.files[0];

    if(!file && !input.value) {
        alert('please enter the message');
        return;
    }

    if(file) {
        reader.readAsDataURL(file);
        reader.onload = () => {
            socket.emit('chat message', {
                author:username,
                content: input.value, 
                image: reader.result
            }, true, 'person');
            input.value = "";
            fileInput.value = "";
        };
    } else {
        socket.emit('chat message', {
            author:username,
            content: input.value, 
            image: null
        }, false, 'person');
        input.value = "";
    }
});

if(localStorage.getItem('username')) {
    username = localStorage.getItem('username');
    socket.emit("username", username);
} else {
    Swal.fire({
        title: "Enter your Username",
        input: "text",
        inputLabel: "Username",
        inputPlaceHolder: "Enter yout Username",
        allowOutsideClick: false,
        inputValidator: (value) => {
            if( !value ){
                return "You need to enter a Username !!";
            }
        },
        confirmButtonText: "Enter Chat",
        ShowLoaderonConfirm: true,
        preConfirm: (username) => {}
    }).then((result) => {
        console.log(result);
        username = result.value;
        socket.emit("username", username);
        localStorage.setItem("username", username);
    });
}

function scrollToBottom() {
    const messageList = document.querySelector('#messages');
    messageList.scrollTop = messageList.scrollHeight;
}

socket.on('user joined', (username) => {
    console.log(username);
    const item = document.createElement('li');
    const messages = document.querySelector('#messages');
    item.classList.add('chat-message');
    item.innerHTML = `<span class="chat-username">${username}</span> : has joined the chat `;
    messages.appendChild(item);
    scrollToBottom();
});

socket.on('user left', (data) => {
    console.log(data);
    const item = document.createElement('li');
    const messages = document.querySelector('#messages');
    item.classList.add('chat-message');
    item.innerHTML = `<span class="chat-username">${data}</span> : has left the chat `;
    messages.appendChild(item);
    scrollToBottom();
});

socket.on('chat message', (msg) => {
    // msg.author = sender;
    const item = document.createElement('li');
    item.classList.add('chat-message');
    item.innerHTML = `<span class="chat-username">${msg.author}</span> : ${msg.content} `;
    if(msg.image) {
        const img = document.createElement('img');
        img.src = msg.image;
        img.classList.add('image');
        item.appendChild(img);
    }
    messages.appendChild(item);
    scrollToBottom();
});

socket.on('load messages', (messages) => {
    const messageList = document.querySelector('#messages');
    messages.forEach((msg) => {
        const item = document.createElement('li');
        item.classList.add('chat-message');
        item.innerHTML = `<span class="chat-username">${msg.author}</span> : ${msg.content} `;
        if(msg.image) {
            const img = document.createElement('img');
            img.src = msg.image;
            img.classList.add('image');
            item.appendChild(img);
        }
        messageList.appendChild(item);
    });
    scrollToBottom();
});