const API_BASE_URL = 'https://scholagram.com';
// const API_BASE_URL = 'http://145.223.34.195:3000'
const localhostAPI = 'http://localhost:3000';
let messages;
let conversation_type;
let isreply = false
let notificationCount = 0;
const userId = document.getElementById('user-id').value;
const mainfield = document.getElementById('user-mainfield').value;
let replyTo = null;
let conv_id;
let paperId;
const circular_spinner = `
<div id="loadingSpinner" class="loadingio-spinner-eclipse-nq4q5u6dq7r" style="display: none;">
  <div class="ldio-x2uulkbinbj">
    <div></div>
  </div>
</div>
`
let userMainfield;
let currentlang = sessionStorage.getItem('lang') || 'en'

const scrollbutton = `
<div class="scroll-button" onclick="scrollToBottom()">
    <button type="button" class="Button cxwA6gDO default secondary round"
        aria-label="Go to bottom" title="Go to bottom">
        <i class="icon fa-solid fa-arrow-down"></i>
    </button>
</div>
`
let members = new Set();
let tags = new Set();
const spinner = document.getElementById('loading-spinner')
const fileSend = '<i id="clip" onclick="event.preventDefault(); event.stopPropagation(); show_options()"class="fa-solid fa-paperclip"></i>'
const popups = [
    document.getElementById('startpaper-popup'),
    document.getElementById('yourpapers-popup'),
    document.getElementById('searchpapers-popup'),
    document.getElementById('joinedpapers-popup'),
    document.getElementById('notifications_popup')
];
const popup_buttons = [
    document.getElementById('start_paper_button'),
    document.getElementById('your-papers-button'),
    document.getElementById('searchpapers-button'),
    document.getElementById('joined-papers-button'),
    document.getElementById('notifications-button'),
];
const dropdowns = [
    { inputId: 'we_need', containerid: 'weneed-container', optionsid: 'weneed-list' },
    { inputId: 'type_of_study', containerid: 'typeofstudy-container', optionsid: 'typeofstudy-list' },
    { inputId: 'project_branch', containerid: 'projectbranch-container', optionsid: 'projectbranch-list' },
    { inputId: 'start-language-input', containerid: 'start-language-container', optionsid: 'start-language-list' },

];
let mainContent = document.getElementById('maincontent')
const friend_search = document.getElementById('friend-search')
let notificationQueue = [];
let conversationsLoaded = false;
const chatContainer = document.querySelector('.chat-container');
const toggleButton = document.getElementById('advanced_button');
const socket = io(API_BASE_URL, {
    transports: ['polling', 'websocket'],
    query: {
        userId: userId,
    }
});
let Nskip = 0
let Nlimit = 12
let skip = 0;
let limit = 12
function isMobile() {
    return /Mobi|Android|iPhone|iPod|Opera Mini/i.test(navigator.userAgent);
}
async function applyPendingNotifications(conversation_id) {
    console.log('conversations-state', conversationsLoaded);

    if (conversationsLoaded) {
        notificationQueue.forEach(id => notify_conversation(id));
        conversationsLoaded = false
    }
    else {
        notificationQueue.push(conversation_id)


    }

}
// async function checkUnreadNotifications(){
//     const response = await fetch(`/api/notifications?skip=${Nskip}&limit=${Nlimit}`, {
//         method: "GET"
//     });
// }
socket.emit('join-public-room')
window.onload = async () => {
    await loadPosts();
    applyTranslations();

}
function display_Message(message) {
    try {
        if (!message || typeof message !== 'string') {
            throw new Error('Invalid message');
        }

        const mainContent = document.getElementById('maincontent')
        const popup_message = document.createElement('div');
        popup_message.classList.add('popup-message');

        popup_message.innerHTML = `
            <h1>${message}</h1>
        `;

        // Append the message to the body
        // if(type==='conversation'){
        // }else{
        //     mainContent.appendChild(popup_message);
        // }
        document.body.append(popup_message)

        popup_message.classList.add('show');
        setTimeout(() => {
            // popup_message.classList.remove('show');

            setTimeout(() => {

                popup_message.classList.remove('show');
            }, 0);
        }, 2000);

    } catch (error) {
        console.error('Error displaying message:', error.message);
    }
}

async function get_Post(post_id) {
    try {
        const url = `/api/posts/${post_id}`;

        const response = await fetch(url, {
            method: 'GET',
        });
        console.log('Response:', response);

        if (response.ok) {
            const data = await response.json();

            return data.post;
        }

        console.error('Error: Failed to fetch post. Status:', response.status);
        return null;
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

async function loadPosts() {
    try {
        const response = await fetch(`/api/posts?skip=${skip}&limit=${limit}`, {
            method: "GET",
        });
        document.getElementById("maincontent").innerHTML += `
        <div class="yourpapers-label" id="joined">Home</div>
        `
        if (response.ok) {
            const data = await response.json();

            let content = "";

            for (const post of data.posts) {

                content += `
                    <div class="css-sh7anr-StyledBox">
                        <p class="css-gkrxgl-StyledText">${post.title}</p>
                        <a class="css-1k7990c-StyledButton" href="/posts/${post._id}">
                            Go to post
                        </a>
                        
                    </div>`;
            }

            // Append posts to container
            let postsContainer = document.querySelector(".posts");
            if (!postsContainer) {
                postsContainer = document.createElement("div");
                postsContainer.className = "posts";
                document.getElementById("maincontent").appendChild(postsContainer);
            }

            postsContainer.innerHTML += content;

            // Manage Load More button
            let loadPostsBtn = document.getElementById("loadMoreBtn");
            if (!loadPostsBtn) {
                // Create button if not exists
                loadPostsBtn = document.createElement("button");
                loadPostsBtn.id = "loadMoreBtn";
                loadPostsBtn.textContent = "Load More";
                loadPostsBtn.className = "notifications-button";
                postsContainer.appendChild(loadPostsBtn);

                // Add click event listener
                loadPostsBtn.addEventListener("click", function () {

                    loadPosts()

                });
            }

            // Hide button if no more posts
            if (data.posts.length < limit) {
                loadPostsBtn.style.display = "none";
            }

            // Update skip count
            skip += data.posts.length;
        }
    } catch (error) {
        console.error("Error loading posts:", error);
    }
}

// Attach event listener to "Load More" button


async function buildmessagecontent(message) {
    console.log('message', message);

    let sender = await get_user(message.m.sender)
    sender = sender.users[0]
    console.log('user', sender);


    let messageContent = '';
    console.log('received message', message);

    const dateOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };

    const createdAt = message.m.createdAt;
    const date = new Date(createdAt);
    const formattedDate = isNaN(date.getTime())
        ? "Invalid Date"
        : date.toLocaleString('en-US', dateOptions);
    console.log(message.m.createdAt);

    let replyContent = '';
    let img = '';
    let fileUrl
    let fileExtension
    if (message.m.fileUrl) {

        fileUrl = message.m.fileUrl;
        fileExtension = fileUrl.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {

            img = `
                <img id="sent_image" src='/conversation_files/${fileUrl}' alt="sent image" />
            `;
        }
        else {

            img = `
                    <a id="sent_file" href='/conversation_files/${fileUrl}' target="_blank" download>
                        <div class="file" >
                            <i class="fa-regular fa-file"></i>
                        </div>
                        ${fileUrl}
                    </a>
            `;
        }
    }
    let isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)

    if (message.m.isreply && message.m.replyTo) {


        const originalMessage = messages.find(m => {

            return message.m.replyTo.toString() === m._id.toString()
        });


        if (originalMessage) {
            replyContent = `
                <div class="reply-info">
                    <span class="message-text"> ${originalMessage.text}</span>
                </div>
            `;
        }
    }
    const profilePicture = sender.profile_picture
    let imageSrc;
    let isExternal;
    console.log('profile pic', profilePicture);

    if (profilePicture) {
        isExternal = profilePicture.startsWith("http");
        imageSrc = isExternal
            ? profilePicture
            : `/profile_images/${profilePicture}`;
    } else {
        imageSrc = 'profile_images/non-picture'
    }
    messageContent += `
            <div class="message-info" ondbclick="reply('${message.m._id}', '${message.m.text.replace(/'/g, "\\'")}')">
            ${message.m.sender === userId ? `

                <div style ="${isImage ? "padding:0px;" : "padding:4px 15px "}"  class="message ${message.m.sender === userId ? 'sent' : 'received'}" >
                    ${img}
                    ${replyContent}
                    ${isImage
                ? `<span class="${isImage ? "imageTime" : "time"}">${formattedDate}</span>
                    <span class='${message.m.isreply ? "message-text reply" : "message-text"}'>${message.m.text}</span>`

                : `
                <span class='${message.m.isreply ? "message-text reply" : "message-text"}'>${message.m.text}</span>
                <span class="${isImage ? "imageTime" : "time"}">${formattedDate}</span>
                    `
            }

                </div>
                <img  onclick="event.stopPropagation(); showProfile('${JSON.stringify(sender).replace(/"/g, '&quot;')}')" src="/profile_images/${sender.profile_picture ? sender.profile_picture : 'non-picture.jpg'}" alt=""  class="sender-image" />

            </div>
                ` :
            `
                <img  onclick="event.stopPropagation(); showProfile('${JSON.stringify(sender).replace(/"/g, '&quot;')}')" src=${imageSrc} alt=""  class="sender-image" />

                <div style ="${isImage ? "padding:0px;" : "padding:4px 15px "}"  class="message ${message.m.sender === userId ? 'sent' : 'received'}" >
                    ${img}
                    ${replyContent}
                    ${isImage
                ?
                `<span class="${isImage ? "imageTime" : "time"}">${formattedDate}</span>
                                <span class='${message.m.isreply ? "message-text reply" : "message-text"}'>${message.m.text}</span>`

                : `
                                <span class='${message.m.isreply ? "message-text reply" : "message-text"}'>${message.m.text}</span>
                                <span class="${isImage ? "imageTime" : "time"}">${formattedDate}</span>
                    `}

                </div>
            </div>
                `
        }

`;

    return messageContent;
}
function showProfile(user) {
    if (typeof user === 'string') {
        user = JSON.parse(user);
    }
    let profilePicture = user.profile_picture;
    let isExternal;
    let imageSrc;
    if (profilePicture) {
        isExternal = profilePicture.startsWith("http");
        imageSrc = isExternal
            ? profilePicture
            : `profile_images/${profilePicture}`;
    } else {
        imageSrc = 'profile_images/non-picture'
    }
    const content = `
        <img id="profile_image" src="/profile_images/${imageSrc ? imageSrc : 'non-picture.jpg'}" alt="Sender Image" class="sender-image" />
        <p id="user-name">${user.name}</p>
        <label>Phone number</label>

        ${user.phoneHidden == false ? `

            <p> ${user._id}</p>` : ""}
        <label>E-mail</label>
        <p> ${user.email}</p>
        <label>Country</label>
        <p> ${user.country}</p>
        <label>role</label>
        <p>${user.profession}</p>
    `;
    const profileCard = document.getElementById('userProfile')
    profileCard.innerHTML = content
    profileCard.style.display = 'flex'
    document.addEventListener('click', function (e) {

        if (profileCard.style.display === 'flex' && !profileCard.contains(e.target)) profileCard.style.display = 'none'
    })
}



document.addEventListener('DOMContentLoaded', function () {
    const profileImage = document.getElementById('profileImage')
    const settings = document.getElementById('settings')
    const settings_popup = document.getElementById('settings-popup')
    const profileSpan = document.getElementById('profile-span')


    profileImage.addEventListener('click', function (e) {
        e.stopPropagation()

        profileSpan.style.display = 'flex'
        // const signout = document.getElementById('advanced-singout')
        const ar = profileSpan.querySelector('#ar')
        const en = profileSpan.querySelector('#en')

        currentlang === 'en'
            ? (en.classList.add('active'), document.querySelector('#right-border').classList.add('active'))
            : ar.classList.add('active');

        document.getElementById('sign-out').addEventListener('click', async function () {

            await signout()


        })
    })

    document.addEventListener('click', function (event) {

        if (profileSpan && profileSpan.style.display === 'flex' && !profileSpan.contains(event.target)) {
            profileSpan.style.display = 'none';
        }

        if (settings_popup && settings_popup.style.display === 'block' && !settings_popup.contains(event.target)) {
            settings_popup.style.display = 'none';
        }
    })
    socket.on('connection', () => {
        console.log('Connected');

    });
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
    socket.on('error', (error) => {
        console.error('Error receiving message:', error);
    });

    socket.on('receive-message', async (message) => {
        // console.log('data',data);
        // const {user,message} = data
        // console.log('message',message,'user',user);

        if (message) {
            let chatHistory = document.getElementById('message-history');

            let content = await buildmessagecontent(message)
            chatHistory.innerHTML += content
            scrollToBottom()
        } else {
            console.error('Invalid message data received:', message);
        }
    });
    socket.on('receive-notification', async (data) => {
        console.log('data', data);

        const redDot = document.getElementById('newNotification')
        console.log('reddot', redDot);
        notificationCount += 1
        redDot.textContent = notificationCount
        redDot.style.display = 'flex'
        display_notification(data)

    });
    socket.on('receive-notification-fromconversation', async (data) => {
        console.log(data);

        applyPendingNotifications(data.data.conversation._id)
    })



    //join toggles




    socket.emit('register', { userId, mainfield })

});






document.addEventListener('DOMContentLoaded', function () {
    // Select all elements with the class 'tab'
    const tabs = document.querySelectorAll('.sidebar ul li a');

    tabs.forEach(tab => {
        tab.addEventListener('click', function (event) {
            event.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));

            this.classList.add('active');
        });
    });

});

