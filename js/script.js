const messagesContainer = document.getElementById('messages-container');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

let responses = {};

document.addEventListener('DOMContentLoaded', function() {
    fetchResponses();
});

chatInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage(event);
    }
});

sendButton.addEventListener('click', sendMessage);

function sendMessage(event) {
    event.preventDefault();
    const userMessage = chatInput.value;
    if (userMessage.trim() === '') return;

    addMessage(userMessage, 'user');
    chatInput.value = '';
    sendButton.style.visibility = 'hidden';

    addTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();
        const botResponse = getBotResponse(userMessage);
        addMessage(botResponse, 'bot');
    }, 2000); // Simulasi jeda untuk respons bot
}

function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);

    const timestamp = new Date().toLocaleString('id-ID', {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });

    messageElement.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-timestamp">${timestamp}</div>
    `;

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot', 'typing-indicator');
    typingIndicator.innerHTML = `
        <div class="message-content">
            <span class="wave-dot"></span>
            <span class="wave-dot"></span>
            <span class="wave-dot"></span>
        </div>
    `;

    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        messagesContainer.removeChild(typingIndicator);
    }
}

function fetchResponses() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "api/get_response.php", true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            responses = JSON.parse(xhr.responseText);
        }
    };
    xhr.send();
}

// Fungsi untuk menghitung jarak Levenshtein
function levenshteinDistance(s1, s2) {
    const track = Array(s2.length + 1).fill(null).map(() =>
        Array(s1.length + 1).fill(null)
    );

    for (let i = 0; i <= s1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= s2.length; j += 1) {
        track[j][0] = j;
    }

    for (let j = 1; j <= s2.length; j += 1) {
        for (let i = 1; i <= s1.length; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }

    return track[s2.length][s1.length];
}

// Fungsi untuk mendapatkan respon bot berdasarkan input pengguna dengan pengecekan typo dan pencocokan parsial
function getBotResponse(userMessage) {
    userMessage = userMessage.toLowerCase();
    let closestMatch = '';
    let closestDistance = Infinity;

    // Pengecekan typo
    for (const question in responses) {
        const distance = levenshteinDistance(userMessage, question.toLowerCase());
        if (distance < closestDistance) {
            closestDistance = distance;
            closestMatch = question;
        }
    }

    if (closestDistance <= 5) { // Ambang batas untuk typo
        return responses[closestMatch];
    }

    // Pencocokan parsial
    for (const question in responses) {
        if (userMessage.includes(question.toLowerCase())) {
            return responses[question];
        }
    }

    return "Maaf, saya tidak mengerti pertanyaan anda. Bisa anda jelaskan lebih lanjut?";
}

chatInput.addEventListener('input', function () {
    if (this.value.trim().length > 0) {
        sendButton.style.visibility = 'visible';
    } else {
        sendButton.style.visibility = 'hidden';
    }
});