function display_error(message, popup) {
    const error = document.createElement('p')
    error.style.color = 'red'
    error.textContent = message
    popup.append(error)
}
async function accept_request(paper_id, user_id) {
    await fetch(`/api/accept-request/${paper_id}`, {
        headers: {
            "Content-Type": "application/json"
        },
        method: 'POST',
        body: JSON.stringify({

            user_id
        })
    }).then(res => res.json()).then(async data => {
        console.log('join result', data);

        await fetch(`/api/notify/${user_id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: 'accept-request',
                paper_id: paper_id
            })
        }).then(res => res.json()).then(data => {
            console.log('data', data);

            socket.emit("send-notification", {

                receiver: user_id,
                user: data.user,
                type: 'accept-request',
                paper: data.paper
            }, () => {
                console.log('data.message', data);

            });

        })
    })
}
async function decline_request(paper_id, user_id) {

    await fetch(`/api/delete-request/${paper_id}`, {
        headers: {
            "Content-Type": "application/json"
        },
        method: 'DELETE',
        body: JSON.stringify({

            user_id
        })
    }).then(res => res.json()).then(async data => {
        console.log('join result', data);

        await fetch(`/api/notify/${user_id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: 'decline-request',
                paper_id: paper_id
            })
        }).then(res => res.json()).then(data => {
            // delete_notification(notification_id)
            socket.emit("send-notification", {

                receiver: user_id,
                user: data.user,
                type: 'decline-request',

                paper: data.paper
            });

        })
    })
}
async function display_notification(data) {
    console.log('notification', data);

    const translations = await loadTranslation()


    const u = await get_user(data.sender)
    user = u.users[0]
    let postHtml = ''
    let profilePicture = user.profile_picture;
    let isExternal;
    let imageSrc;
    if (profilePicture) {
        isExternal = profilePicture.startsWith("http");
        imageSrc = isExternal
            ? profilePicture
            : `profile_images/${profilePicture}`;
    } else {
        imageSrc = 'profile_images/non-picture'
    }
    let post = data.data.post
    const backgroundSize = data.data.type === "message"
        ? 'fa-solid fa-comment'
        : data.data.type === "join-request"
            ? 'fas fa-file'
            : data.data.type === "new-post"
                ? 'fas fa-home'
                : data.data.type === "dufp"
                    ? 'fas fa-ban'
                    : data.data.type === "accept-request"
                        ? 'fa-solid fa-handshake'
                        : data.data.type === "decline-request"
                            ? 'fa-solid fa-handshake'
                            : data.data.type === "private"
                                ? 'fa-solid fa-comment'
                                : data.data.type === "mention-in-public"
                                    ? 'fa-solid fa-comment'
                                    : data.data.type === "mention-in-welcome"
                                        ? 'fa-solid fa-comment'
                                        : data.data.type === "reply"
                                            ? 'fa-solid fa-comment'
                                            : data.data.type === "accept"
                                                ? 'fa-solid fa-handshake'
                                                : 'fa-solid fa-bell';

    if (post) {
        postHtml = `
        <div class="request-buttons" style="display:flex">
            <a class="css-1k7990c-StyledButton" onclick="goTopost('${post._id}','${data.data.notification._id}')">
                Go to post
            </a>
            <a id="ignore-post" class="css-1k7990c-StyledButton" onclick="ignorePost('${data.data.notification._id}')">
                Ignore
            </a>
        </div>
    `;

    }
    if (data.data.paper && data.data.type !== "join-request") {

        if (data.data.paper.user_id == userId) {
            const createNew = document.getElementById('create-newNotification');

            createNew.style.display = 'flex';
        } else {
            const joineNew = document.getElementById('join-paperNotification');

            joineNew.style.display = 'flex';
        }
        // const user = await get_user(data.data.sender);

        document.getElementById('notifications-container').innerHTML += `

            <div  class="notification unread" onclick="handleNotificationClick('${data.data.type}', ${JSON.stringify(data.conversation)})">
                <div  class="notificationInfo>
                    <div id class="image-comb">
                            <img src="${imageSrc}" alt="Profile Picture"/>
                            <i class="notification-i ${backgroundSize}"></i>
                    </div>
                </div>
                <p>${data.data.type === "message" ? `${data.data.user.name} ${translations.notification_message.message}`

                : data.data.type === "accept-request" ? `${data.data.user.name} ${translations.notification_message.accept_request} `
                    : data.data.type === "private" ? `${data.data.user.name} ${translations.notification_message.private}`
                        : data.data.type === "public" ? `${data.data.user.name} ${translations.notification_message.public}`

                            : data.data.type === "mention-in-public" ? `${data.data.user.name} ${translations.notification_message.mention_in_public}`
                                : data.data.type === "mention-in-welcome" ? `${data.data.user.name} ${translations.notification_message.mention_in_welcome}`
                                    : data.data.type === "reply" ? `${data.data.user.name} ${translations.notification_message.reply}`
                                        : `${translations.notification_message.default}`
            }</p>

        `;
    } else {

        document.getElementById('notifications-container').innerHTML += `

                <div id="${data.data.type === 'join-request' ? `notification-${data.data.notification._id}` : ""}" class="notification unread" onclick="handleNotificationClick('${data.data.type}', ${JSON.stringify(data.conversation)})">
                    <div  class="notificationInfo">
                        <div id class="image-comb">
                                <img src="${imageSrc}" alt="Profile Picture"/>
                                <i class="notification-i ${backgroundSize}"></i>

                        </div>
                        <p>${data.data.type === "message" ? `${data.data.user.name} ${translations.notification_message.message}`

                : data.data.type === "accept-request" ? `${data.data.user.name} ${translations.notification_message.accept_request} `
                    : data.data.type === "private" ? `${data.data.user.name} ${translations.notification_message.private}`
                        : data.data.type === "public" ? `${data.data.user.name} ${translations.notification_message.public}`
                            : data.data.type === "dufp" ? `${data.data.user.name} ${translations.notification_message.dufp}`
                                : data.data.type === "decline-request" ? `${data.data.user.name} ${translations.notification_message.decline_request}`
                                    : data.data.type === "new-post" ? `${data.data.user.name} ${translations.notification_message.newPost}`
                                        : data.data.type === "join-request" ? `${data.data.user.name} ${translations.notification_message.join_request}`
                                            : data.data.type === "private" ? `${data.data.user.name} ${translations.notification_message.private}`
                                                : data.data.type === "mention-in-public" ? `${data.data.user.name} ${translations.notification_message.mention_in_public}`
                                                    : data.data.type === "mention-in-welcome" ? `${data.data.user.name} ${translations.notification_message.mention_in_welcome}`
                                                        : data.data.type === "reply" ? `${data.data.user.name} ${translations.notification_message.reply}`
                                                            : `${translations.notification_message.default}`

            }</p>
                    </div>
            <div class="request-buttons" style="display:flex">
                <a class="css-1k7990c-StyledButton" onclick="accept_request('${data.data.paper._id}','${data.data.notification.sender}'); delete_notification('${data.data.notification._id}')" >
                ${translations.joinPaper.accept}
                </a>
                <a class="css-1k7990c-StyledButton" onclick="decline_request('${data.data.paper._id}','${data.data.notification.sender}'); delete_notification('${data.data.notification._id}')">
                ${translations.joinPaper.reject}
                </a>
            </div>
            ${postHtml}

            </div>

        `;
    }



    const notifications = document.querySelectorAll('.notification');

    // Remove border-radius from all notifications
    notifications.forEach(notification => {
        notification.style.borderRadius = '0';
    });

    if (notifications.length > 0) {
        notifications[0].style.borderRadius = '10px 10px 0 0'; // First child
        notifications[notifications.length - 1].style.borderRadius = '0 0 10px 10px'; // Last child
    }
}


const signout = async () => {
    try {
        const response = await fetch('/api/signout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Clear client-side authentication data
            const cookies = document.cookie.split(';');

            // Loop through and clear each one
            for (let cookie of cookies) {
                const eqPos = cookie.indexOf('=');
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
            }

            window.location.href = '/pages/login';
        } else {
            console.error("Failed to sign out");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
};
const signAsadmin = async () => {
    try {
        const response = await fetch('/api/signout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const cookies = document.cookie.split(';');

            // Loop through and clear each one
            for (let cookie of cookies) {
                const eqPos = cookie.indexOf('=');
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
            }
            window.location.href = '/pages/log-in'; // Redirect to login page
        } else {
            console.error("Failed to sign out");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
};
async function handleNotificationClick(notificationType, notification) {

    switch (notificationType) {
        case "message":
            show_Single_conversation(notification.user_id);

            break;
        case "join-request":
            show_Single_conversation(id);
            break;
        case "private":
            show_conversation(notification.paper_id);
            break;
        case "mention-in-public":
            show_Single_conversation(id);
            break;
        case "mention-in-welcome":
            show_Single_conversation(id);
            break;
        case "reply":
            show_Single_conversation(id);
            break;
        case "accept":
            show_Single_conversation(id);
            break;
        case "single":
            break;
        case "public":
            show_public_conversation()
        default:
            console.log("Unknown notification type");
    }
    if (!notification.read) await read_notification(notification._id);
}
function reset_reply() {
    const message_container = document.getElementById('messaging-container');
    const reply_content = document.getElementById('reply-content')


    if (reply_content && message_container.contains(reply_content)) {
        reply_content.remove()
    }
    const closeButton = document.getElementById('close-button');
    if (closeButton && message_container.contains(closeButton)) {
        closeButton.remove()

    }
    if (message_container.classList.contains('toggled')) {
        message_container.classList.remove('toggled');
    }

    isreply = false;
    replyTo = null;
}
async function delete_notification(notification_id) {
    const notification = document.getElementById(`notification-${notification_id}`)
    console.log('notification', notification);

    const response = fetch(`/api/delete-notification/${notification_id}`, {
        method: "DELETE"
    })
    notification.remove()
    return response
}
async function ignorePost(notification_id) {

    const notification = document.getElementById(`notification-${notification_id}`)
    console.log('notification', notification);

    const response = await delete_notification(notification_id)
    // if (response.ok) {

    // }
}
async function read_notification(n_id) {
    const response = await fetch(`/api/read-notification/${n_id}`, {
        method: "PUT"
    })
    return response
}
async function goTopost(id, n_id) {
    // const post = document.getElementById(`post-${id}`)


    response = await read_notification(n_id)
    if (response.ok) {
        const data = await response.json()
        console.log('data', JSON.stringify(data.notification));
        window.location.href = `/posts/${id}`
    }
}
function reply(message) {

    console.log('message', message);
    message = JSON.parse(decodeURIComponent(message));
    // message = JSON.parse(message)
    reset_reply();
    const message_container = document.getElementById('messaging-container');
    let file = ``
    message_container.classList.add('toggled');
    let fileExtension
    let isImage
    let isFile
    if (message.fileUrl) {
        fileExtension = message.fileUrl.split('.').pop().toLowerCase();
        isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)
        if (isImage) {
            file = document.createElement('img')
            file.id = 'img-frame'
            file.src = `/conversation_files/${message.fileUrl}`
        } else {
            isFile = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(fileExtension)
            file = document.createElement('p')
            file.id = 'file-frame'
            file.textContent = `${message.fileUrl}`
        }
    }
    const reply_content = document.createElement('div')

    reply_content.className = 'reply-content'
    reply_content.id = 'reply-content'
    const message_content = document.createElement('p');
    message_content.id = `message_content`;
    console.log('message text', message.text);

    message_content.textContent = isImage
        ? `${message.text}`
        : isFile && message.text !== ''
            ? `,${message.text}`
            : `${message.text}`;
    message_content.style.fontWeight = "600";
    message_content.style.color = 'black';
    message_content.style.fontSize = "small";

    if (file) {
        reply_content.appendChild(file)
    }
    reply_content.appendChild(message_content)
    const closeButton = document.createElement('i');
    closeButton.id = 'close-button';
    closeButton.className = 'fa-solid fa-xmark close-button';
    closeButton.onclick = function () {
        reset_reply(message.id);
    };


    isreply = true;
    replyTo = message._id;
    console.log('ReplyTo:', replyTo, 'isreply:', isreply);
    reply_content.appendChild(closeButton);
    message_container.prepend(reply_content);



}


async function buildNotifications(notifications) {
    const translations = await loadTranslation()

    console.log("DUFP Message:", translations.notification_message.dufp);

    let content = "";
    if (notifications.length === 0) {
        content = translations.sidebar.no_notifications
        return content
    }

    const notificationPromises = notifications.map(async (notification) => {
        console.log('Notification', notification.type);

        const backgroundSize = notification.type === "message"
            ? 'fas fa-comment'
            : notification.type === "join-request"
                ? 'fas fa-file'
                : notification.type === "new-post"
                    ? 'fas fa-home'
                    : notification.type === "accept-request"
                        ? 'fas fa-handshake'

                        : notification.type === "public"
                            ? 'fas fa-comment'
                            : notification.type === "decline-request"
                                ? 'fas fa-handshake'
                                : notification.type === "private"
                                    ? 'fas fa-comment'
                                    : notification.type === "mention-in-public"
                                        ? 'fas fa-comment'
                                        : notification.type === "mention-in-welcome"
                                            ? 'fas fa-comment'
                                            : notification.type === "reply"
                                                ? 'fas fa-comment'
                                                : notification.type === "dufp"
                                                    ? 'fa-solid fa-user-slash'
                                                    : notification.type === "accept"
                                                        ? 'fas fa-handshake'
                                                        : 'fas fa-bell';

        const profilePicture = notification.sender_info.profile_picture;

        let isExternal;
        let imageSrc;
        if (profilePicture) {
            isExternal = profilePicture.startsWith("http");
            imageSrc = isExternal
                ? profilePicture
                : `/profile_images/${profilePicture}`;
        }



        let post = notification.post_info

        let postHtml = `
        <div class="request-buttons">
            <a class="css-1k7990c-StyledButton" onclick="goTopost('${notification.post_id}','${notification._id}')">
                Go to post
            </a>
            <a id="ignore-post" class="css-1k7990c-StyledButton" onclick="ignorePost('${notification._id}')">
                Ignore
            </a>
        </div>
        `;


        return `
            <div id="notification-${notification._id}" class="notification"
                    onclick="handleNotificationClick('${notification.type}',${JSON.stringify(notification).replace(/"/g, '&quot;')})">
                <div class="notificationInfo">
                    <div class="image-comb">
                        <img onclick="event.stopPropagation();showProfile('${JSON.stringify(notification.sender_info).replace(/"/g, '&quot;')}')" src="${imageSrc}" alt="Profile Picture"/>
                        <i class="notification-i ${backgroundSize}"></i>
                    </div>
                    <p>


                ${notification.type === "accept-request" ? `${notification.sender_info.name} ${translations.notification_message.accept_request} "${notification.paper_info.title}" `
                : notification.type === "private" ? `${notification.sender_info.name} ${translations.notification_message.private}`
                    : notification.type === "message" ? `${notification.sender_info.name} ${translations.notification_message.message}`
                        : notification.type === "public" ? `${notification.sender_info.name} ${translations.notification_message.public}`
                            : notification.type === "dufp" ? `${notification.sender_info.name} ${translations.notification_message.dufp} "${notification.paper_info.title}"`
                                : notification.type === "dufc" ? `${notification.sender_info.name} ${translations.notification_message.dufc} "${notification.conversation.conv_title}"`
                                    : notification.type === "decline-request" ? `${notification.sender_info.name} ${translations.notification_message.decline_request} "${notification.paper_info.title}"`
                                        : notification.type === "new-post" ? `${notification.sender_info.name} ${translations.notification_message.newPost}`
                                            : notification.type === "join-request" ? `${notification.sender_info.name} ${translations.notification_message.join_request} "${notification.paper_info.title}"`
                                                : notification.type === "mention-in-public" ? `${notification.sender_info.name} ${translations.notification_message.mention_in_public}`
                                                    : notification.type === "mention-in-welcome" ? `${notification.sender_info.name} ${translations.notification_message.mention_in_welcome}`
                                                        : notification.type === "reply" ? `${notification.sender_info.name} ${translations.notification_message.reply}`
                                                            : `${translations.notification_message.default}`

            }</p>
            </div>
            <div class="request-buttons" style='display:${notification.type === "join-request" ? 'flex' : 'none'}'>
                <a class="css-1k7990c-StyledButton" onclick="accept_request('${notification.paper_id}','${notification.sender}'); delete_notification('${notification._id}')" >
                    ${translations.joinPaper.accept}
                </a>
                <a class="css-1k7990c-StyledButton" onclick="decline_request('${notification.paper_id}','${notification.sender}'); delete_notification('${notification._id}')">
                    ${translations.joinPaper.reject}
                </a>
            </div>
                ${notification.type === 'new-post' ? postHtml : ""}
            </div>
        `;
    });


    const notificationContents = await Promise.all(notificationPromises);

    content = notificationContents.join('');
    return content;
}


async function showPapers(tag) {
    try {
        console.log('tag', tag);

        const paperContainer = document.querySelector('.papersContainer')
        // Update the DOM with generated content
        paperContainer.style.display = 'flex'
        paperContainer.innerHTML = circular_spinner
        let url = `/api/tag-papers/${encodeURIComponent(tag)}`
        console.log('url', url);

        const response = await fetch(url, {
            method: "GET",
        });

        if (response.ok) {
            const papers = await response.json();

            let content = '';

            content = `
            <strong><span style="font-size:large" class="tag">${tag}</span></strong>
            `
            if (papers.length === 0) {
                content = translations.sidebar.no_papers;
            } else {
                papers.forEach(paper => {
                    content += `
                    
                    <div id="${paper._id}" class="paper-line">
                        <div class="paperinfo">
                            <i id="joined-paper" class="fas fa-file"></i>
                            <span class="paper-title"><strong>${paper.title}</strong></span>
                            <span class="dash"><strong>-</strong></span>
                            <span class="paper-study"><strong>${paper.type_of_study}</strong></span>
                            <span class="dash"><strong>-</strong></span>
                            <strong id="need">We Need:</strong>
                            <span class="dash"><strong>-</strong></span>
                            <span class="paper-we-need"><strong>${paper.we_need}</strong></span>
                            <span class="dash"><strong>-</strong></span>
                            <span class="paper-branch"><strong>${paper.main_field}</strong></span>
                            <span class="dash"><strong>-</strong></span>
                            <span class="paper-branch"><strong>${paper.language}</strong></span>
                            <span class="dash"><strong>-</strong></span>
                            <span id="${paper._id}" class="paper-branch"><strong>${paper._id}</strong></span>
                            <div class="paper-tags">
                                <strong>
                                    ${paper.tags.map(tag => `<strong><span class="tag">${tag}</span></strong>`).join('')}
                                </strong>
                            </div>
                        </div>
                                        <button  onclick="show_conversation('${paper._id}')" class="join-button">Enter</button>

                    </div>`;
                });
            }
            paperContainer.innerHTML = content;

            document.addEventListener('click', () => {
                paperContainer.style.display = 'none'
            })
        } else {
            console.error('Failed to fetch papers:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching papers:', error);
    }
}

function closeConversation() {
    const mainContent = document.getElementById('maincontent')
    if (mainContent.style.display === 'block') {
        mainContent.style.display = 'none' // Clear conversation content if needed
    }
}
async function loadNotifications() {

    const response = await fetch(`/api/notifications?skip=${Nskip}&limit=${Nlimit}`, {
        method: "GET"
    });

    const data = await response.json();

    let content = await buildNotifications(data.Notifications);

    let notificationsContainer = mainContent.querySelector('.notifications-container')
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div')
        notificationsContainer.id = 'notifications-container'
        notificationsContainer.className = 'notifications-container'
        mainContent.append(notificationsContainer)
    }
    notificationsContainer.innerHTML += content;
    let loadNotificationsBtn = document.getElementById('loadMoreNotifications')
    if (!loadNotificationsBtn) {
        loadNotificationsBtn = document.createElement('button');
        loadNotificationsBtn.id = 'loadMoreNotifications';
        loadNotificationsBtn.textContent = 'Load More';
        loadNotificationsBtn.className = 'notifications-button'
        notificationsContainer.appendChild(loadNotificationsBtn);
        loadNotificationsBtn.addEventListener('click', loadNotifications);
    }
    notificationsContainer.appendChild(loadNotificationsBtn);
    if (data.Notifications.length < Nlimit) {
        loadNotificationsBtn.style.display = 'none'
    }
    loadNotificationsBtn.addEventListener('click', function () {
        loadNotifications();
    });
    Nskip += data.Notifications.length;
    return notificationsContainer
}

async function addListeners() {

    const cancel = document.getElementById('cancel');
    const confirm_delete = document.getElementById('confirm-delete');
    const editclose = document.getElementById('closeedit')
    const users_to_delete = document.getElementById('users-to-delete')
    const create_paper = document.getElementById('start_paper_button')
    const searchPapers = document.getElementById('searchpapers-button')
    const yourPapers = document.getElementById('your-papers-button')
    const joinedPapers = document.getElementById('joined-papers-button')
    const searchFriends = document.getElementById('search-friends-button')
    const yourFriends = document.getElementById('your-friends-button')
    const notifications_button = document.getElementById('notifications-button')

    const translations = await loadTranslation()
    popup_buttons.forEach((button, index) => {

        button.removeEventListener('click', togglePopup);
        button.addEventListener('click', togglePopup);

        function togglePopup() {


            mainContent.textContent = '';
            popups.forEach((popup, popupIndex) => {
                if (popupIndex !== index) {
                    popup.style.display = 'none';
                }
            });

            mainContent.innerHTML = popups[index].innerHTML;
            popups[index].style.display = 'none';

            if (popups[index].id === 'startpaper-popup') {
                const startpaper = mainContent.querySelector('.startpaper-popup')

                dropdowns.forEach(function (dropdown) {
                    const inputElement = startpaper.querySelector(`#${dropdown.inputId}`);
                    const container = startpaper.querySelector(`#${dropdown.containerid}`);
                    const optionsList = startpaper.querySelector(`#${dropdown.optionsid}`);
                    const options = optionsList.querySelectorAll('li');

                    inputElement.addEventListener('focus', function () {
                        container.classList.add('open');
                    });


                    options.forEach(function (option) {
                        option.addEventListener('click', function () {

                            inputElement.value = this.textContent;
                            container.classList.remove('open');
                        });
                    });


                    document.addEventListener('click', function (e) {
                        if (!container.contains(e.target) && e.target !== inputElement) {
                            container.classList.remove('open');
                        }
                    });
                });

                const create_paper = startpaper.querySelector('#start_create')
                const inputField = startpaper.querySelector('#tags');
                const overlay = startpaper.querySelector('#tags-overlay');
                inputField.addEventListener('input', function () {
                    const inputValue = inputField.value;
                    console.log('inputValue', inputValue);
                    let overlayText = '';

                    const tagRegex = /#[a-zA-Z0-9-_\u0600-\u06FF]+(?=\s|$)/g;
                    const matches = inputValue.match(tagRegex);
                    console.log('tags', tags);

                    if (tags) {
                        tags.clear();
                    }
                    if (matches) {
                        matches.forEach(tag => tags.add(tag));
                    }

                    inputValue.split(/(\s+)/).forEach((word) => {
                        if (tags.has(word)) {
                            overlayText += `<span class="is-tag"><strong>${word}</strong></span> `;
                        } else {
                            overlayText += `<span><strong>${word}</strong></span> `;
                        }
                    });
                    if (inputField.value.trim() === '') {
                        // Hide or clear the overlay when input is empty
                        overlay.innerHTML = ''; // Clear content
                        overlay.style.display = 'none'; // Optionally hide the overlay
                    } else {
                        // Show and update the overlay as needed
                        overlay.style.display = 'block';
                        overlay.innerHTML = overlayText;
                    }
                    // overlay.innerHTML = overlayText;
                });

                create_paper.addEventListener('click', async function (e) {

                    const we_need = startpaper.querySelector('#we_need').value;
                    const type_of_study = startpaper.querySelector('#type_of_study').value;
                    const project_branch = startpaper.querySelector('#project_branch').value;
                    const description = startpaper.querySelector('#description').value;

                    const paper_title = startpaper.querySelector('#paper_title').value;
                    const language = startpaper.querySelector('#start-language-input').value;
                    tags = Array.from(tags);
                    let response
                    //    try {
                    // try {
                    response = await fetch('/api/create-paper', {
                        headers: { 'Content-Type': 'application/json' },
                        method: 'POST',
                        body: JSON.stringify({
                            type_of_study,
                            project_branch,
                            title: paper_title,
                            we_need,
                            tags,
                            language,
                            description
                        }),
                    })
                    if (response.ok) {

                    }
                    else {
                        try {
                            // Try to parse the response for error details
                            const errorData = await response.json();
                            const errorMessage = errorData.message || "An error occurred"; // Use a default message if none provided
                            display_error(errorMessage, startpaper);
                        } catch (parseError) {
                            display_error(parseError, startpaper);
                        }
                        return;
                    }


                    const data = await response.json()
                    if (data.paper) {
                        const form = new FormData();
                        form.append('type', 'private');
                        form.append('paper_id', data.paper._id);
                        form.append('members', Array.from(members));
                        form.append('conv_pic', 'welcome.png');
                        form.append('title', 'welcome chat');

                        const res = await fetch('/api/new-conversation', {
                            method: 'POST',
                            body: form,
                        })

                        if (res.ok) {
                            display_Message(translations.sidebar.paper_added)
                        }
                    } else {

                    }



                });
            }
            if (popups[index].id === 'searchpapers-popup') {
                const searchPopup = mainContent.querySelector('.searchpapers-popup')
                const toggleButton = searchPopup.querySelector('#advanced_button');
                const search_button = searchPopup.querySelector('#search')
                const advancedSearch = searchPopup.querySelector('.advancedsearch-container');

                toggleButton.addEventListener('click', () => {
                    const papersdropdowns = [
                        { inputId: 'paper_we_need', containerid: 'paper-weneed-container', optionsid: 'paper-weneed-list' },
                        { inputId: 'language-input', containerid: 'language-container', optionsid: 'language-list' },
                        { inputId: 'paper_project_branch', containerid: 'paper-projectbranch-container', optionsid: 'paper-projectbranch-list' },
                    ];
                    advancedSearch.classList.toggle('show');
                    toggleButton.classList.toggle('toggled')

                    papersdropdowns.forEach(function (dropdown) {
                        const inputElement = searchPopup.querySelector(`#${dropdown.inputId}`);
                        const container = searchPopup.querySelector(`#${dropdown.containerid}`);
                        const optionsList = searchPopup.querySelector(`#${dropdown.optionsid}`);
                        const options = optionsList.querySelectorAll('li');
                        console.log('input', inputElement);

                        inputElement.addEventListener('click', function () {
                            container.classList.toggle('open'); // Toggle the open class
                        });

                        options.forEach(function (option) {
                            option.addEventListener('click', function () {
                                console.log('inputElement', inputElement);
                                inputElement.value = this.textContent;
                                container.classList.remove('open');
                            });
                        });

                        document.addEventListener('click', function (e) {
                            if (!container.contains(e.target) && e.target !== inputElement) {
                                container.classList.remove('open');
                            }
                        });
                    });
                });
                search_button.addEventListener('click', async function (e) {

                    show_spinner()
                    let content = ''
                    const title = searchPopup.querySelector('#paper-title').value
                    const main_field = searchPopup.querySelector('#paper_project_branch').value
                    const we_need = searchPopup.querySelector('#paper_we_need').value
                    const language = searchPopup.querySelector('#language-input').value
                    const id = searchPopup.querySelector('#ID').value
                    const paper_result = searchPopup.querySelector('#paper-result')
                    const paper_data = JSON.stringify({
                        title,
                        id,
                        main_field,
                        we_need,
                        language,
                    })

                    try {
                        content = await show_search_result(paper_data)

                        paper_result.innerHTML = content;
                        paper_result.classList.add('active')
                        const translations = await loadTranslation()
                        const joinButtons = document.querySelectorAll('.join-button')
                        const enterButtons = document.querySelectorAll('.enter-button')
                        joinButtons.forEach(button => {
                            button.textContent = translations.joinPaper.joinButton
                        })
                        enterButtons.forEach(button => {
                            button.textContent = translations.joinPaper.enterButton
                        })
                    } catch (error) {
                        console.log(error);

                    }
                    finally {
                        hide_spinner()
                    }
                })
            }
            if (popups[index].id === 'searchfriends-popup') {
                console.log('searchfriends-popup');
                const searchPopup = mainContent.querySelector('.searchfriends-popup')
                const friend_search = searchPopup.querySelector('#friend-search')

                friend_search.addEventListener('click', async function (e) {
                    e.preventDefault();

                    const friend_search_input = searchPopup.querySelector('#friend-search-input').value;
                    let friendChats = searchPopup.querySelector('#friendChats')
                    try {
                        // Execute fetch request
                        const response = await fetch('/api/get-user', {
                            headers: { 'Content-Type': 'application/json' },
                            method: "POST",
                            body: JSON.stringify({
                                query: friend_search_input
                            })
                        });

                        const data = await response.json();

                        let content = "";
                        const friend_result = mainContent.querySelector('#friend-result');

                        if (data.user.length == 0) {
                            friend_result.innerHTML = `<p> No matches</p>`;
                        } else {
                            data.user.forEach(u => {
                                content += `
                                    <div class="paper-line">
                                        <div class="paperinfo">
                                            <img onclick="event.stopPropagation(); showProfile('${JSON.stringify(u).replace(/"/g, '&quot;')}')" src="/profile_images/${u.profile_picture}" alt="Profile Picture">
                                            <span class="paper-title"><strong>${u.name}</strong></span>

                                            ${u.phoneHidden == false ? `
                                                <span class="dash"><strong>-</strong></span>
                                                <span class="paper-study"><strong>${u._id}</strong></span>` : ""}
                                        </div>
                                        <button class="friend-message" id="send-friend-message" onclick="show_Single_conversation('${u._id}')">send a message</button>
                                    </div>
                                `;
                            });
                        }

                        friendChats.innerHTML = content;
                        const translations = await loadTranslation()

                        const friendButtons = document.querySelectorAll('.friend-message')
                        console.log('friends buttons', friendButtons);

                        friendButtons.forEach(button => {
                            button.textContent = translations.friends.sendFriendMessage;
                        })
                    } catch (err) {
                        console.error('Error during fetch:', err);
                        // You can handle any errors here
                    } finally {
                        // Hide spinner after everything is done

                    }
                });
            }


        }

    });
    const toggleLinks = document.querySelectorAll('.toggle-link');

    toggleLinks.forEach(toggleLink => {
        toggleLink.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent the default anchor click behavior
            // Check if the clicked element is a sublist item
            if (event.target.tagName.toLowerCase() === 'li') {
                return; // Do nothing if a sublist item is clicked
            }
            // Get the container and sublist within the clicked link
            const toggleContainer = this.querySelector('.toggle-tab-container, .toggle-tab-container-2, .toggle-tab-container-3, .toggle-tab-container-4');
            const sublist = this.querySelector('.sublist, .sublist-2, .sublist-3, .sublist-4');

            toggleContainer.classList.toggle('active');

            // Handle the sublist visibility
            if (toggleContainer.classList.contains('active')) {
                sublist.style.maxHeight = sublist.scrollHeight + "px";
                sublist.style.paddingTop = "3px"; // Add padding when active
            } else {
                sublist.style.maxHeight = "0";
                sublist.style.paddingTop = "0"; // Remove padding when collapsed
            }

            // Rotate the icon inside the tab-icon class
            const tabIcon = this.querySelector('.tab-icon svg');
            if (tabIcon) {
                if (toggleContainer.classList.contains('active')) {
                    tabIcon.style.transform = 'rotate(180deg)';
                } else {
                    tabIcon.style.transform = 'rotate(0deg)';
                }
            }
        });
    });
    document.getElementById('your-papers-button').addEventListener('click', async function () {
        console.log('your-papers-button');

        show_spinner()
        const response = await fetch('/api/papers', {
            method: "GET"
        });

        if (response.ok) {
            const data = await response.json()
            let content = ''
            if (data.papers.length === 0) {
                content = translations.sidebar.no_papers
            }
            data.papers.forEach(paper => {
                content += `
             <div 
     id="${paper._id}" 
     class="paper-line"
     onclick="show_conversation(&quot;${encodeURIComponent(JSON.stringify(paper))}&quot;)">

                <i id="gear"  class="gear fa-solid fa-ellipsis-vertical"></i>
                <div class="paperinfo">
                    <i id="joined-paper" class="fas fa-file"></i>
                    <span class="paper-title"><strong>${paper.title}</strong></span>
                    <span class="paper-study"><strong>${paper.type_of_study}</strong></span>
                    <strong id="need">We Need:</strong>
                    <span class="paper-we-need"><strong>${paper.we_need}</strong></span>
                    <span class="paper-branch"><strong>${paper.main_field}</strong></span>
                    <span class="paper-branch"><strong>${paper.language}</strong></span>
                    <span id="${paper._id}"class="paper-branch"><strong>${paper._id}</strong></span>
                    <br>
                    <span style="${paper.description ? "display:block" : "display:none"}" class="description"><strong>${paper.description}</strong></span>

                     <div class="paper-tags">
                        <strong>
                        ${paper.tags.map(tag => `<strong><span onclick ="showPapers('${tag}'); event.stopPropagation();" class="tag">${tag}</span></strong>`).join('')}

                        </strong>
                    </div>
                </div>
                
        </div>
            `

            })
            const paperscontainer = mainContent.querySelector('.yourpapers-container')


            paperscontainer.innerHTML = content

            const paper_settings = document.getElementById('paper-settings');
            const confirm_delete = document.getElementById('confirm-delete');
            const paperLines = document.querySelectorAll('.paper-line');
            const firstPaperLine = document.querySelector('.paper-line:first-child');
            const paperSpans = document.querySelectorAll('.paper-line span')
            const etnerButtons = document.querySelectorAll('.button-container a')
            paperSpans.forEach(span => {
                // span.addEventListener('click',(event)=>{
                //     event.preventDefault()
                //     event.stopPropagation();

                //     console.log('title',span);

                //     if(span.style.webkitLineClamp  =='2'){
                //         // span.style.overflow ='hidden'
                //         span.style.webkitLineClamp ='unset'
                //     }else{
                //         // span.style.overflow ='visible'
                //         span.style.webkitLineClamp  =='2'
                //     }
                // })
                span.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    console.log("title", span);

                    // Get computed styles to check the current line clamp value
                    const computedStyle = window.getComputedStyle(span);
                    const currentClamp = computedStyle.webkitLineClamp;

                    if (currentClamp === "2") {
                        span.style.display = "block"; // Ensure full visibility
                        span.style.webkitLineClamp = "unset";
                        span.style.overflow = "visible"; // Allow full text
                    } else {
                        span.style.display = "-webkit-box"; // Enable multi-line truncation
                        span.style.webkitLineClamp = "2";
                        span.style.overflow = "hidden";
                    }
                });

            })

            etnerButtons.forEach(button => {
                button.textContent = translations.yourPapers.enter;
            })
            document.getElementById('editPaper').querySelector('p').textContent = translations.yourPapers.editPaper;
            document.getElementById('delete-user-from-paper').querySelector('p').textContent = translations.yourPapers.deleteUser;
            document.getElementById('deletePaper').querySelector('p').textContent = translations.yourPapers.deletePaper;


            data.papers.forEach(function (paper) {
                const paperLine = document.getElementById(`${paper._id}`)
                const gear = paperLine.querySelector('.gear');
                const parentPaperElement = document.getElementById(`${paper._id}`);



                gear.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const paperLine = gear.closest('.paper-line');
                    paperId = paperLine.id;

                    if (paper_settings) {
                        paper_settings.style.display = 'none'
                    }
                    if (paperLine === firstPaperLine) {
                        paper_settings.style.display = 'flex';
                        paper_settings.style.top = `${isMobile() ? '55vw' : '13vw'}`;  // Set top for the first element
                    } else {
                        const rect = parentPaperElement.getBoundingClientRect();
                        const viewportHeight = document.documentElement.clientHeight;
                        const viewportWidth = document.documentElement.clientHeight;
                        console.log('view port', viewportHeight);

                        let newTop = ((rect.top + rect.height) / viewportWidth) * isMobile() ? 130 : 100; // Position directly below the parent element


                        const maxAllowedTop = viewportHeight - paper_settings.offsetHeight - 10; // 10px padding from bottom
                        if (newTop > maxAllowedTop) {
                            newTop = maxAllowedTop;
                        }

                        paper_settings.style.display = 'flex';
                        paper_settings.style.top = `${newTop}vw`;
                        // Set the new top for this paper

                    }
                });



            });
            const deletePaper = document.getElementById('deletePaper');
            const editPaper = document.getElementById('editPaper');
            const dufp = document.getElementById('delete-user-from-paper')


            deletePaper.addEventListener('click', function () {
                confirm_delete.querySelector('p').textContent = translations.sidebar.confirm_delete
                confirm_delete.style.display = 'flex';
                document.getElementById('cancel').textContent = translations.sidebar.cancel;
                document.getElementById('confirm').textContent = translations.sidebar.confirm;

            });
            editPaper.addEventListener('click', async function () {
                await edit_paper(paperId)
                document.getElementById('update-project-branch').querySelector('label').textContent = translations.startPaper.projectBranch;
                document.getElementById('update-weneed-container').querySelector('label').textContent = translations.startPaper.we_need;
                document.getElementById('update-language-container').querySelector('label').textContent = translations.startPaper.language;
                document.getElementById('update-typeof-study-container').querySelector('label').textContent = translations.startPaper.type_of_study;
                document.getElementById('update-tags-container').querySelector('label').textContent = translations.startPaper.tags.label;
                document.getElementById('update_paper').textContent = translations.startPaper.update;

            })
            dufp.addEventListener('click', async function (e) {
                e.preventDefault()
                await showUsers()
                document.getElementById('deleteUserFromPaper').textContent = translations.sidebar.delete;

            })
            hide_spinner()
        }
    })

    document.getElementById('joined-papers-button').addEventListener('click', async function () {

        show_spinner()
        const response = await fetch('/api/joinedPapers', {
            method: "GET"
        });
        if (response.ok) {

            const data = await response.json()

            let content = ''
            if (data.joinedpapers.length == 0) {
                content = translations.sidebar.no_joined_papers
            } else {
                data.joinedpapers.forEach(paper => {
                    if (!paper) {

                    } else {
                        content += `

<div 
     id="${paper._id}" 
     class="paper-line"
     onclick="show_conversation(&quot;${encodeURIComponent(JSON.stringify(paper))}&quot;)">

                <div class="paperinfo">
                    <i id="joined-paper" class="fas fa-file"></i>
                    <span class="paper-title"><strong>${paper.title}</strong></span>
                    <span class="paper-study"><strong>${paper.type_of_study}</strong></span>
                    <strong id="need">We Need:</strong>
                    <span class="paper-we-need"><strong>${paper.we_need}</strong></span>
                    <span class="paper-branch"><strong>${paper.main_field}</strong></span>
                    <span class="paper-branch"><strong>${paper.language}</strong></span>
                    <span id="${paper._id}"class="paper-branch"><strong>${paper._id}</strong></span>
                    <br>
                    <span style="${paper.description ? "display:block" : "display:none"}" class="description"><strong>${paper.description}</strong></span>

                     <div class="paper-tags">
                        <strong>
                        ${paper.tags.map(tag => `<strong><span onclick ="showPapers('${tag}'); event.stopPropagation();" class="tag">${tag}</span></strong>`).join('')}

                        </strong>
                    </div>
                </div>
                
        </div>

             
            `
                    }


                })

            }
            const paperscontainer = mainContent.querySelector('.joinedpapers-container')
            console.log(paperscontainer);

            paperscontainer.innerHTML = content
            hide_spinner()
        }
    })
    create_paper.addEventListener('click', async () => {

        document.querySelector('.startpapers-label').textContent = translations.newPaper.label;
        document.getElementById('paper_title').placeholder = translations.startPaper.placeholder;
        document.getElementById('project_branch').placeholder = translations.startPaper.projectBranch;
        document.getElementById('type_of_study').placeholder = translations.startPaper.type_of_study;
        document.getElementById('we_need').placeholder = translations.startPaper.we_need;
        document.getElementById('start-language-input').placeholder = translations.startPaper.language;
        document.getElementById('tags').placeholder = translations.startPaper.tags.placeholder;
        document.getElementById('start_create').textContent = translations.startPaper.publish;

        document.getElementById('project-branch').querySelector('label').textContent = translations.startPaper.projectBranch;
        document.getElementById('we-need-container').querySelector('label').textContent = translations.startPaper.we_need;
        document.getElementById('lang-container').querySelector('label').textContent = translations.startPaper.language;
        document.getElementById('study-container').querySelector('label').textContent = translations.startPaper.type_of_study;
        document.getElementById('tags-container').querySelector('label').textContent = translations.startPaper.tags.label;
    })
    searchPapers.addEventListener('click', async () => {
        document.querySelector('.searchpapers-label').textContent = translations.joinPaper.searchpaper;

        document.getElementById('advanced').textContent = translations.joinPaper.advancedSearch.label;
        document.getElementById('paper-title').placeholder = translations.joinPaper.advancedSearch.searchPapers;

        document.getElementById('ID').placeholder = translations.joinPaper.advancedSearch.paperId;
        document.getElementById('paper_project_branch').placeholder = translations.joinPaper.advancedSearch.paperBranch;
        document.getElementById('language-input').placeholder = translations.joinPaper.advancedSearch.paperLang;
        document.getElementById('paper_we_need').placeholder = translations.joinPaper.advancedSearch.we_need;
        document.getElementById('search').textContent = translations.joinPaper.advancedSearch.search;

    })
    notifications_button.addEventListener('click', async function () {
        Nskip = 0
        document.querySelector('.notifications-label').textContent = translations.sidebar.notifications;
        loadNotifications();
    });
    yourPapers.addEventListener('click', async () => {
        document.querySelector('.yourpapers-label').textContent = translations.newPaper.dropdowns.yourPapers;
    })
    joinedPapers.addEventListener('click', async () => {
        document.querySelector('.joined-label').textContent = translations.joinPaper.dropdowns.joinedPapers;
    })

    cancel.addEventListener('click', function () {
        confirm_delete.style.display = 'none';
    });
    document.addEventListener('click', function (event) {

        const paper_settings = document.getElementById('paper-settings');
        if (paper_settings && paper_settings.style.display === 'flex') {

            if (!paper_settings.contains(event.target) && !event.target.classList.contains('gear')) {
                paper_settings.style.display = 'none';
            }
        }
        if (users_to_delete && users_to_delete.style.display === 'flex') {

            if (!users_to_delete.contains(event.target) && !event.target.classList.contains('gear')) {
                users_to_delete.style.display = 'none';
            }
        }


    });


}
async function addExitListeners() {

    toggleSidebar();
}
document.addEventListener('DOMContentLoaded', function () {
    const seen = localStorage.getItem('hasSeenWelcomePopup')


    const welcomePopup = document.getElementById('welcome-popup')

    if (isMobile()) {

        document.getElementById('sidebar').classList.add('closed')
        document.getElementById('maincontent').classList.remove('shifted')
        document.querySelector('.circle-button').classList.add('collapsed')
        document.getElementById('home').addEventListener('click', toggleSidebar)
        document.getElementById('paper-toggle-4').addEventListener('click', toggleSidebar)

        popup_buttons.forEach((button) => {
            button.addEventListener('click', toggleSidebar)
        })
    }
    if (seen === null) {

        if (welcomePopup) {
            welcomePopup.style.display = 'flex'
        }
    }
    if (welcomePopup) {
        const goHome = document.getElementById('go-home')
        goHome.addEventListener('click', function (e) {
            e.preventDefault()
            welcomePopup.remove()
            localStorage.setItem('hasSeenWelcomePopup', true)
        })
    }
    document.getElementById('home').addEventListener('click', async function () {
        skip = 0;
        let mainContent = document.getElementById('maincontent')

        mainContent.innerHTML = ''
        await loadPosts();
        applyTranslations();

    })
    //Listeners here
    addListeners()
    document.getElementById('sidebar').addEventListener('click', async function (event) {
        const exitConversations = event.target.closest('#exit_conversations');


        if (exitConversations) {
            await addExitListeners()
        }
    })




});


function show_spinner() {
    spinner.style.display = 'block'
}
function hide_spinner() {
    spinner.style.display = 'none'
}

async function send_message(type) {

    try {
        const formData = new FormData();
        const messageInput = document.getElementById('message-input');
        const captions = document.querySelector('.file-frame .frame-buttons input')
        const text = (messageInput && messageInput.value.trim() !== '')
            ? messageInput.value
            : (captions && captions.value.trim() !== '')
                ? captions.value
                : '';

        formData.append('text', text);

        formData.append('isreply', isreply ? 'true' : 'false');
        if (replyTo !== null && replyTo !== undefined) {
            formData.append('replyTo', replyTo); // Append only valid ObjectId
        } else {
        }
        const imageInput = document.getElementById('image-input');
        const fileInput = document.getElementById('file-input');

        if (fileInput && fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        } else if (imageInput) {
            formData.append('file', imageInput.files[0]);
        }
        await fetch(`/api/send-message/${conv_id}`, {
            method: "POST",

            body: formData

        }).then(res => res.json()).then(async data => {

            const text = document.getElementById('message-input');
            text.value = '';
            if (messages) {
                messages.push(data.newMessage)
            }

            const conversation = data.conversation
            const paper = data.paper
            if (type == 'public') {

                socket.emit("send-to-public-room", { message: { m: data.newMessage, sender: data.user, id: conv_id, mainfield } })
                await fetch(`/api/notify-all`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        type,
                        paper_id: ''
                    })
                }).then(res => res.json()).then(data => {
                    socket.emit("notify-publicgroup", {
                        message: data.message,
                        sender: data.user,
                        notifiedUsers: data.notifiedUsers,
                        type: "public",
                        mainfield: userMainfield
                    });
                })
                reset_reply()

            } else if (type == "private") {
                socket.emit("send-message", { message: { m: data.newMessage, user: data.user, id: conv_id } })


                data.members.forEach(async member => {

                    await fetch(`/api/notify/${member}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            type,
                            paper_id: data.conversation.paper_id
                        })
                    }).then(res => res.json()).then(data => {

                        socket.emit("notify-conversation", { message: data.message, receiver: member, user: data.user, conversation });

                        socket.emit("send-notification", {
                            message: data.message,
                            receiver: member,
                            user: data.user,
                            conversation: data.conversation,
                            type: isreply ? 'reply' : '',
                            paper: paper
                        }, () => {
                            console.log('data.message', data.message);

                        });


                    })
                })

                reset_reply()
            }
            else if (type == 'subchat') {


                console.log('in subchat');
                socket.emit("send-to-subchat", { message: { m: data.newMessage, id: conv_id, members: data.members } })
            }
        })
    } catch (error) {
        console.log(error);

    }
}
document.addEventListener('DOMContentLoaded', () => {
    const addConvBtn = document.getElementById('add-conv');
    addConvBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        const conversationForm = document.getElementById('add_conversation');
        const form = new FormData(conversationForm);

        form.append('paper_id', paperId);
        const membersArray = Array.from(members);
        membersArray.forEach(member => form.append('members[]', member));

        form.append('type', 'private');



        try {
            const response = await fetch('/api/new-conversation', {
                method: 'POST',
                body: form,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (response.ok) {
                document.querySelector('.add-conversation').style.display = 'none'
            }
            // Check if data and conv exist
            if (data.conv) {
                const chats = document.getElementById('chats');

                const content = `
                    <div class="conversation-item" onclick="get_conversation('${data.conv._id}','private')">
                        <img src="/conversation_images/${data.conv.conv_pic}" alt="${data.conv.conv_title}" />
                        <h3>${data.conv.conv_title}</h3>
                    <i onclick='event.preventDefault(); event.stopPropagation(); conversationPopup(${JSON.stringify(data.conv)})' style="display: ${data.conv.conv_title == 'welcome chat' ? 'none' : 'block'};" class="fa-solid fa-user-minus"></i>
                    <i onclick='event.preventDefault(); event.stopPropagation(); conversationAdd(${JSON.stringify(data.conv)})' style="display: ${data.conv.conv_title == 'welcome chat' ? 'none' : 'block'};" class="fa-solid fa-user-plus"></i>

                    </div>
                `;


                const addButton = document.querySelector('.plus-sign');

                if (addButton) {
                    addButton.insertAdjacentElement('afterbegin', content)
                } else {
                    chats.innerHTML += content;
                }

                get_conversation(data.conv._id, 'private');
            } else {
                console.error('No conversation returned in response:', data);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    });

});

async function showUsers() {
    show_spinner()
    await fetch(`/api/get-joined-users/${paperId}`, {
        method: "GET"
    }).then(res => res.json()).then(async data => {


        const content = await buildUsers(data.joinedUsers)
        const users_to_delete = document.getElementById('users-to-delete')
        users_to_delete.style.display = 'flex'
        users_to_delete.innerHTML = content
        document.addEventListener('click', function (e) {

            if (users_to_delete.style.display === 'flex') {
                users_to_delete.style.display = 'none'
            }
        })
        hide_spinner()
    })
}

async function buildUsers(userIds) {
    let content = '';


    if (userIds.length == 0) {
        content = "No users have joined your paper yet!"
    }
    for (const userid of userIds) {
        const u = await get_user(userid);
        const user = u.users[0] // Await the async function
        let profilePicture = user.profile_picture;
        let isExternal;
        let imageSrc;
        if (profilePicture) {
            isExternal = profilePicture.startsWith("http");
            imageSrc = isExternal
                ? profilePicture
                : `/profile_images/${profilePicture}`;
        } else {
            imageSrc = '/profile_images/non-picture.jpg'
        }
        content += `
            <div id="delete-user" class="paper-line">
                <div class="paperinfo">
                    <img src="${imageSrc}" alt="Profile Picture">
                    <span class="paper-title"><strong>${user.name}</strong></span>
                    <span class="dash"><strong>-</strong></span>
                    <span class="paper-study"><strong>${user._id}</strong></span>
                </div>
                <button onclick ="delete_userPaper('${user._id}')" id="deleteUserFromPaper">Delete user</button>
            </div>
        `;
    }

    return content;
}
async function buildConvUsers(userIds, conversation) {
    let content = '';
    console.log('userIDs', userIds);

    if (userIds.length == 0) {
        content = "No users have joined your paper yet!"
    }
    for (const userid of userIds) {
        const u = await get_user(userid);
        const user = u.users[0] // Await the async function
        let profilePicture = user.profile_picture;
        let isExternal;
        let imageSrc;
        if (profilePicture) {
            isExternal = profilePicture.startsWith("http");
            imageSrc = isExternal
                ? profilePicture
                : `/profile_images/${profilePicture}`;
        } else {
            imageSrc = '/profile_images/non-picture.jpg'
        }
        content += `
            <div id="delete-user-${user._id}" class="paper-line">
                <div class="paperinfo">
                    <img src="${imageSrc}" alt="Profile Picture">
                    <span class="paper-title"><strong>${user.name}</strong></span>
                    <span class="dash"><strong>-</strong></span>
                    <span class="paper-study"><strong>${user._id}</strong></span>
                </div>
                <button onclick="delete_convUser('${user._id}', '${encodeURIComponent(JSON.stringify(conversation))}')" id="deleteUserFromPaper">Delete user</button>
            </div>
        `;
    }

    return content;
}
async function delete_userPaper(user_id) {
    show_spinner()
    await fetch(`/api/delete-user-from-paper/${paperId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id
        })
    }).then(res => res.json()).then(async data => {

        await fetch(`/api/notify/${user_id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: 'dufp',
                paper_id: paperId
            })
        }).then(res => res.json()).then(data => {
            // delete_notification(notification_id)
            socket.emit("send-notification", {

                receiver: user_id,
                user: data.user,
                type: 'dufp',
                paper: data.paper
            });

        })
        hide_spinner()
    })

}
async function delete_convUser(userId, conversation) {
    conversation = decodeURIComponent(conversation);
    conversation = JSON.parse(conversation);
    show_spinner()
    const convId = conversation._id
    let members
    console.log('conversation', conversation);

    if (conversation.members.includes(userId)) {

        members = conversation.members.filter(member => member !== userId);
    }

    await fetch(`/api/update-conversation-members/${convId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            members
        })
    }).then(res => res.json()).then(async data => {
        console.log('data', data);
        const user = document.getElementById(`delete-user-${userId}`)
        user.remove()
        await fetch(`/api/notify/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: 'dufc',
                conversation_id: paperId
            })
        }).then(res => res.json()).then(data => {

            socket.emit("send-notification", {

                receiver: userId,
                user: data.user,
                type: 'dufc',
                conversation: data.conversation
            });

        })
        hide_spinner()
    })

}
async function add_convUser(userId, conversation) {
    conversation = decodeURIComponent(conversation);
    conversation = JSON.parse(conversation);
    show_spinner()
    const convId = conversation._id
    let members

    if (!conversation.members.includes(userId)) {
        members = conversation.members
        members.push(userId)
    }
    await fetch(`/api/update-conversation-members/${convId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            members
        })
    }).then(res => res.json()).then(async data => {

        await fetch(`/api/notify/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: 'dufc',
                conversation_id: paperId
            })
        }).then(res => res.json()).then(data => {

            socket.emit("send-notification", {

                receiver: userId,
                user: data.user,
                type: 'dufc',
                conversation: data.conversation
            });

        })
        hide_spinner()
        display_Message('User has been added successfully')

    })

}
async function edit_paper(id) {
    try {
        const editPaper = document.querySelector('.edit-paper')
        let content = ''
        await fetch(`/api/paper/${id}`, {
            method: 'GET'
        }).then(res => res.json()).then(async data => {
            content = `
        <i id="closeedit" class="fas fa-times"></i>
      <div id="title" class="input-group">

        <input type="text" name="paper_title" id="update_paper_title" required placeholder="Write your project title here " value="${data.paper.title}">
      </div>
      <table border="1" cellpadding="10" cellspacing="0">
         <tbody>
            <tr>
               <td>
                  <div class="input-group" id="update-project-branch">
                     <label for="text">Project branch</label>
                     <div id="update-projectbranch-container" class="education-container">
                        <input type="text" id="update_project_branch" name="country-innerInput" aria-label="Country"
                           autocomplete="off" class="styled-input" value=${data.paper.project_branch}>
                        <div class="icon-container">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                              stroke-linejoin="round" class="feather feather-chevron-down">
                              <polyline points="6 9 12 15 18 9"></polyline>
                           </svg>
                        </div>
                        <ul id="update-projectbranch-list" class="education-dropdown-options">
                           <li class="level1">A-Medicine</li>
                           <li class="unselectable">Internal Medicine</li>
                           <li data-value="Cardiology">Cardiology</li>
                           <li data-value="Pulmonology">Pulmonology</li>
                           <li data-value="Gastroenterology">Gastroenterology</li>
                           <li data-value="Nephrology">Nephrology</li>
                           <li data-value="Endocrinology">Endocrinology</li>
                           <li data-value="Neurology">Neurology</li>
                           <li data-value="Critical Care Medicine">Critical Care Medicine</li>
                           <li class="unselectable">Surgery Medicine</li>
                           <li data-value="General Surgery">General Surgery</li>
                           <li data-value="Cardiothoracic Surgery">Cardiothoracic Surgery</li>
                           <li data-value="Neurosurgery">Neurosurgery</li>
                           <li data-value="Orthopedic Surgery">Orthopedic Surgery</li>
                           <li data-value="Plastic Surgery">Plastic Surgery</li>
                           <li data-value="Urology">Urology</li>
                           <li data-value="Vascular Surgery">Vascular Surgery</li>
                           <li data-value="Pediatric Surgery">Pediatric Surgery</li>
                           <li data-value="Trauma Surgery">Trauma Surgery</li>
                           <li class="unselectable">Gynecology medicine</li>
                           <li data-value="General gynecology">General gynecology</li>
                           <li data-value="Obstetrics">Obstetrics</li>
                           <li data-value="Gynecology oncology">Gynecology oncology</li>
                           <li data-value="Infertility">Infertility</li>
                           <li class="unselectable">Pediatric medicine</li>
                           <li class="unselectable">Pediatric medicine</li>
                           <div class="unselectable">Emergency medicine</div>
                           <div class="unselectable">Dermatology</div>
                           <div class="unselectable">Ophthalmology</div>
                           <div class="unselectable">Otolaryngology (ENT)</div>
                           <div class="unselectable">Psychology</div>
                           <div class="unselectable">Hematology</div>
                           <div class="unselectable">Oncology</div>
                           <div class="unselectable">Rhumatology</div>
                           <div class="unselectable">infectious</div>
                           <div class="unselectable">geriatric medicine</div>
                           <div class="unselectable">Family medicine</div>
                           <div class="unselectable">Radiology</div>
                           <div class="unselectable">Anesthesiology</div>
                        </ul>
                     </div>
                  </div>
               </td>
               <td>
                  <div class="input-group" id="update-typeof-study-container">
                     <label for="institute">Type of study</label>
                     <div id="update-typeofstudy-container" class="institute-container">
                        <input type="text" id="update_type_of_study" name="country-innerInput" aria-label="Country"
                           autocomplete="off" class="styled-input" value="${data.paper.type_of_study}">
                        <div class="icon-container">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                              stroke-linejoin="round" class="feather feather-chevron-down">
                              <polyline points="6 9 12 15 18 9"></polyline>
                           </svg>
                        </div>
                        <ul id="update-typeofstudy-list" class="institute-dropdown-options">

                           <li data-value="Experimental">Experimental </li>
                           <li data-value="Observational">Observational </li>
                           <li data-value="Descriptive">Descriptive </li>
                           <li data-value="Correlational">Correlational </li>
                           <li data-value="Case study">Case study </li>
                        </ul>
                     </div>
                  </div>
               </td>
               <td>
                  <div class="input-group" id="update-weneed-container">
                     <label for="institute">We need</label>
                     <div id="update-weneed-container" class="university-container">
                        <input type="text" id="update_we_need" name="country-innerInput" aria-label="Country"
                           autocomplete="off" class="styled-input" value="${data.paper.we_need}">
                        <div class="icon-container">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                              stroke-linejoin="round" class="feather feather-chevron-down">
                              <polyline points="6 9 12 15 18 9"></polyline>
                           </svg>
                        </div>
                        <ul id="update-weneed-list" class="university-dropdown-options">
                           <li data-value="Writer">Writer</li>
                           <li data-value="Data collector">Data collector</li>
                           <li data-value="Data Analysis">Data Analysis</li>
                           <li data-value="Supervisor">Supervisor</li>
                           <li data-value="Microsoft office Expert">Microsoft office Expert</li>
                           <li data-value="Puplishing expert">Puplishing expert</li>
                        </ul>
                     </div>
                  </div>
               </td>
            </tr>
            <tr>
               <td>
                  <div class="input-group" id="update-tags-container">
                     <label for="name">Tags</label>
                     <div class="input-container">
                        <div id="update-tags-overlay" class="tags-overlay"></div>
                        <input type="text" id="update-tags" name="name" value="" placeholder="Write tags related to the topic...">
                     </div>
                  </div>
               </td>
               <td>
                <div class="input-group" id="update-language-container">
                    <label for="language">Language</label>
                    <div id="update-language-container" class="institute-container">
                    <input type="text" id="update_language_input" name="country-innerInput" aria-label="Country"
                        autocomplete="off" class="styled-input" value="${data.paper.language}" placeholder="language">
                    <div class="icon-container">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" class="feather feather-chevron-down">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <ul id="update-language-list" class="institute-dropdown-options">
                        <li data-value="Arabic">Arabic </li>
                        <li data-value="English">English</li>
                    </ul>
                    </div>
                </div>
               </td>
               <td>
                  <div class="input-group" id="tags-container">
                     <label for="description">Description</label>
                     <div class="input-container">
                        <textarea type="text" id="update-description" maxlength="200" value="${data.paper.description}" name="description" placeholder="Describe your paper briefly ..."></textarea>
                     </div>
                     <p class ="max-limit">Max limit 200 characters</p>
                  </div>
                 
               </td>
               <td><button onclick="update_paper('${data.paper._id}')" id="update_paper">update</button></td>
            </tr>
         </tbody>
      </table>
        `
            editPaper.innerHTML = content
            editPaper.style.display = 'block'

            const update_dropdowns = [
                { inputId: 'update_project_branch', containerid: 'update-projectbranch-container', optionsid: 'update-projectbranch-list' },
                { inputId: 'update_type_of_study', containerid: 'update-typeofstudy-container', optionsid: 'update-typeofstudy-list' },
                { inputId: 'update_we_need', containerid: 'update-weneed-container', optionsid: 'update-weneed-list' },
                { inputId: 'update_language_input', containerid: 'update-language-container', optionsid: 'update-language-list' },
            ]
            const update_overlay = document.getElementById('update-tags-overlay');
            const update_tags = document.getElementById('update-tags');
            update_dropdowns.forEach(function (dropdown) {

                const inputElement = document.getElementById(dropdown.inputId);
                const container = document.getElementById(dropdown.containerid);
                const optionsList = document.getElementById(dropdown.optionsid);
                const options = optionsList.querySelectorAll('li');

                inputElement.addEventListener('click', function () {
                    container.classList.toggle('open');
                });

                options.forEach(function (option) {
                    option.addEventListener('click', function () {
                        inputElement.value = this.textContent;
                        container.classList.remove('open');
                    });
                });

                document.addEventListener('click', function (e) {
                    if (!container.contains(e.target) && e.target !== inputElement) {
                        container.classList.remove('open');
                    }
                });
            });
            let overlayText = ''
            console.log('tags', data.paper.tags, 'paper', data.paper);

            data.paper.tags.forEach(tag => {
                console.log('tag', tag);

                overlayText += `<span class="is-tag"><strong>${tag} </strong></span>`;
                update_tags.value += tag

            })

            update_tags.addEventListener("input", function () {
                const update_tags_value = update_tags.value.trim(); // Get the current value of the input field

                // Reset overlayText on each input event and rebuild it
                overlayText = '';

                const tagRegex = /#[a-zA-Z0-9-_]+(?=\s|$)/g;
                const matches = update_tags_value.match(tagRegex); // Match the tags using regex

                tags.clear(); // Clear the tags set before re-adding them

                // If there are matches, add them to the tags set
                if (matches) {
                    matches.forEach(tag => tags.add(tag)); // Add matched tags to the set
                }

                // Split the input value by spaces and rebuild the overlay
                update_tags_value.split(/(\s+)/).forEach((word) => {
                    if (tags.has(word)) {
                        overlayText += `<span class="is-tag"><strong>${word}</strong></span> `;
                    } else {
                        overlayText += `<span><strong>${word}</strong></span> `;
                    }
                });

                // Update the overlay with the new content, reflecting changes (additions/deletions)
                update_overlay.innerHTML = overlayText;
            });
            update_overlay.innerHTML = overlayText;
        })
        editPaper.querySelector('#closeedit').addEventListener('click', () => {
            editPaper.style.display = 'none'

        })
    } catch (error) {
        console.log(error);

    }
}
async function delete_user_from_paper(user_id) {
    await fetch(`/delete-user-from-paper/${paperId}`, {
        method: 'DELETE',
        body: JSON.stringify({
            user_id
        })
    }).then(res => res.json()).then(data => {
        console.log(data);
    })
}
async function update_paper(id) {
    show_spinner()
    const we_need = document.getElementById('update_we_need').value;
    const type_of_study = document.getElementById('update_type_of_study').value;
    const project_branch = document.getElementById('update_project_branch').value;
    const paper_title = document.getElementById('update_paper_title').value;
    const language = document.getElementById('update_language_input').value;
    const description = document.getElementById('update-description').value;

    tags = Array.from(tags)
    await fetch(`/api/update-paper/${id}`, {

        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            project_branch,
            type_of_study,
            we_need,
            paper_title,
            tags,
            language,
            description
        })
    }).then(res => res.json()).then(data => {
        const paper = document.getElementById(`${id}`)
        paper.querySelector('.paper-title strong').textContent = paper_title
        paper.querySelector('.paper-study strong').textContent = type_of_study
        paper.querySelector('.paper-branch strong').textContent = project_branch
        paper.querySelector('.paper-we-need strong').textContent = we_need
        paper.querySelector('.paper-tags strong').textContent = language
        document.getElementById('description').textContent = description
        hide_spinner()
    })
}



async function delete_paper() {
    const confirm_delete = document.getElementById('confirm-delete');


    await fetch(`/api/delete-paper/${paperId}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok'); // Check for errors
            }
            return response.json();  // Parse JSON response if needed
        })
        .then(data => {
            console.log('Delete successful:', data);
            confirm_delete.style.display = 'none'
            const yourpapers = mainContent.querySelector('.yourpapers-container')
            const paper = document.getElementById(`${paperId}`)
            yourpapers.removeChild(paper)
        })
        .catch(error => {
            console.error('There was an error with the deletion:', error);
        });

}

let cskip = 0;
let climit = 15
let isLoading = false;

function onScroll(id) {
    const message_history = document.getElementById('message-history'); // For cross-browser compatibility

    if (message_history.scrollTop === 0 && !isLoading) {
        loadMessages(id, false);
    }

}

async function loadMessages(id, is_filter = false) {
    try {
        if (isLoading) return;
        isLoading = true;
        const res = await fetch(`/api/messages/${id}?skip=${cskip}&limit=${climit}&mainfield=${userMainfield}`, {
            method: "GET",
        });
        const data = await res.json();

        const messages = data.messages.reverse();
        // console.log('messages', messages);




        cskip += messages.length;

        let message_history = document.querySelector('.message-history');
        let chat_body = document.getElementById('chat-body');
        const previousScrollHeight = message_history.scrollHeight;
        const previousScrollTop = message_history.scrollTop;

        if (!chat_body) {
            chat_body = document.createElement('div');
            chat_body.className = 'chat-body';
            chat_body.id = 'chat-body';
            document.querySelector('.chat-container').appendChild(chat_body); // Append it to a container
        }

        // Ensure message-history exists
        if (!message_history) {
            message_history = document.createElement('div');
            message_history.className = 'message-history';
            message_history.id = 'message-history';
            chat_body.prepend(message_history); // Add it to chat-body
        }

        // Build message content for the new messages
        let content = await buildMessageContent(messages, userId);

        // Prepend new messages to the existing ones
        if (is_filter) {
            message_history.innerHTML = ''
            cskip = 0
        }
        message_history.insertAdjacentHTML('afterbegin', content); // Insert at the top

        message_history.style.display = 'flex';

        // Attach scroll event to load more messages

        const newScrollHeight = message_history.scrollHeight;
        message_history.scrollTop = newScrollHeight - previousScrollHeight + previousScrollTop;

        message_history.onscroll = () => {

            handleScroll()
            onScroll(id);

        };
        // If the number of fetched messages is less than the limit, stop loading
        if (messages.length < climit) {
            console.log("No more messages to load");
            message_history.removeEventListener("scroll", onScroll);
        }
    } catch (error) {
        console.error(error);
    } finally {
        isLoading = false;
    }
}



async function get_conversation(id, type, paper) {
    conv_id = id;
    cskip = 0
    show_spinner();

    try {
        let chat_body = document.querySelector('.chat-body');
        let message_history = document.querySelector('.message-history');
        let chatContainer = document.querySelector('.chat-container');

        if (!chatContainer) {
            chatContainer = document.createElement('div')
            chatContainer.className = 'chat-container'
            chatContainer.id = 'chat-container'
            mainContent.innerHTML = ''
            isMobile() ? mainContent.appendChild(chatContainer) : ""
        }
        if (!chat_body) {

            chat_body = document.createElement('div')
            chat_body.className = 'chat-body'
            chat_body.id = 'chat-body'
            chatContainer.appendChild(chat_body)
        }
        if (!message_history) {
            message_history = document.createElement('div')
            message_history.className = 'message-history'
            message_history.id = 'message-history'
            chatContainer.appendChild(message_history)
        }
        isMobile() && type !== "public" ? message_history.style.height = '78%' : "";

        loadMessages(id, false)

        join_conversation(id);

        if (type === 'public') {

        } else {


            mainContent.classList.add('conversation')
            !isMobile() ? document.getElementById('message-history').classList.add('paperconversation') : "";

            if (!document.getElementById('messaging-container')) {
                chat_body.innerHTML += `
                    <div id="messaging-container" class="messaging-container">
                        <div class="messaging-components">
                            ${fileSend}
                            <textarea id="message-input" placeholder="write a message"></textarea>
                            <i id="send-message" onclick="send_message('private')" class="fa-solid fa-paper-plane"></i>
                        </div>
                    </div>
                `;
            }
            const response = await fetch(`/api/conversation/${id}`);

            if (response.ok) {
                const data = await response.json();
                let chats = document.querySelector('.chat-container');

                let Chatcontent = '';
                if (!chats) {
                    chats = document.createElement('div')
                    chats.className = 'chat-container'
                    mainContent.innerHTML = chats.outerHTML
                }

                message_history.innerHTML = ''

                Chatcontent = `
                    <div class="chatInfo" style="display:flex">
                        <a onclick="close_p_conversation(&quot;${paper}&quot;)">
                            Close
                        </a>
                        <span style="font-weight:700;">
                            ${data.conversation.conv_title}
                        </span>
                        <img onclick="conversationDetails(&quot;${encodeURIComponent(JSON.stringify(paper))}&quot;,&quot;${encodeURIComponent(JSON.stringify(data.conversation))}&quot;)" src="/conversation_images/${data.conversation.conv_pic}" alt="Profile Picture">

                    </div>
                `;
                let chatInfo = document.querySelector('.chatInfo')
                if (chatInfo) {
                    chatInfo.outerHTML = Chatcontent
                }
                else {
                    chats.innerHTML += Chatcontent;
                }
            }
        }

        message_history.onscroll = () => {
            handleScroll()
        };
        inputListeners(`${type}`)
        control_sendButton(`${type}`, null);
        scrollToBottom()


        // message_history.addEventListener('scroll',handleScroll)
    } catch (error) {
        console.error('Error fetching conversation:', error);
    } finally {
        hide_spinner();
    }
}


members.add(userId)
function add_conversation(paper_id) {
    paperId = paper_id
    const add_conversation = document.querySelector(".add-conversation")
    add_conversation.style.display = 'block'
    document.addEventListener('click', () => {
        add_conversation.style.display = 'none'
    })
    const avatarButton = document.getElementById('avatar-label');
    const profile_picture = document.getElementById('conversation_picture')
    const usersDropdown = document.getElementById('users_dropdown')
    const user_name = document.getElementById('user-name')
    let membersNames = new Set()
    fetch('/api/users/1', {
        method: 'GET',
    }).then(res => res.json()).then(data => {
        console.log(data.users);
        console.log(data);

        data.users.forEach(user => {
            const userName = user.name;
            if (userName) {
                const img = document.createElement('img')
                const li = document.createElement('li');
                li.id = 'user-tab'
                img.src = `profile_images/${user.profile_picture}`
                li.appendChild(img);
                const textNode = document.createTextNode(userName);
                li.appendChild(textNode);
                li.dataset.name = userName;
                usersDropdown.appendChild(li);
                members.add(userId)
                li.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (user._id == userId) {
                        return;
                    }
                    if (members.has(user._id)) {
                        li.classList.remove('selected')
                        members.delete(user._id);
                        membersNames.delete(user.name)

                    } else {
                        li.classList.add('selected')

                        members.add(user._id);
                        membersNames.add(user.name)
                    }
                    console.log(members);

                    user_name.value = ''
                    membersNames.forEach(name => {
                        user_name.value += `${name} `
                    })

                })

            } else {
                console.warn('Country name is not available:', country);
            }
        });
        document.getElementById('user-tab').addEventListener('click', (e) => {
            e.preventDefault();

        })
        user_name.addEventListener('input', function (e) {

            const filter = user_name.value.toLowerCase();
            const items = usersDropdown.querySelectorAll('li');
            items.forEach(item => {
                const text = item.dataset.name.toLowerCase();
                if (text.includes(filter)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    })
    user_name.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        usersDropdown.style.display = 'flex'
    });
    document.addEventListener('click', (event) => {
        if (!user_name.contains(event.target) && !usersDropdown.contains(event.target)) {
            usersDropdown.style.display = 'none'
        }
    });
    profile_picture.addEventListener('change', function () {
        const file = profile_picture.files[0];
        if (file) {
            const url = URL.createObjectURL(file);

            avatarButton.style.backgroundImage = `url(${url})`;
            avatarButton.style.backgroundSize = 'cover';
            avatarButton.style.backgroundPosition = 'center';
        } else {
            console.log('no file found');
        }

    });

}


function notify_conversation(id) {
    const chatsContainer = document.getElementById('chats');
    console.log(chatsContainer);

    if (chatsContainer) {

        const notificationElement = document.getElementById(`private-new-${id}`);
        console.log(notificationElement);

        notificationElement.style.display = 'flex';
        notificationElement.style.width = '10px'
        notificationElement.style.height = '10px'
        notificationElement.style.position = 'relative'
        notificationElement.style.left = '22%'
        notificationElement.style.backgroundColor = 'red'
        notificationElement.style.borderRadius = '50%'
        //     width: 10px;
        // height: 10px;
        // position: relative;
        // left: -22%;

    } else {
        console.log('not loaded');
        setTimeout(() => notify_conversation(id), 100);
    }
}
async function conversationPopup(conversation) {
    conversation = decodeURIComponent(conversation)
    conversation = JSON.parse(conversation)
    const convUsers = document.getElementById('conversation-users')
    convUsers.style.display = 'flex'
    const closeButton = document.getElementById('close-button');
    let content = await buildConvUsers(conversation.members, conversation)
    convUsers.innerHTML = content
    convUsers.prepend(closeButton)
    closeButton.addEventListener('click', () => {
        convUsers.style.display = 'none'
    })
}

let cachedUsers = null;
async function conversationAdd(conversation) {
    conversation = decodeURIComponent(conversation)
    conversation = JSON.parse(conversation)
    const convUsers = document.getElementById('conversation-users');
    convUsers.style.display = 'flex';

    const closeButton = document.getElementById('close-button');
    let content = ``
    if (!cachedUsers) {
        try {
            const usersResponse = await fetch('/api/users/1', { method: 'GET' });
            const data = await usersResponse.json();

            cachedUsers = data.users;
            cachedUsers = JSON.stringify(cachedUsers)
            cachedUsers = JSON.parse(cachedUsers)
            // Cache users for future use
            console.log('cachedUsers', cachedUsers);

        } catch (error) {
            console.error("Error fetching users:", error);
            return;
        }
    }

    let profilePicture
    let isExternal;
    let imageSrc;

    cachedUsers.forEach(user => {
        profilePicture = user.profile_picture;
        isExternal;
        imageSrc;
        if (profilePicture) {
            isExternal = profilePicture.startsWith("http");
            imageSrc = isExternal
                ? profilePicture
                : `/profile_images/${profilePicture}`;
        } else {
            imageSrc = '/profile_images/non-picture.jpg'
        }
        content += `
            <div id="delete-user" class="paper-line">
                <div class="paperinfo">
                    <img src="${imageSrc}" alt="Profile Picture">
                    <span class="paper-title"><strong>${user.name}</strong></span>
                    <span class="dash"><strong>-</strong></span>
                    <span class="paper-study"><strong>${user._id}</strong></span>
                </div>
                <button onclick ="add_convUser('${user._id}','${encodeURIComponent(JSON.stringify(conversation))}')" id="deleteUserFromPaper">Add user</button>
            </div>
        `;

    })
    convUsers.innerHTML = content;
    convUsers.prepend(closeButton);

    closeButton.addEventListener('click', () => {
        convUsers.style.display = 'none';
    });
}
async function conversationDetails(paper, conversation) {
    console.log('paper',paper);
    paper = decodeURIComponent(paper)
    paper = decodeURIComponent(paper)

    console.log('paper',paper);

    // paper = JSON.parse(paper)
    conversation = decodeURIComponent(conversation)
    conversation = JSON.parse(conversation)
    let conversationInfo = document.getElementById('conversation-info')
    conversationInfo.style.display = 'flex'
    let content = `
        <i id="close" style="align-self:end; position:relative; top:-2vw;" class="fa-solid fa-xmark"></i>
        <img class="convImage" src="/conversation_images/${conversation.conv_pic}">
        <p>${conversation.conv_title}</p>
        <a onclick="conversationAdd(&quot;${encodeURIComponent(JSON.stringify(conversation))}&quot;)" >
            <i class="fa-solid fa-user-plus"></i>
            <p>Add members</p>
        </a>
        <a onclick ="conversationPopup(&quot;${encodeURIComponent(JSON.stringify(conversation))}&quot;)"> 
            <i class="fa-solid fa-user-minus"></i>
            <p>Remove members</p>
        </a>
        <a onclick="deleteConversation(&quot;${encodeURIComponent(JSON.stringify(paper))}&quot;,'${conversation._id}')" > 
          <i class="fa-solid fa-trash"></i>
            <p>Delete chat</p>
        </a>
    `

    conversationInfo.innerHTML = content
    document.getElementById('close').addEventListener('click', () => {
        conversationInfo.style.display = 'none'
    })
}
async function deleteConversation(paper, id) {

    paper = decodeURIComponent(paper)
    paper = JSON.parse(paper) 
    const response = await fetch(`/api/delete-conversation/${id}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (response.ok) {
        show_conversation(paper)
        document.getElementById('conversation-info').style.display = "none";
    }

}
async function buildConversations(paper) {
    let conversationContent = "";
    console.log('paper',paper);
    
    paper = decodeURIComponent(paper);
    paper = decodeURIComponent(paper);
    paper = paper.replace(/^[^{[]+/, "").replace(/[^}\]]+$/, "").trim();    
    paper = JSON.parse(paper);

    try {
        const response = await fetch(`/api/conversations/${paper._id}`, {
            method: 'GET',
        });
        const data = await response.json();

        if (data.conversations.length === 0) {
            return `<p>No matches</p>`;
        }

        for (const conversation of data.conversations) {
            conversationContent += `
                <div id="conversationItem" onclick="get_conversation('${conversation._id}', 'private', &quot;${encodeURIComponent(JSON.stringify(paper))}&quot;)" class="conversation-item">
                    <img src="/conversation_images/${conversation.conv_pic}" alt="${conversation.conv_title}"/>
                        <h3>${conversation.conv_title}</h3>
                        <div class="new-notification" id="private-new-${conversation._id}">
                        </div>
                </div>
            `;
        }


        conversationContent += `
            <div class="plus-sign"
                onclick="add_conversation('${paper._id}'); event.preventDefault(); event.stopPropagation()"
                style="${String(paper.user_id) === String(userId) ? 'display: block;' : 'display: none;'}">
                <i class="fa-solid fa-plus"></i>
            </div>
        `;
        conversationsLoaded = true;
        applyPendingNotifications();

    } catch (err) {
        console.error('Error fetching conversations:', err);
        return `<p>Error loading conversations.</p>`;
    }

    return conversationContent;
}

function handleScroll() {

    const message_history = document.getElementById('message-history'); // For cross-browser compatibility
    const isAtBottom = message_history.scrollHeight - message_history.scrollTop === message_history.clientHeight;
    const scrollButton = document.querySelector('.scroll-button')

    if (!isAtBottom) {
        scrollButton.style.display = 'flex';
    } else {
        scrollButton.style.display = 'none';
    }
}
async function show_conversation(paper) {

    paperId = paper._id
    let content = ``
    show_spinner()
    const mainContent = document.getElementById('maincontent');
    mainContent.style.display = 'block'

    popups.forEach(popup => {
        popup.style.display = 'none';
    });
    try {

        content = await buildConversations(paper);

        mainContent.innerHTML = `
        <div class="chat-container">
        
            ${!isMobile() ?
                `
                <div class="chats-mobile">
                    <div id="chats-view" class="chats-view">
                        <div id="chats-container" class="chats-plus">
                            <div id="chats" class="chat">

                            </div>
                        </div>

                    </div>
                    
                </div>
                
                `: `
                `
            }

            <div id="chat-body" class="chat-body">
                ${scrollbutton}
                <div id="message-history" class="message-history"></div>
            </div>
           
            </div>
        </div>
        `;


        document.getElementById('maincontent').classList.add('conversation')
        document.querySelector('.scroll-button').top = '64%'
        if (!isMobile()) {
            const chatsView = document.getElementById('chats')

            chatsView.innerHTML += content;
        }

        if (isMobile()) {

            document.querySelector('.mainContent').innerHTML = `
            
                <div class="chats-mobile">
                    <div id="chats-view" class="chats-view">
                        <div id="chats-container" class="chats-plus">
                            <div id="chats" class="chat">

                            </div>
                        </div>

                    </div>
                    <a onclick="addExitListeners();" id="exit_conversations">
                        <i class="fa-solid fa-arrow-left-long" style="margin-left: 8px;"></i>
                        <p style="margin: 0;">Exit conversations</p>
                    </a>
                </div>
            `

            const chatsView = document.getElementById('chats')
            chatsView.innerHTML += content;
        } else {
            toggleSidebar();
        }

    } catch (err) {
        console.error('Error fetching paper details:', err);
    } finally {
        hide_spinner()
    }

    // Hide all popups
    popups.forEach(popup => {
        popup.style.display = 'none';
    });
    control_sendButton('private', null)
}
async function load_f_messages(conversation_Id, user_id) {
    try {
        cskip = 0
        const messagesResponse = await fetch(`/api/friend-messages/${conversation_Id}?skip=${cskip}&limit=${climit}`, { method: 'GET' });
        if (!messagesResponse.ok) throw new Error("Failed to fetch messages");

        const messagesData = await messagesResponse.json();
        let chat_body = document.querySelector('.chat-body');
        let message_history = document.querySelector('.message-history');
        let chatContainer = document.querySelector('.chat-container');

        if (!chatContainer) {
            chatContainer = document.createElement('div')
            chatContainer.className = 'chat-container'
            chatContainer.id = 'chat-container'
            mainContent.innerHTML = ''
            isMobile() ? mainContent.appendChild(chatContainer) : ""
        }
        if (!chat_body) {

            chat_body = document.createElement('div')
            chat_body.className = 'chat-body'
            chat_body.id = 'chat-body'
            chatContainer.appendChild(chat_body)
        }

        if (!message_history) {
            message_history = document.createElement('div')
            message_history.className = 'message-history'
            message_history.id = 'message-history'

            chatContainer.appendChild(message_history)
        }
        message_history.style.top = "100%";
        message_history.style.height = '100%'
        let message_content = "";
        if (messagesData.messages.length === 0) {
            message_history.innerHTML = `<p>No Messages</p>`;
        } else {
            // Build and render message content
            const messages = messagesData.messages.reverse();
            message_content = await buildMessageContent(messages, user_id);
            message_history.insertAdjacentHTML('afterbegin', message_content);
            document.querySelector('.mainContent').classList.add('conversation')

            const message = document.querySelector('.message-history .message-info:last-child .message.sent');
            const messagereceived = document.querySelector('.message-history .message-info:last-child .message.received');
            if (message) {
                message.classList.add('singleconversation');
            }

            if (messagereceived) {
                messagereceived.classList.add('singleconversation');
            }
            scrollToBottom()
        }
    } catch (err) {
        console.error("Error loading messages:", err);
    }
}
async function updateUserInfo(user, type) {
    user = JSON.parse(user)

    let content = await conversation_layout(user, type)
    mainContent.innerHTML = content;
    !isMobile() ? document.getElementById('message-history').classList.add('singleconversation') : "";

    control_sendButton('friend', user._id)
}
async function conversation_layout(user, paper) {
    try {
        const translations = await loadTranslation()
        let content = '';
        const rec_name = user.name;
        const rec_img = user.profile_picture;
        const chats = document.getElementById('friendChats')
        content += `
            <div class="chat-container">
                    <div class="chatInfo" style="display:flex">
                        <a onclick="close_conversation()">
                            Close
                        </a>
                        <span style="font-weight:700;">
                             ${rec_name}
                        </span>
                        <img onclick="conversationDetails(&quot;${encodeURIComponent(JSON.stringify(paper))}&quot;)" src="/conversation_images/${rec_img}" alt="Profile Picture">
                    </div>
                    
                    ${!isMobile() ? `
                        <div id="chats-view" style="top:-10%" class="chats-view">
                            <div class="search-container">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <input id="friend-search-input" class="search-input" type="text" placeholder=" ${translations.friends.searchFriends}">
                            </div>
                            ${chats.outerHTML}
                        </div>
                        `: ``}
                    <div id="chat-body" class="chat-body">
                    
                        <div id="message-history" class="message-history"></div>
                            <div id="messaging-container" class="messaging-container">
                                <div class="messaging-components">
                                    ${fileSend}
                                    <textarea id="message-input" placeholder="write a message"></textarea>
                                    <i id="send-message" onclick="send_to_friend('${user._id}')" class="fa-solid fa-paper-plane"></i>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        `;


        return content;
    } catch (error) {
        console.error("Error in conversation_layout:", error);
        return '';
    }
}
async function friend_messages(user_id) {
    try {
        const response = await fetch(`/api/get-friendconversation/${user_id}`, { method: 'GET' });
        if (!response.ok) throw new Error("Failed to fetch friend conversation");

        const data = await response.json();
        let conversation_Id;
        skip = 0; // Reset batch loading
        let friendChats = `
             <div id="chats-view" style="top:-10%" class="chats-view">
                <div class="search-container">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input id="friend-search-input" class="search-input" type="text" placeholder=" ${translations.friends.searchFriends}">
                </div>
                
            </div>
            `
        if (!data.f_conversation) {
            content = await conversation_layout(user_id);
            mainContent.innerHTML = content;

            document.getElementById('chats-view').innerHTML += friendChats
            control_sendButton('private');
            inputListeners('private');
        } else {
            // Existing conversation
            conversation_Id = data.f_conversation._id;
            document.getElementById('chats-view').innerHTML += friendChats

            await load_f_messages(conversation_Id, user_id); // Load messages
            // await load_f_conversations(); 

            control_sendButton('friend', user_id);

            document.querySelector('.mainContent').classList.add('conversation');

        }
    } catch (err) {
        console.error("Error in friend_messages:", err);
    }
}

async function show_Single_conversation() {
    try {
        show_spinner(); // Ensure spinner is shown at the start
        const translations = await loadTranslation()
        conversation_type = 'friend';
        const mainContent = document.querySelector('.mainContent');
        isreply = false;
        replyTo = null;
        mainContent.style.display = 'block'
        // mainContent.className +=' conversation'
        mainContent.classList.add('conversation')

        let chats = `
        ${!isMobile() ? `
            <div id="chats-view" class="chats-view">
            <div class="search-container">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input id="friend-search-input" class="search-input" type="text" placeholder=" ${translations.friends.searchFriends} ">
            </div>
                <div id="friendChats" class="chat">

                </div>
            </div>
            `: `
            `}
        `
        let chatContent = `
        <div class="chat-container">
               ${chats} 
        </div>
        `

        if (isMobile()) {

            document.querySelector('.mainContent').innerHTML = `
            
            <div class="chats-mobile">
                
                <div id="chats-view" class="chats-view">
                    <div class="search-container">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input id="friend-search-input" class="search-input" type="text" placeholder=" ${translations.friends.searchFriends} ">
                    </div>
                    <div id="chats-container" class="chats-plus">
                        <div id="friendChats" class="chat">
                          
                        </div>
                    </div>
                </div>
                <a onclick="addExitListeners()"  id="exit_conversations">
                    <i class="fa-solid fa-arrow-left-long" style="margin-left: 8px;"></i>
                    <p style="margin: 0;">Exit conversations</p>
                </a>
            </div>
        `
            addExitListeners()
        }
        else {
            mainContent.innerHTML = chatContent

        }


        popups.forEach(popup => {
            popup.style.display = 'none';
        });

        toggleSidebar();
        searchFunctionality()
    } catch (error) {
        console.error('Error fetching conversation:', error);
    } finally {
        hide_spinner(); // Hide spinner after everything is done
    }
}
// {}

async function searchFunctionality() {
    let chatsView = document.querySelector('.chats-view')

    let chatResults = await load_f_conversations()
    let friend_search_input = chatsView.querySelector('#friend-search-input');
    const friendsChats = chatsView.querySelector('.chat')
    if (!friend_search_input) {
        friend_search_input = document.createElement('input')
        friend_search_input.id = 'friend-search-input'
        friend_search_input.className = 'search-input'
    }
    friend_search_input.addEventListener('input', async function (e) {
        e.preventDefault();

        if (this.value === '') {
            console.log('empty');

            friendsChats.innerHTML = chatResults;
        }
        else {
            try {
                const response = await fetch('/api/get-user', {
                    headers: { 'Content-Type': 'application/json' },
                    method: "POST",
                    body: JSON.stringify({
                        query: this.value
                    })
                });

                const data = await response.json();
                console.log('data', data);

                let content = "";

                if (data.users.length == 0) {
                    console.log('empty');

                    content.innerHTML = `<p> No matches</p>`;
                } else {

                    data.users.forEach(u => {
                        console.log('user', u);

                        content += `
                            <div id="conversationItem" 
                                onclick="updateUserInfo('${JSON.stringify(u).replace(/"/g, '&quot;')}'); 
                                        ${u.f_conversation && u.f_conversation._id ? `load_f_messages('${u.f_conversation._id}', '${u._id}')` : ''}
                                        ${isMobile() ? `toggleSidebar()` : ``}" 
                                class="conversation-item">
                                <img src="/profile_images/${u.profile_picture}" alt="${u.name}"/>
                                <h3>${u.name}</h3>
                                <div class="new-notification" id="private-new-${u._id}">
                                </div>
                            </div>`;
                    });
                }

                friendsChats.innerHTML = content;
                const translations = await loadTranslation()


            } catch (err) {
                console.log('error', err);


            } finally {

            }
        }
    });
}
async function send_to_friend(user_id) {

    const formData = new FormData();
    const messageInput = document.getElementById('message-input');
    const text = messageInput ? messageInput.value : '';
    formData.append('text', text);

    formData.append('isreply', isreply ? 'true' : 'false');

    const fileInput = document.getElementById('image-input');
    const imageInput = document.getElementById('file-input');

    if (fileInput && fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    } else if (imageInput) {
        formData.append('file', imageInput.files[0]);
    }

    await fetch(`/api/send-tofriend/${user_id}`, {
        method: 'POST',
        body: formData  // Send FormData instead of JSON
    }).then(response => response.json()).then(async data => {

        const userid = data.friendConversation.receiver;

        if (messages) {
            messages.push(data.Message);
        }
        join_conversation(data.friendConversation._id);
        socket.emit("send-to-friend", { message: { m: data.Message, id: data.friendConversation._id } });

        await fetch(`/api/notify/${user_id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: "message"
            })
        }).then(res => res.json()).then(data => {
            socket.emit("send-notification", { message: data.message, receiver: userid, type: isreply ? 'reply' : '', user: data.user, conversation: data.friendConversation });
        });
        reset_reply();
        scrollToBottom()
    }).catch(error => {
        console.error('Error sending message:', error);
    });
}

function join_conversation(conversation_id) {
    socket.emit('join-room', conversation_id)
}
async function get_user(query) {
    const response = await fetch('/api/get-user', {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            query
        })
    });

    const data = await response.json();  // Await the parsing of the JSON
    return data;  // Return the parsed data
}
function openImage(url) {
    const openedImage = `
    <div id="openedImage" class="openedImage">
        <img id="openedimage" src="/conversation_files/${url} " alt="">
    </div>`
    document.body.insertAdjacentHTML('beforeend', openedImage);
    setTimeout(() => {
        document.addEventListener('click', function (event) {
            console.log('in event listener');

            const openedImage = document.getElementById('openedImage');

            console.log('log id ', event.target.id);

            if (openedImage && event.target.id == 'openedImage') {
                console.log('Removing opened image.');
                openedImage.remove();
            }
        });
    }, 20);
}

async function buildMessageContent(messages) {
    let message_content = '';

    for (const message of messages) {


        // Get sender info
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        const formattedDate = new Date(message.createdAt).toLocaleString('en-US', dateOptions);
        let img = '';
        let fileExtension;
        let replyContent = '';
        let fileUrl
        if (message.fileUrl) {
            fileUrl = message.fileUrl;
            fileExtension = fileUrl.split('.').pop().toLowerCase();  // Get the file extension

            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {

                img = `
                    <img onclick="openImage('${fileUrl}')" id="sent_image" src='/conversation_files/${fileUrl}' alt="sent image" />
                `;
            }
            else {

                img = `
                    <a id="sent_file" href='/conversation_files/${fileUrl}' target="_blank" download>
                    <div class="file" >
                            <i class="fa-solid fa-file"></i>
                        </div>
                        <p>${fileUrl}</p>
                    </a>
                `;
            }


        }
        // console.log('message',message);

        if (message.isreply && message.replyTo) {
            const originalMessage = messages.find(m => m._id.toString() === message.replyTo.toString());
            // console.log('reply message',originalMessage);

            if (originalMessage) {
                replyContent = `
                    <div class="reply-info">
                        <span class="message-text">${originalMessage.text}</span>
                    </div>
                `;
            }
        }

        let isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)
        let isfile = [
            'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
            'svg', 'tiff', 'ico', 'heic',
            'pdf', 'doc', 'docx', 'xls', 'xlsx',
            'txt', 'csv', 'ppt', 'pptx', 'rtf',
            'mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv',
            'mp3', 'wav', 'aac', 'ogg',
            'zip', 'rar', '7z', 'tar', 'gz'
        ].includes(fileExtension);
        let image = message.senderDetails.profile_picture
        // console.log('image', image, 'message', message);

        let path
        if (image) {
            if (image.startsWith('http')) {
                path = `${image}`
            } else {
                path = `/profile_images/${image}`
            }
        } else {
            path = `/profile_images/non-picture.jpg`
        }

        let messageInfo = `
        <div id="message-info-${message._id}"
             class="${isfile ? "message-info isfile" : "message-info"}"
             style="${isImage ? "margin-bottom:1%;margin-top: 2%; margin-right:2%" : "margin: 10px"}"
             ondblclick="reply(&quot;${encodeURIComponent(JSON.stringify(message))}&quot;)"

             >
            
            ${message.senderDetails._id === userId ? `
                <div style="${isImage ? "padding:0px;" : "padding:4px 15px;"}"
                     class="message sent">

                    ${img}
                    ${isImage ? `
                        <span class="imageTime">${formattedDate}</span>
                        <span class="${message.isreply ? "message-text reply" : "message-text"}">
                            ${message.text || ""}
                        </span>` : `
                        <span class="${message.isreply ? "message-text reply" : "message-text"}">
                            ${message.text || ""}
                        </span>
                    `}
                    ${replyContent}
                    ${!isImage?`<span class="time">${formattedDate}</span>`:''}

                </div>
                <img onclick="event.stopPropagation(); showProfile('${JSON.stringify(message.senderDetails).replace(/"/g, '&quot;')}')"
                     src="${path}"
                     class="sender-image" />
            ` : `
                <img onclick="event.stopPropagation(); showProfile('${JSON.stringify(message.senderDetails).replace(/"/g, '&quot;')}')"
                     src="${path}"
                     class="sender-image" />

                <div style="${isImage ? "padding:0px;" : "padding:4px 15px;"}"
                     class="message received">

                    ${img}
                    ${isImage ? `
                        <span class="imageTime">${formattedDate}</span>
                        <span class="${message.isreply ? "message-text reply" : "message-text"}">
                            ${message.text || ""}
                        </span>` : `
                        <span class="${message.isreply ? "message-text reply" : "message-text"}">
                            ${message.text || ""}
                        </span>

                    `}
                    ${replyContent}
                    <span class="time">${formattedDate}</span>



                </div>
            `}
        </div>
    `;


        message_content += messageInfo;

    }

    return message_content;
}

function show_options() {
    event.preventDefault()
    document.getElementById('options-popup').style.display = 'block';
    document.addEventListener('click', () => {
        document.getElementById('options-popup').style.display = 'none';
    })
}
// Global event handler functions
const imageInputHandler = (event, value) => {
    initializeFile(value);
    processImage(event);
};

const fileInputHandler = (event, value) => {
    initializeFile(value);
    processFile(event);
};

function inputListeners(value) {
    console.log('input listener triggered');

    const imageInput = document.getElementById('image-input');
    const fileInput = document.getElementById('file-input');

    // Check if the elements exist
    if (!imageInput || !fileInput) {
        console.error('Error: Inputs not found!');
        return;
    }

    // Remove previous event listeners and log the action
    console.log("Removing previous event listeners...");
    imageInput.removeEventListener('change', (event) => { imageInputHandler(event, value) });
    fileInput.removeEventListener('change', (event) => { fileInputHandler(event, value) });

    // Add new event listeners
    console.log("Adding new event listeners...");
    imageInput.addEventListener('change', (event) => { imageInputHandler(event, value) });
    fileInput.addEventListener('change', (event) => { fileInputHandler(event, value) });

}

function initializeFile(value) {
    const fileFrame = document.createElement('div');
    fileFrame.className = 'file-frame';
    fileFrame.innerHTML = `
        <p></p>
        <div class="photo-frame"></div>
        <div class="frame-buttons">
            <a id="cancel-frame">Cancel</a>
            <textarea id="captions" placeholder="Add caption"></textarea>
            <button onclick="send_message('${value}')">Send</button>
        </div>
    `;
    document.body.append(fileFrame);
    fileFrame.querySelector('#cancel-frame').addEventListener('click', function () {
        const photoFrame = fileFrame.querySelector('.photo-frame');
        const imageInput = document.getElementById('image-input');
        const fileInput = document.getElementById('file-input');
        photoFrame.innerHTML = '';
        imageInput.value = '';
        fileInput.value = '';
        fileFrame.remove();
    });

    document.addEventListener('click', function (event) {
        const popup = document.getElementById('options-popup');
        const clip = document.getElementById('clip');

        if (popup && popup.style.display === 'block') {
            if (!popup.contains(event.target) && event.target !== clip) {
                popup.style.display = 'none';
            }
        }
    });
}
function processFile(event) {
    event.preventDefault();

    const files = event.target.files;
    console.log(files);

    const fileFrame = document.querySelector('.file-frame')
    document.body.append(fileFrame);
    const p = fileFrame.querySelector('p');
    p.textContent = 'Send a file';
    const frame = document.createElement('p');
    frame.textContent = files[0].name;
    frame.id = 'file-frame';
    const photoFrame = fileFrame.querySelector('.photo-frame');
    photoFrame.append(frame);
    document.getElementById('options-popup').style.display = 'none';

}

function processImage(event) {
    event.preventDefault();
    const files = event.target.files;
    const frame = document.createElement('img');
    const fileFrame = document.querySelector('.file-frame')

    const p = fileFrame.querySelector('p');
    p.textContent = 'Send a picture';
    frame.src = URL.createObjectURL(files[0]);
    frame.id = 'img-frame';
    const photoFrame = fileFrame.querySelector('.photo-frame');
    photoFrame.append(frame);
    document.getElementById('options-popup').style.display = 'none';
    // document.body.append(fileFrame);
}

async function loadTranslation() {
    const response = await fetch(`/translations/${currentlang}`, {
        method: "GET"
    });
    const translations = await response.json();
    const topBar = document.getElementById('dashboard-setting')
    const homeElement = document.getElementById('home');
    if (homeElement) {
        const headerSpan = homeElement.querySelector('.header span');
        if (headerSpan) {
            headerSpan.textContent = translations?.topBar?.home || 'Default Home';
        }
    }

    const newPaperElement = document.getElementById('new-paper');
    if (newPaperElement) {
        newPaperElement.textContent = translations?.newPaper?.label || 'Default New Paper';
    }

    const joinPaperElement = document.getElementById('join-paper');
    if (joinPaperElement) {
        joinPaperElement.textContent = translations?.joinPaper?.label || 'Default Join Paper';
    }

    const notificationsElement = document.getElementById('notifications');
    if (notificationsElement) {
        notificationsElement.textContent = translations?.sidebar?.notifications || 'Default Notifications';
    }

    const chatTabElement = document.getElementById('chat-tab');
    if (chatTabElement) {
        chatTabElement.textContent = translations?.sidebar?.publicChat || 'Default Chat';
    }

    const friendsTabElement = document.getElementById('friends-tab');
    if (friendsTabElement) {
        friendsTabElement.textContent = translations?.friends?.label || 'Default Friends';
    }


    const postButtons = document.querySelectorAll('.css-1k7990c-StyledButton')
    postButtons.forEach(button => {
        button.textContent = translations.sidebar.goTopost
    })
    document.getElementById('sign-out').textContent = translations.topBar.signOut
    document.getElementById('home-setting').textContent = translations.topBar.home

    const startPaperButton = document.getElementById('start_paper_button');
    if (startPaperButton) {
        startPaperButton.textContent = translations?.newPaper?.dropdowns?.startPaper || 'Start Paper';
    }

    const yourPapersButton = document.getElementById('your-papers-button');
    if (yourPapersButton) {
        yourPapersButton.textContent = translations?.newPaper?.dropdowns?.yourPapers || 'Your Papers';
    }

    const yourPapersLabel = document.querySelector('.yourpapers-label');
    if (yourPapersLabel) {
        yourPapersLabel.textContent = translations?.newPaper?.dropdowns?.yourPapers || 'Your Papers';
    }

    const startPapersLabel = document.querySelector('.startpapers-label');
    if (startPapersLabel) {
        startPapersLabel.textContent = translations?.newPaper?.label || 'Start Papers';
    }

    const searchPapersLabel = document.querySelector('.searchpapers-label');
    if (searchPapersLabel) {
        searchPapersLabel.textContent = translations?.joinPaper?.searchpaper || 'Search Papers';
    }

    const notificationsLabel = document.querySelector('.notifications-label');
    if (notificationsLabel) {
        notificationsLabel.textContent = translations?.sidebar?.notifications || 'Notifications';
    }

    const searchPapersButton = document.getElementById('searchpapers-button');
    if (searchPapersButton) {
        searchPapersButton.textContent = translations?.sidebar?.search || 'Search';
    }

    const joinedPapersButton = document.getElementById('joined-papers-button');
    if (joinedPapersButton) {
        joinedPapersButton.textContent = translations?.joinPaper?.dropdowns?.joinedPapers || 'Joined Papers';
    }

    const joinedLabel = document.querySelector('.joined-label');
    if (joinedLabel) {
        joinedLabel.textContent = translations?.joinPaper?.dropdowns?.joinedPapers || 'Joined Papers';
    }

    // Uncomment if needed, ensuring elements exist before modifying them
    // const searchFriendsButton = document.getElementById('search-friends-button');
    // if (searchFriendsButton) {
    //     searchFriendsButton.textContent = translations?.sidebar?.search || 'Search Friends';
    // }

    // const yourFriendsButton = document.getElementById('your-friends-button');
    // if (yourFriendsButton) {
    //     yourFriendsButton.textContent = translations?.friends?.dropdowns?.yourfriends || 'Your Friends';
    // }

    const homeSetting = document.getElementById('home-setting');
    if (homeSetting) {
        homeSetting.textContent = translations?.topBar?.home || 'Home';
    }


    document.getElementById('home-setting').textContent = translations.topBar.home
    if (topBar) {
        topBar.textContent = translations.topBar.dashboard
    }

    const searchFriendsLabel = document.querySelector('.searchfriends-label');
    if (searchFriendsLabel) {
        searchFriendsLabel.textContent = translations?.friends?.searchfriends || 'Search Friends';
    }

    const yourFriendsLabel = document.querySelector('.yourfriends-label');
    if (yourFriendsLabel) {
        yourFriendsLabel.textContent = translations?.friends?.dropdowns?.yourfriends || 'Your Friends';
    }

    const languageSetting = document.getElementById('language-setting');
    if (languageSetting) {
        languageSetting.textContent = translations?.topBar?.language || 'Language';
    }

    const editProfileSetting = document.getElementById('editProfile-setting');
    if (editProfileSetting) {
        editProfileSetting.textContent = translations?.topBar?.editProfile || 'Edit Profile';
    }

    const signOut = document.getElementById('sign-out');
    if (signOut) {
        signOut.textContent = translations?.topBar?.signOut || 'Sign Out';
    }

    const ar = document.getElementById('ar');
    if (ar) {
        ar.textContent = translations?.topBar?.ar || 'Arabic';
    }

    const en = document.getElementById('en');
    if (en) {
        en.textContent = translations?.topBar?.en || 'English';
    }

    return translations

}
function setLang(lang) {


    sessionStorage.setItem('lang', lang)

    currentlang = lang
    location.reload()

}
async function applyTranslations() {
    const translations = await loadTranslation()
    document.getElementById('home').querySelector('.header span').textContent = translations.topBar.home
    document.getElementById('new-paper').textContent = translations.newPaper.label;
    document.getElementById('join-paper').textContent = translations.joinPaper.label;
    document.getElementById('notifications').textContent = translations.sidebar.notifications;
    document.getElementById('chat-tab').textContent = translations.sidebar.publicChat;
    document.getElementById('friends-tab').textContent = translations.friends.label;
    const postButtons = document.querySelectorAll('.css-1k7990c-StyledButton')
    postButtons.forEach(button => {
        button.textContent = translations.sidebar.goTopost
    })
    document.getElementById('sign-out').textContent = translations.topBar.signOut
    document.getElementById('home-setting').textContent = translations.topBar.home


    document.getElementById('start_paper_button').textContent = translations.newPaper.dropdowns.startPaper;
    document.getElementById('your-papers-button').textContent = translations.newPaper.dropdowns.yourPapers;

    document.getElementById('searchpapers-button').textContent = translations.sidebar.search;
    document.getElementById('joined-papers-button').textContent = translations.joinPaper.dropdowns.joinedPapers;


    // create paper popup
    document.getElementById('paper_title').placeholder = translations.startPaper.placeholder;
    document.getElementById('project_branch').placeholder = translations.startPaper.projectBranch;
    document.getElementById('type_of_study').placeholder = translations.startPaper.type_of_study;
    document.getElementById('we_need').placeholder = translations.startPaper.we_need;
    document.getElementById('start-language-input').placeholder = translations.startPaper.language;
    document.getElementById('tags').placeholder = translations.startPaper.tags.placeholder;
    document.getElementById('start_create').textContent = translations.startPaper.publish;

    document.getElementById('project-branch').querySelector('label').textContent = translations.startPaper.projectBranch;
    document.getElementById('we-need-container').querySelector('label').textContent = translations.startPaper.we_need;
    document.getElementById('lang-container').querySelector('label').textContent = translations.startPaper.language;
    document.getElementById('study-container').querySelector('label').textContent = translations.startPaper.type_of_study;
    document.getElementById('tags-container').querySelector('label').textContent = translations.startPaper.tags.label;

    //Your papers

    // Join paper search field
    document.getElementById('advanced').textContent = translations.joinPaper.advancedSearch.label;
    document.getElementById('paper-title').placeholder = translations.joinPaper.advancedSearch.searchPapers;

    document.getElementById('ID').placeholder = translations.joinPaper.advancedSearch.paperId;
    document.getElementById('paper_project_branch').placeholder = translations.joinPaper.advancedSearch.paperBranch;
    document.getElementById('language-input').placeholder = translations.joinPaper.advancedSearch.paperLang;
    document.getElementById('paper_we_need').placeholder = translations.joinPaper.advancedSearch.we_need;
    document.getElementById('search').textContent = translations.joinPaper.advancedSearch.search;


    // friends
    document.getElementById('friend-search-input').placeholder = translations.friends.searchFriends;
    document.getElementById('friend-search').textContent = translations.joinPaper.advancedSearch.search;
    // const friendButtons = document.querySelectorAll('.friend-message')
    // friendButtons.forEach(button => {
    //     button.textContent = translations.friends.sendFriendMessage;
    // })
}

// function control_sendButton(value,event) {
//     document.removeEventListener('keydown',controlEnter);
//     document.addEventListener('keydown', controlEnter);
// }
function createControlEnter(value, id = null) {

    return function (event) {
        controlEnter(value, event, id);
    };
}
let currentHandler
function control_sendButton(value, id = null) {

    console.log('value', value);

    // Remove the previous handler, if any
    if (currentHandler) {
        document.removeEventListener('keydown', currentHandler);
    }

    currentHandler = createControlEnter(value, id);

    document.addEventListener('keydown', currentHandler);
}
async function controlEnter(value, event, id = null) {

    const text = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message');
    text.removeEventListener('input', function () {
        if (text.value.trim() !== "") {
            sendButton.classList.add('active');
            sendButton.style.pointerEvents = 'auto'; // Enable clicking
        } else {
            sendButton.classList.remove('active');
            sendButton.style.pointerEvents = 'none'; // Disable clicking
        }


        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';

    });
    text.addEventListener('input', function () {
        if (text.value.trim() !== "") {
            sendButton.classList.add('active');
            sendButton.style.pointerEvents = 'auto'; // Enable clicking
        } else {
            sendButton.classList.remove('active');
            sendButton.style.pointerEvents = 'none'; // Disable clicking
            text.style.height = '4vw' // Disable clicking
        }
        const maxHeight = 300;
        if (this.scrollHeight <= maxHeight) {
            this.style.height = this.scrollHeight + 'px';
        } else {
            this.style.height = maxHeight + 'px';
            this.style.overflowY = 'auto'; // Add a scrollbar if content exceeds maxHeight
        }

    });

    if (event.key === 'Enter') {

        if (event.shiftKey) {
            event.preventDefault()
            text.value += "\n"; // Insert a new line
            text.style.height = text.scrollHeight + "px";
        } else {
            if (text.value.trim() !== "") { // Ensure there is text to send
                value === 'friend' ? await send_to_friend(id) : await send_message(value);
                // Clear the input field
                sendButton.classList.remove('active'); // Reset button state
                sendButton.style.pointerEvents = 'none';
                text.style.height = '4vw' // Disable clicking
                text.value = ''
            }
        }
    }
}

async function load_f_conversations() {

    const response = await fetch('/api/get-friendconversations');
    let Chatcontent = '';
    if (response.ok) {
        const data = await response.json();
        let chats = document.getElementById('friendChats');
        if (!chats) {
            chats = document.createElement('div')
            chats.id = 'friendChats'
            chats.className = 'chat'
            chats.style.top = '-9%'
            mainContent.appendChild(chats)
            if (document.getElementById('chats-view')) {
                document.getElementById('sidebar').append(chats)
            }
        }
        if (data.f_conversations.length === 0) {
            Chatcontent = '<p>No conversations yet</p>'
        }
        else {
            for (const conversation of data.f_conversations) {

                let user = conversation.receiverInfo[0] || conversation.senderInfo[0];

                if (user._id === userId) {
                    user = conversation.senderInfo[0]
                }
                Chatcontent += `
                    <div id="conversationItem" onclick="load_f_messages('${conversation._id}','${user._id}'); updateUserInfo('${JSON.stringify(user).replace(/"/g, '&quot;')}');" class="conversation-item">
                        <img src="/profile_images/${user.profile_picture}" alt="${conversation.conv_title}"/>
                        <h3>${user.name}</h3>
                        
                    </div>
                    `;
            }
            if (isMobile()) {
                chats = document.getElementById('friendChats')
                console.log('chats', chats);


            } else {

            }
            chats.innerHTML = Chatcontent
        }


    } else {
        document.getElementById('friendChats').innerHTML = `Error loading your conversations`;
    }
    return Chatcontent
}

async function load_conversation(id) {
    const response = await fetch(`/api/conversation/${id}`);

    if (response.ok) {

    } else {
        chats.innerHTML = `Error loading your conversations`;
    }
}

async function close_conversation() {

    const translations = await loadTranslation()
    document.querySelector('.mainContent').innerHTML = `
            
    <div class="chats-mobile">
        
        <div id="chats-view" class="chats-view">
            <div class="search-container">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input id="friend-search-input" class="search-input" type="text" placeholder=" ${translations.friends.searchFriends} ">
            </div>
            <div id="chats-container" class="chats-plus">
                <div id="friendChats" class="chat">
                  
                </div>
            </div>
        </div>
        <a onclick="addExitListeners()" id="exit_conversations">
            <i class="fa-solid fa-arrow-left-long" style="margin-left: 8px;"></i>
            <p style="margin: 0;">Exit conversations</p>
        </a>
    </div>
`
    await load_f_conversations()

}
async function close_p_conversation(paper) {

    if (isMobile()) {
        document.querySelector('.mainContent').innerHTML = `
            
    <div class="chats-mobile">
        <div id="chats-view" class="chats-view">
            <div id="chats-container" class="chats-plus">
                <div id="chats" class="chat">

                </div>
            </div>

        </div>
         <a onclick="addExitListeners()" id="exit_conversations">
            <i class="fa-solid fa-arrow-left-long" style="margin-left: 8px;"></i>
            <p style="margin: 0;">Exit conversations</p>
        </a>
    </div>
`
        await show_conversation(paper)

    } else {
        const message_history = document.getElementById('message-history')
        const messaging_content = document.getElementById('messaging-container')
        const chatInfo = document.querySelector('.chatInfo')
        message_history.remove()
        messaging_content.remove()
        chatInfo.remove()
    }

}
function toggleSidebar() {
    const circleButton = document.querySelector('.circle-button');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('maincontent');
    const label = document.getElementById('joined')

    if (mainContent.classList.contains('conversation')) {
        mainContent.classList.remove('conversation')
    }
    // Check if the sidebar is closed and toggle accordingly
    if (sidebar.classList.contains('closed')) {
        // Sidebar is closed, open it
        sidebar.classList.remove('closed');
        sidebar.classList.add('open');
        mainContent.classList.add('shifted');
        label.classList.add('shifted');
        // Shift main content to make space for the sidebar
        circleButton.classList.remove('collapsed');
        circleButton.classList.add('toggled'); // Rotate the button
    } else {
        // Sidebar is open, close it
        sidebar.classList.remove('open');
        sidebar.classList.add('closed');
        mainContent.classList.remove('shifted');
        label.classList.remove('shifted'); // Revert main content position
        circleButton.classList.remove('toggled');
        circleButton.classList.add('collapsed');  // Reset button rotation
    }
}

function join_paper(paper_id) {
    try {

        fetch(`/api/create-request/${paper_id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json()).
            then(async data => {
                console.log('receiver data', data);
                const receiver = data.request.receiver
                const paper = data.paper

                const joinButton = document.getElementById(`join-paper-${paper_id}`)

                joinButton.textContent = 'Request sent'
                joinButton.style.backgroundColor = 'rgb(187 187 187)'
                joinButton.style.pointerEvents = 'none'
                await fetch(`/api/notify/${receiver}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        type: 'join-request',
                        paper_id: paper_id
                    })
                }).then(res => res.json())
                    .then(data => {

                        if (!data.message || !data.user) {
                            console.error('Invalid data structure:', data);
                            return;
                        }

                        socket.emit("send-notification", {
                            message: data.message,
                            receiver: receiver,
                            user: data.user,
                            type: 'join-request',
                            notification: data.Notification,
                            conversation: data.conversation,
                            paper: paper
                        }, () => {
                            console.log('data.message', data.message);
                        });
                    })
                    .catch(error => {
                        console.error('Fetch error or invalid JSON:', error);
                    });

            });


    } catch (err) {
        console.log(err);

    }

}

function clear_convrsation() {
    fetch('/conversation-layout')
        .then(response => response.text())
        .then(html => {
            document.getElementById('maincontent').innerHTML =
                `
                <div id="maincontent" class="mainContent">

                </div>
            `;
        })
}

async function show_public_conversation() {
    userMainfield = 'All'
    cskip = 0
    popups.forEach(popup => {
        popup.style.display = 'none';
    });
    conv_id = '66f9d9f7959aff99d674ed77'
    const mainContent = document.getElementById('maincontent');
    content = `
        <div class="chat-container">
           <a class="filter-a">
            <i id="filter" class="fa-solid fa-sliders"></i>
           </a>

            <div id="chat-body" class="chat-body">
                ${scrollbutton}
                <div id="message-history" class="message-history">

                </div>
                <div id="messaging-container" class="messaging-container">
                <div class="messaging-components">
                    ${fileSend}
                    <textarea id="message-input" placeholder="write a message"></textarea>
                    <i id="send-message" onclick="send_message('public')" class="fa-solid fa-paper-plane"></i>
                </div>
            </div>
            </div>
        </div>
        `;

    mainContent.innerHTML = content
    mainContent.style.display = 'block'
    mainContent.style.overflowY = 'hidden'
    control_sendButton('public')
    const messagingContainer = document.getElementById('messaging-container');
    const chatHistory = document.getElementById('message-history')
    const input = document.getElementById('message-input')
    const options_popup = document.getElementById('options-popup')
    const userProfile = document.getElementById('userProfile')
    const apply = document.querySelector('#apply');
    const cancel = document.querySelector('#cancel-filter')
    options_popup.style.left = '1%'
    userProfile.style.left = isMobile()?'2%':'36%'
    messagingContainer.style.width = "100%"
    messagingContainer.style.left = "0%"
    chatHistory.style.left = '-40%'
    chatHistory.style.top = '100%'
     isMobile()?chatHistory.style.height ="95%":chatHistory.style.height ="100%"

    input.style.width = '94%'
    const chatFilter = document.querySelector('.chat-filter')

    await get_conversation(conv_id, 'public')

    document.getElementById('filter').addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation()


        let translations = await loadTranslation();

        cancel.textContent = translations.sidebar.cancel
        apply.textContent = translations.sidebar.apply
        document.querySelector('.chat-filter p').textContent = translations.sidebar.instructions
        document.getElementById('filter-input').placeholder = userMainfield

        chatFilter.style.display = 'flex'


    })

    document.getElementById('filter-input').addEventListener('click', async function (event) {
        event.preventDefault()
        event.stopPropagation()
        const selectionPan = document.querySelector('.filter-select')

        selectionPan.style.display = 'flex'

        const filterOptions = document.querySelectorAll(".filter-select li")
        const filterSelect = document.getElementById('filter-select')
        // const filterInput = document.getElementById('filter-input')
        filterOptions.forEach(filter => {

            filter.addEventListener('click', async () => {
                event.preventDefault()
                event.stopPropagation()
                console.log('self', this);

                filterSelect.style.display = 'none'
                this.value = filter.textContent
                userMainfield = filter.textContent
            })
        })



    })
    apply.addEventListener('click', async () => {

        await loadMessages(conv_id, true)
        chatFilter.style.display = 'none'

    })
    cancel.addEventListener('click', () => {

        chatFilter.style.display = 'none'
    })

    toggleSidebar()
    scrollToBottom()

}
function scrollToBottom() {

    const messageContainer = document.getElementById('message-history');


    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function initializeConversationItems() {
    const conversations = document.querySelectorAll('.conversation-item');
    console.log('Conversations found after content load:', conversations.length);
    conversations.forEach(conversation => {
        conversation.addEventListener('click', function () {
            // Remove 'active' class from all conversations
            conversations.forEach(convo => convo.classList.remove('active'));

            // Add 'active' class to the clicked conversation
            this.classList.add('active');
        });
    });
}





async function show_search_result(Paperdata) {
    let content = "";
    await fetch('/api/search-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: Paperdata
    }).then(response => response.json()).then(data => {

        console.log('data', data);
        const joinedPapers = data.joinedPapers

        const paper_result = document.getElementById('paper-result')
        if (data.papers.length == 0) {
            paper_result.innerHTML = `
            <p> No matches</p>
            `
        }

        data.papers.forEach(paper => {
            let joinButton = ``
            if (joinedPapers.includes(paper._id.toString())) {

                joinButton = `
                    <button onclick="show_conversation('${paper._id}')" id="join-paper-${paper._id}" class="enter-button">Enter</button>
                `;
            }
            else if (paper.user_id === userId) {
                joinButton = `
                <button onclick="show_conversation('${paper._id}')" id="join-paper-${paper._id}" class="enter-button">Enter</button>
                `
            } else {
                joinButton = `
                <button onclick="join_paper('${paper._id}')" id="join-paper-${paper._id}" class="join-button">Join</button>
                `
            }
            content += `

                <div class="paper-line">
                    <div class="paperinfo">
                        <i id="joined-paper" class="fas fa-file"></i>
                        <span class="paper-title"><strong>${paper.title}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-study"><strong>${paper.type_of_study}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <strong id="need">We Need:</strong>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-we-need"><strong>${paper.we_need}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-branch"><strong>${paper.main_field}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-branch"><strong>${paper.language}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span id="${paper._id}"class="paper-branch"><strong>${paper._id}</strong></span>
                        <span id="description" class="description"><strong>${paper.description}</strong></span>

                        <div class="paper-tags">
                            <strong>
                                ${paper.tags.map(tag => `<strong><span onclick ="showPapers('${tag}'); event.stopPropagation();" class="tag">${tag}</span></strong>`).join('')}
                            </strong>
                        </div>
                        
                    </div>
                    ${joinButton}
                </div>
                    
                </div>
        `;
        })

    })
    return content

}
friend_search.addEventListener('click', async function (e) {
    e.preventDefault();

    // Show spinner immediately



    const friend_search_input = document.getElementById('friend-search-input').value;

    try {
        // Execute fetch request
        const response = await fetch('/api/get-user', {
            headers: { 'Content-Type': 'application/json' },
            method: "POST",
            body: JSON.stringify({
                query: friend_search_input
            })
        });

        const data = await response.json();

        let content = "";
        const friend_result = document.getElementById('friend-result');

        if (data.user.length == 0) {
            friend_result.innerHTML = `<p> No matches</p>`;
        } else {
            data.user.forEach(u => {
                content += `
                    <div class="paper-line">
                        <div class="paperinfo">
                            <img onclick="showProfile('${JSON.stringify(u).replace(/"/g, '&quot;')}')" src="/profile_images/${u.profile_picture}" alt="Profile Picture">
                            <span class="paper-title"><strong>${u.name}</strong></span>
                            <span class="dash"><strong>-</strong></span>
                            ${u.phoneHidden == false ? `
                                <span class="dash"><strong>-</strong></span>
                                <span class="paper-study"><strong>${u._id}</strong></span>` : ""}
                        </div>
                        <button class="friend-message" id="send-friend-message" onclick="show_Single_conversation('${u._id}')">send a message</button>
                    </div>
                `;
            });
        }

        friend_result.innerHTML = content;
        const translations = await loadTranslation()

        const friendButtons = document.querySelectorAll('.friend-message')
        console.log('friends buttons', friendButtons);

        friendButtons.forEach(button => {
            button.textContent = translations.friends.sendFriendMessage;
        })
    } catch (err) {
        console.error('Error during fetch:', err);
        // You can handle any errors here
    } finally {
        // Hide spinner after everything is done

    }
});











