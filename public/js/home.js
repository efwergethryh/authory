const API_BASE_URL = 'https://scholagram.com';
const localhostAPI = 'http://localhost:3000';
let messages;
let conversation_type;
let isreply = false
let notificationCount = 0;
const userId = document.getElementById('user-id').value;
const mainfield = document.getElementById('user-mainfield').value;
let replyTo;
let conv_id;
let paperId;
let userMainfield = 'All'
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
const fileSend = '<i id="clip" onclick="show_options()"class="fa-solid fa-paperclip"></i>'
const popups = [
    document.getElementById('startpaper-popup'),
    document.getElementById('yourpapers-popup'),
    document.getElementById('searchpapers-popup'),
    document.getElementById('joinedpapers-popup'),
    document.getElementById('searchfriends-popup'),
    document.getElementById('yourfriends-popup'),
    document.getElementById('notifications_popup')
];
const popup_buttons = [
    document.getElementById('start_paper_button'),
    document.getElementById('your-papers-button'),
    document.getElementById('searchpapers-button'),
    document.getElementById('joined-papers-button'),
    document.getElementById('search-friends-button'),
    document.getElementById('your-friends-button'),
    document.getElementById('notifications-button')
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
// const advancedSearch = document.querySelector('.advancedsearch-container');
const toggleButton = document.getElementById('advanced_button');
// const search_button = document.getElementById('search')
const socket = io(localhostAPI, {
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
socket.emit('join-public-room')
window.onload = async () => {
    await loadPosts();
    applyTranslations();

}
function display_Message(message) {
    console.log('Message', message);
    try {
        // Check if the message is valid
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
        mainContent.appendChild(popup_message);

        popup_message.classList.add('show');
        setTimeout(() => {
            // popup_message.classList.remove('show');

            setTimeout(() => {

                popup_message.classList.remove('show');
            }, 0);
        }, 1000);

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
    const sender = await get_user(message.m.sender);
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
    console.log('real time isreply ', message.m.isreply, 'real time replyTo ', message.m.replyTo);
    if (message.m.fileUrl) {

        fileUrl = message.m.fileUrl;
        fileExtension = fileUrl.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
            console.log('image');

            img = `
                <img id="sent_image" src='conversation_files/${fileUrl}' alt="sent image" />
            `;
        }
        else {

            img = `
                    <a id="sent_file" href='conversation_files/${fileUrl}' target="_blank" download>
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
            console.log('result', message.m.replyTo.toString() === m._id.toString());

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


    messageContent += `
            <div class="message-info">
                <img  onclick="event.stopPropagation(); showProfile('${JSON.stringify(sender.user[0]).replace(/"/g, '&quot;')}')" src="/profile_images/${sender.user[0].profile_picture ? sender.user[0].profile_picture : 'non-picture.jpg'}" alt=""  class="sender-image" />
                <div style ="${isImage ? "padding:0px;" : "padding:4px 15px "}"  class="message ${message.m.sender === userId ? 'sent' : 'received'}" >
                    ${img}
                    ${replyContent} 
                    ${isImage
            ? `<span class="${isImage ? "imageTime" : "time"}">${formattedDate}</span>
                                <span class='${message.m.isreply ? "message-text reply" : "message-text"}'>${message.m.text}</span>`

            : `
                                <span class='${message.m.isreply ? "message-text reply" : "message-text"}'>${message.m.text}</span>
                                <span class="${isImage ? "imageTime" : "time"}">${formattedDate}</span>
                    `}
                    
                    <i style ="${isImage ? "display:none" : "display:block"} class="fa-solid fa-reply" onclick="reply('${message.m._id}', '${message.m.text.replace(/'/g, "\\'")}')"></i>
                </div>
            </div>
`;

    return messageContent;
}
function showProfile(user) {
    console.log('user in show function', user);
    if (typeof user === 'string') {
        user = JSON.parse(user);
    }
    const content = `
        <img id="profile_image" src="/profile_images/${user.profile_picture ? user.profile_picture : 'non-picture.jpg'}" alt="Sender Image" class="sender-image" />
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
        console.log(data);

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

            socket.emit("send-notification", {

                receiver: user_id,
                user: data.user,
                type: 'accept-request',

                paper: data.paper
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
    const translations = await loadTranslation()
    console.log('Notification data', data, 'type', data.data.type);
    const redDot = document.getElementById('newNotification')
    notificationCount += 1
    redDot.textContent = notificationCount
    const u = await get_user(data.sender)
    user = u.user[0]
    console.log('user', user);
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
                            : data.data.type === "decline-request" ? `${data.data.user.name} ${translations.notification_message.decline_request}`
                                : data.data.type === "new-post" ? `${data.data.user.name} ${translations.notification_message.newPost}`
                                    : data.data.type === "join-request" ? `${data.data.user.name} ${translations.notification_message.join_request}`
                                        : data.data.type === "private" ? `${data.data.user.name} ${translations.notification_message.private}`
                                            : data.data.type === "mention-in-public" ? `${data.data.user.name} ${translations.notification_message.mention_in_public}`
                                                : data.data.type === "mention-in-welcome" ? `${data.data.user.name} ${translations.notification_message.mention_in_welcome}`
                                                    : data.data.type === "reply" ? `${data.data.user.name} ${translations.notification_message.reply}`
                                                        : `${translations.notification_message.default}`
            //             data.data.type === "message" ? `${data.data.user.name} sent you a message`
            // : data.data.type === "join-request" ? `${data.data.user.name} requested to join your paper`
            //     : data.data.type === "private" ? `${data.data.user.name} new private message`
            //         : data.data.type === "public" ? `${vuser.name} new public message`
            //             : data.data.type === "decline-request" ? `${data.data.user.name} Declined your request to join the paper`
            //                 : data.data.type === "new-post" ? `${data.data.user.name} posted a new post`
            //                     : data.data.type === "mention-in-public" ? `${data.data.user.name} mentioned you in public chat`
            //                         : data.data.type === "public" ? `${data.data.user.name} sent a message in public chat`
            //                             : data.data.type === "mention-in-welcome" ? `${data.data.user.name} mentioned you in welcome chat`
            //                                 : data.data.type === "reply" ? `${data.data.user.name} replied to you in private`
            //                                     : data.data.type === "accept" ? `your request to join the paper has been approved`
            //                                         : "You have a new notification"
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

    redDot.style.display = 'flex'

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
    console.log('notification', JSON.stringify(notification));

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
function reply(id, message) {


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
    message_content.textContent = message_content.textContent = isImage
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
        reset_reply(id);
    };


    isreply = true;
    replyTo = id;
    console.log('ReplyTo:', replyTo, 'isreply:', isreply);

    message_container.appendChild(reply_content);

    message_container.appendChild(closeButton);

}


async function buildNotifications(notifications) {
    const translations = await loadTranslation()

    let content = "";
    if (notifications.length === 0) {
        content = translations.sidebar.no_notifications
        return content
    }

    const notificationPromises = notifications.map(async (notification) => {
        console.log('type', notification.type);
        const backgroundSize = notification.type === "message"
            ? 'fa-solid fa-comment'
            : notification.type === "join-request"
                ? 'fas fa-file'
                : notification.type === "new-post"
                    ? 'fas fa-home'
                    : notification.type === "accept-request"
                        ? 'fa-solid fa-handshake'
                        : notification.type === "public"
                            ? 'fa-solid fa-comment'
                            : notification.type === "decline-request"

                                ? 'fa-solid fa-handshake'
                                : notification.type === "private"
                                    ? 'fa-solid fa-comment'
                                    : notification.type === "mention-in-public"
                                        ? 'fa-solid fa-comment'
                                        : notification.type === "mention-in-welcome"
                                            ? 'fa-solid fa-comment'
                                            : notification.type === "reply"
                                                ? 'fa-solid fa-comment'
                                                : notification.type === "accept"
                                                    ? 'fa-solid fa-handshake'
                                                    : 'fa-solid fa-bell';

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
        console.log('Notification', notification, 'post', post);
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
            <div id="notification-${notification._id}" class="${notification.read ? 'notification' : 'notification unread'}" 
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
                            : notification.type === "decline-request" ? `${notification.sender_info.name} ${translations.notification_message.decline_request} "${notification.paper_info.title}"`
                                : notification.type === "new-post" ? `${notification.sender_info.name} ${translations.notification_message.newPost}`
                                    : notification.type === "join-request" ? `${notification.sender_info.name} ${translations.notification_message.join_request}`
                                        : notification.type === "private" ? `${notification.sender_info.name} ${translations.notification_message.private}`
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

// document.addEventListener('DOMContentLoaded', async function () {
//     try {
//         const translations = await loadTranslation()

//     } catch (error) {
//         console.error('Error fetching notifications:', error);
//     }    
// });

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
    console.log('notifications', data);

    // Build the notifications content and update the DOM
    let content = await buildNotifications(data.Notifications);

    const notificationsContainer = mainContent.querySelector('.notifications-container')
    console.log('notificationContainer', notificationsContainer);

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
    console.log('adding listeners');
    const cancel = document.getElementById('cancel');
    const confirm_delete = document.getElementById('confirm-delete');
    const edit_paper = document.querySelector('.edit-paper')
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
            // popups[index].remove()
            
            if (popups[index].id === 'startpaper-popup') {
                const startpaper = mainContent.querySelector('.startpaper-popup')
                // dropdowns.forEach(function (dropdown) {

                //     const inputElement = startpaper.querySelector(`#${dropdown.inputId}`);
                //     const container = startpaper.querySelector(`#${dropdown.containerid}`);
                //     const optionsList = startpaper.querySelector(`#${dropdown.optionsid}`);
                //     const options = optionsList.querySelectorAll('li');
                //     console.log('inputElement',inputElement);
                    
                //     inputElement.addEventListener('focus', function () {
                //         container.classList.toggle('open');
                //     });

                //     options.forEach(function (option) {
                //         option.addEventListener('click', function () {
                //             inputElement.value = this.textContent;
                //             container.classList.remove('open');
                //         });
                //     });

                //     document.addEventListener('click', function (e) {
                //         if (!container.contains(e.target) && e.target !== inputElement) {
                //             container.classList.remove('open');
                //         }
                //     });
                // });
                dropdowns.forEach(function (dropdown) {
                    const inputElement = startpaper.querySelector(`#${dropdown.inputId}`);
                    const container = startpaper.querySelector(`#${dropdown.containerid}`);
                    const optionsList = startpaper.querySelector(`#${dropdown.optionsid}`);
                    const options = optionsList.querySelectorAll('li');
                    
                    
                
                    // Open dropdown when input is focused
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

                    const tagRegex = /#[a-zA-Z0-9-_]+(?=\s|$)/g;
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

                    overlay.innerHTML = overlayText;
                });

                create_paper.addEventListener('click', async function (e) {

                    const we_need = startpaper.querySelector('#we_need').value;
                    const type_of_study = startpaper.querySelector('#type_of_study').value;
                    const project_branch = startpaper.querySelector('#project_branch').value;
                    const paper_title = startpaper.querySelector('#paper_title').value;
                    const language = startpaper.querySelector('#start-language-input').value;

                    tags = Array.from(tags);

                    await fetch('/api/create-paper', {
                        headers: { 'Content-Type': 'application/json' },
                        method: 'POST',
                        body: JSON.stringify({
                            type_of_study,
                            project_branch,
                            title: paper_title,
                            we_need,
                            tags,
                            language,
                        }),
                    })
                        .then((res) => res.json())
                        .then(async (data) => {
                            const form = new FormData();
                            form.append('type', 'private');
                            form.append('paper_id', data.paper._id);
                            form.append('members', Array.from(members));
                            form.append('conv_pic', 'welcome.png');
                            form.append('title', 'welcome chat');
                            console.log('data', data);
                            display_Message(data.message)

                            const response = await fetch('/api/new-conversation', {
                                method: 'POST',
                                body: form,
                            })

                            if (response.ok) {
                                const data = await response.json()
                                console.log('Data', data);

                            }
                        }).catch(error => {
                            display_Message(data.message)
                        });
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
                        console.log('data', data);

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
            console.log('papers', data.papers.length);

            let content = ''
            if (data.papers.length === 0) {
                content = translations.sidebar.no_papers
            }
            data.papers.forEach(paper => {
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
                    <span id="${paper._id}"class="paper-branch"><strong>${paper._id}</strong></span>
                </div>
                <div class="button-container">
                    <a id="enter" onclick="show_conversation('${paper._id}')">Enter</a>
                    <div class="divider"></div>
                    <i id="gear" class="gear fa-solid fa-bars"></i>
                </div>
        </div>
            `

            })
            const paperscontainer = mainContent.querySelector('.yourpapers-container')

            console.log('paperscontainer', paperscontainer);

            paperscontainer.innerHTML = content

            const paper_settings = document.getElementById('paper-settings');
            const confirm_delete = document.getElementById('confirm-delete');
            const paperLines = document.querySelectorAll('.paper-line');
            const firstPaperLine = document.querySelector('.paper-line:first-child');

            const etnerButtons = document.querySelectorAll('.button-container a')

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



                gear.addEventListener('click', function () {
                    const paperLine = gear.closest('.paper-line');
                    paperId = paperLine.id;

                    if (paper_settings) {
                        paper_settings.style.display = 'none'
                    }
                    if (paperLine === firstPaperLine) {
                        paper_settings.style.display = 'flex';
                        paper_settings.style.top = `13vw`;  // Set top for the first element
                    } else {
                        const rect = parentPaperElement.getBoundingClientRect();
                        const viewportHeight = window.innerHeight;
                        const viewportWidth = window.innerWidth;
                        let newTop = ((rect.top + rect.height) / viewportWidth) * 100; // Position directly below the parent element

                        // Calculate how many elements are before the clicked paperLine
                        // const allPapers = document.querySelectorAll('.paper-line');
                        // const index = Array.from(allPapers).indexOf(paperLine);  // Get the index of the clicked paper
                        const maxAllowedTop = viewportHeight - paper_settings.offsetHeight - 10; // 10px padding from bottom
                        if (newTop > maxAllowedTop) {
                            newTop = maxAllowedTop;
                        }
                        // Set the top value based on the index (each paper adds 6vw to the top)
                        // let newTop = 13 + (index * 6);  // 13vw + 6vw per paper
                        paper_settings.style.display = 'flex';
                        paper_settings.style.top = `${newTop}vw`;
                        // Set the new top for this paper
                        console.log('boundings dimensions', rect);

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
                    content += `
                 <div id="${paper._id}" class="paper-line">
                    <div class="paperinfo">
                        <i id="joined-paper" class="fas fa-file"></i>
                        <span class="paper-title"><strong>${paper.title}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-study"><strong>${paper.type_of_study}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-we-need"><strong>${paper.we_need}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-branch"><strong>${paper.project_branch}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-tags"><strong>${paper.language}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-tags" id="${paper._id}"><strong>${paper._id}</strong></span>
                    </div>
                    <div class="button-container">
                        <a id="enter" onclick="show_conversation('${paper._id}')">Enter</a>
                        <div class="divider"></div>
                        <i id="gear" class="gear fa-solid fa-bars"></i>
                    </div>
            </div>
                `

                })

            }
            const paperscontainer = mainContent.querySelector('.joinedpapers-container')
            console.log(paperscontainer);

            paperscontainer.innerHTML = content
            hide_spinner()
        }
    })
    document.getElementById('your-friends-button').addEventListener('click', async function () {
        show_spinner()
        const response = await fetch('/api/users/1', {
            method: "GET"
        });
        if (response.ok) {

            const data = await response.json()
            console.log(data);
            let content = ''
            if (data.users.length == 0) {
                content = 'No friends yet'
            } else {
                data.users.forEach(user => {
                    content += `
                    
                        <div onclick="show_Single_conversation('${user._id}')" class="friend-info">
                            <img onclick="event.stopPropagation(); showProfile('${JSON.stringify(user).replace(/"/g, '&quot;')}')"  src="/profile_images/${user.profile_picture}" alt="Profile Picture">
                            <span>
                            ${user.name}
                            </span>
                        
                            <span>
                            ${user.phoneHidden == false ? `
                                <span class="dash"><strong>-</strong></span>
                                <span class="paper-study"><strong>${user._id}</strong></span>` : ""}
                            </span>
                        </div>
                    
                `

                })
            }
            const paperscontainer = mainContent.querySelector('.yourfriends-container')


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
    searchFriends.addEventListener('click', async () => {
        document.querySelector('.searchfriends-label').textContent = translations.friends.searchfriends;
        document.getElementById('friend-search').textContent = translations.sidebar.search
    })
    yourFriends.addEventListener('click', async () => {
        document.querySelector('.yourfriends-label').textContent = translations.friends.dropdowns.yourfriends;
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
    document.addEventListener('click', function (event) {
        if (edit_paper && edit_paper.style.display === 'block') {
            // Check if the clicked element is outside edit_paper and not the editclose button itself
            if (!edit_paper.contains(event.target) && event.target !== editclose) {
                edit_paper.style.display = 'none'; // Assign the 'none' value to hide it
            }
        }
    });

}
// function initializeAdvancedSearch(popupElement) {
//     const advancedSearch = popupElement.querySelector('.advancedsearch-container');
//     const toggleButton = popupElement.querySelector('#advanced_button');
//     const search_button = popupElement.querySelector('#search')
//     document.addEventListener('click', async function (e) {
//         // const targetId = e.target.id || e.target.closest('#advanced_button, #search')?.id;
//         // console.log('id', e.target);

//         toggleButton.addEventListener('click', function () {
//             const papersdropdowns = [
//                 { inputId: 'paper_we_need', containerid: 'paper-weneed-container', optionsid: 'paper-weneed-list' },
//                 { inputId: 'language-input', containerid: 'language-container', optionsid: 'language-list' },
//                 { inputId: 'paper_project_branch', containerid: 'paper-projectbranch-container', optionsid: 'paper-projectbranch-list' },
//             ];
//             console.log(document.querySelector('.advancedsearch-container'));


//             toggleButton.classList.toggle('toggled')
//             advancedSearch.classList.toggle('show')

//             papersdropdowns.forEach(function (dropdown) {
//                 const inputElement = document.getElementById(dropdown.inputId);
//                 const container = document.getElementById(dropdown.containerid);
//                 const optionsList = document.getElementById(dropdown.optionsid);
//                 const options = optionsList.querySelectorAll('li');


//                 inputElement.addEventListener('click', function () {
//                     container.classList.toggle('open'); // Toggle the open class
//                 });

//                 options.forEach(function (option) {
//                     option.addEventListener('click', function () {
//                         inputElement.value = this.textContent;
//                         container.classList.remove('open');
//                     });
//                 });

//                 document.addEventListener('click', function (e) {
//                     if (!container.contains(e.target) && e.target !== inputElement) {
//                         container.classList.remove('open');
//                     }
//                 });
//             });
//         })
//         search_button.addEventListener('click', function () {
//             show_spinner()
//             let content = ''
//             const title = document.getElementById('paper-title').value
//             const projectbranch = document.getElementById('paper_project_branch').value
//             const we_need = document.getElementById('paper_we_need').value
//             const language = document.getElementById('language-input').value
//             const id = document.getElementById('ID').value
//             const paper_result = document.getElementById('paper-result')
//             const paper_data = JSON.stringify({
//                 title,
//                 id,
//                 projectbranch,
//                 we_need,
//                 language,
//             })

//             try {
//                 content = await show_search_result(paper_data)

//                 paper_result.innerHTML = content;
//                 paper_result.classList.add('active')
//                 const translations = await loadTranslation()
//                 const joinButtons = document.querySelectorAll('.join-button')
//                 const enterButtons = document.querySelectorAll('.enter-button')
//                 joinButtons.forEach(button => {
//                     button.textContent = translations.joinPaper.joinButton
//                 })
//                 enterButtons.forEach(button => {
//                     button.textContent = translations.joinPaper.enterButton
//                 })
//             } catch (error) {
//                 console.log(error);

//             }
//             finally {
//                 hide_spinner()
//             }
//         })

//     })
// }
document.addEventListener('DOMContentLoaded', function () {
    // const inputField = document.getElementById('tags');
    const seen = localStorage.getItem('hasSeenWelcomePopup')
    const welcomePopup = document.getElementById('welcome-popup')

    if (isMobile()) {

        document.getElementById('sidebar').classList.add('closed')
        document.getElementById('maincontent').classList.remove('shifted')
        document.querySelector('.circle-button').classList.add('collapsed')
        document.getElementById('home').addEventListener('click', toggleSidebar)
        document.getElementById('notifications-button').addEventListener('click', toggleSidebar)
        popup_buttons.forEach((button) => {

            button.addEventListener('click', toggleSidebar)
        })
    }
    if (!seen) {
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

        // console.log('target', target.id);

        if (exitConversations) {
            const translations = await loadTranslation()

            document.getElementById('home').addEventListener('click', async function () {
                skip = 0;
                let mainContent = document.getElementById('maincontent')

                mainContent.innerHTML = ''
                await loadPosts();
                applyTranslations();
                toggleSidebar()
            })
            const notifications_button = document.getElementById('notifications-button')
            notifications_button.addEventListener('click', async function () {
                document.querySelector('.notifications-label').textContent = translations.sidebar.notifications;
                const notificationsContainer = mainContent.querySelector(".notifications-container")
                const container = await loadNotifications();
                mainContent.innerHTML = `<div class="notifications-label">${translations.sidebar.notifications}</div>`
                notificationsContainer.innerHTML += container.outerHTML
                toggleSidebar()
            });

            const cancel = document.getElementById('cancel');
            const confirm_delete = document.getElementById('confirm-delete');
            const edit_paper = document.querySelector('.edit-paper')
            const editclose = document.getElementById('closeedit')
            const users_to_delete = document.getElementById('users-to-delete')
            const create_paper = document.getElementById('start_paper_button')
            const searchPapers = document.getElementById('searchpapers-button')
            const yourPapers = document.getElementById('your-papers-button')
            const joinedPapers = document.getElementById('joined-papers-button')
            const searchFriends = document.getElementById('search-friends-button')
            const yourFriends = document.getElementById('your-friends-button')
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

                show_spinner()
                const response = await fetch('/api/papers', {
                    method: "GET"
                });

                if (response.ok) {

                    const data = await response.json()
                    console.log('papers', data.papers.length);

                    let content = ''
                    if (data.papers.length === 0) {
                        content = translations.sidebar.no_papers
                    }
                    data.papers.forEach(paper => {
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
                    <span class="paper-branch"><strong>${paper.project_branch}</strong></span>
                    <span class="dash"><strong>-</strong></span>
                    <span class="paper-branch"><strong>${paper.language}</strong></span>
                    <span class="dash"><strong>-</strong></span>
                    <span id="${paper._id}"class="paper-branch"><strong>${paper._id}</strong></span>
                </div>
                <div class="button-container">
                    <a id="enter" onclick="show_conversation('${paper._id}')">Enter</a>
                    <div class="divider"></div>
                    <i id="gear" class="gear fa-solid fa-bars"></i>
                </div>
        </div>
`

                    })
                    const paperscontainer = document.querySelector('.yourpapers-container')

                    console.log('paperscontainer', paperscontainer);

                    paperscontainer.innerHTML = content
                    mainContent.innerHTML = `<div class="yourpapers-label" id="joined">${translations.newPaper.dropdowns.yourPapers}</div>`
                    mainContent.innerHTML += paperscontainer.outerHTML
                    const paper_settings = document.getElementById('paper-settings');
                    const confirm_delete = document.getElementById('confirm-delete');
                    const paperLines = document.querySelectorAll('.paper-line');
                    const firstPaperLine = document.querySelector('.paper-line:first-child');

                    const etnerButtons = document.querySelectorAll('.button-container a')

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



                        gear.addEventListener('click', function () {
                            const paperLine = gear.closest('.paper-line');
                            paperId = paperLine.id;

                            if (paper_settings) {
                                paper_settings.style.display = 'none'
                            }
                            if (paperLine === firstPaperLine) {
                                paper_settings.style.display = 'flex';
                                paper_settings.style.top = `13vw`;  // Set top for the first element
                            } else {
                                const rect = parentPaperElement.getBoundingClientRect();
                                const viewportHeight = window.innerHeight;
                                const viewportWidth = window.innerWidth;
                                let newTop = ((rect.top + rect.height) / viewportWidth) * 100; // Position directly below the parent element

                                // Calculate how many elements are before the clicked paperLine
                                // const allPapers = document.querySelectorAll('.paper-line');
                                // const index = Array.from(allPapers).indexOf(paperLine);  // Get the index of the clicked paper
                                const maxAllowedTop = viewportHeight - paper_settings.offsetHeight - 10; // 10px padding from bottom
                                if (newTop > maxAllowedTop) {
                                    newTop = maxAllowedTop;
                                }
                                // Set the top value based on the index (each paper adds 6vw to the top)
                                // let newTop = 13 + (index * 6);  // 13vw + 6vw per paper
                                paper_settings.style.display = 'flex';
                                paper_settings.style.top = `${newTop}vw`;
                                // Set the new top for this paper
                                console.log('boundings dimensions', rect);

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
                    toggleSidebar()
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
                            content += `
                 <div id="${paper._id}" class="paper-line">
                    <div class="paperinfo">
                        <i id="joined-paper" class="fas fa-file"></i>
                        <span class="paper-title"><strong>${paper.title}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-study"><strong>${paper.type_of_study}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-we-need"><strong>${paper.we_need}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-branch"><strong>${paper.project_branch}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-tags"><strong>${paper.language}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-tags" id="${paper._id}"><strong>${paper._id}</strong></span>
                    </div>
                    <div class="button-container">
                        <a id="enter" onclick="show_conversation('${paper._id}')">Enter</a>
                        <div class="divider"></div>
                        <i id="gear" class="gear fa-solid fa-bars"></i>
                    </div>
            </div>
                `

                        })

                    }
                    const Joinedpaperscontainer = document.querySelector('.joinedpapers-container')
                    console.log(Joinedpaperscontainer);
                    mainContent.innerHTML = `<div class="joined-label" id="joined">${translations.joinPaper.dropdowns.joinedPapers}</div>`
                    Joinedpaperscontainer.innerHTML = content
                    mainContent.innerHTML += Joinedpaperscontainer.outerHTML
                    toggleSidebar()
                    hide_spinner()

                }
            })
            document.getElementById('your-friends-button').addEventListener('click', async function () {
                show_spinner()
                const response = await fetch('/api/users/1', {
                    method: "GET"
                });
                if (response.ok) {

                    const data = await response.json()
                    console.log(data);
                    let content = ''
                    if (data.users.length == 0) {
                        content = 'No friends yet'
                    } else {
                        data.users.forEach(user => {
                            content += `
                    
                        <div onclick="show_Single_conversation('${user._id}')" class="friend-info">
                            <img onclick="event.stopPropagation(); showProfile('${JSON.stringify(user).replace(/"/g, '&quot;')}')"  src="/profile_images/${user.profile_picture}" alt="Profile Picture">
                            <span>
                            ${user.name}
                            </span>
                            <span style="text-decoration:none;">-</span>
                            <span>
                            ${user._id}
                            </span>
                        </div>
                    
                `

                        })
                    }
                    const firendsContainer = document.querySelector('.yourfriends-container')

                    mainContent.innerHTML = `<div class="yourfriends-label" id="joined">${translations.friends.dropdowns.yourfriends}</div>`
                    firendsContainer.innerHTML = content
                    mainContent.innerHTML += firendsContainer.outerHTML
                    toggleSidebar()
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
                mainContent.innerHTML = `<div class="startpapers-label">${translations.newPaper.label}</div>`
                mainContent.innerHTML += document.querySelector('.startpaper-popup').outerHTML
                toggleSidebar()
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
                mainContent.innerHTML = `<div class="searchpapers-label">${translations.joinPaper.searchpaper}</div>`
                mainContent.innerHTML += document.querySelector('.searchpapers-popup').outerHTML
                toggleSidebar()
                const newPopup = mainContent.querySelector('.searchpapers-popup');
                // initializeAdvancedSearch(newPopup)
                const advancedSearch = newPopup.querySelector('.advancedsearch-container');
                const toggleButton = newPopup.querySelector('#advanced_button');
                const search_button = newPopup.querySelector('#search')
                toggleButton.addEventListener('click', async function () {
                    const papersdropdowns = [
                        { inputId: 'paper_we_need', containerid: 'paper-weneed-container', optionsid: 'paper-weneed-list' },
                        { inputId: 'language-input', containerid: 'language-container', optionsid: 'language-list' },
                        { inputId: 'paper_project_branch', containerid: 'paper-projectbranch-container', optionsid: 'paper-projectbranch-list' },
                    ];
                    console.log(document.querySelector('.advancedsearch-container'));


                    toggleButton.classList.toggle('toggled')
                    advancedSearch.classList.toggle('show')

                    papersdropdowns.forEach(function (dropdown) {
                        const inputElement = document.getElementById(dropdown.inputId);
                        const container = document.getElementById(dropdown.containerid);
                        const optionsList = document.getElementById(dropdown.optionsid);
                        const options = optionsList.querySelectorAll('li');


                        inputElement.addEventListener('click', function () {
                            container.classList.toggle('open'); // Toggle the open class
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
                })
                search_button.addEventListener('click', async function () {
                    show_spinner()
                    let content = ''
                    const title = newPopup.querySelector('#paper-title').value
                    const projectbranch = newPopup.querySelector('#paper_project_branch').value
                    const we_need = newPopup.querySelector('#paper_we_need').value
                    const language = newPopup.querySelector('#language-input').value
                    const id = newPopup.querySelector('#ID').value
                    const paper_result = newPopup.querySelector('#paper-result')
                    const paper_data = JSON.stringify({
                        title,
                        id,
                        projectbranch,
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

            })
            notifications_button.addEventListener('click', async function () {
                document.querySelector('.notifications-label').textContent = translations.sidebar.notifications;
                loadNotifications();
                toggleSidebar()
            });
            yourPapers.addEventListener('click', async () => {
                document.querySelector('.yourpapers-label').textContent = translations.newPaper.dropdowns.yourPapers;
            })
            joinedPapers.addEventListener('click', async () => {
                document.querySelector('.joined-label').textContent = translations.joinPaper.dropdowns.joinedPapers;
            })
            searchFriends.addEventListener('click', async () => {
                document.querySelector('.searchfriends-label').textContent = translations.friends.searchfriends;
                document.getElementById('friend-search').textContent = translations.sidebar.search
                mainContent.innerHTML = `<div class="searchfriends-label">${translations.friends.searchfriends}</div>`
                mainContent.innerHTML += document.querySelector('.searchfriends-popup').outerHTML
                toggleSidebar()
                const newPopup = mainContent.querySelector('.searchfriends-popup')

                const friend_search = newPopup.querySelector('#friend-search')

                friend_search.addEventListener('click', async function (e) {
                    e.preventDefault();

                    const friend_search_input = newPopup.querySelector('#friend-search-input').value;

                    try {
                        const response = await fetch('/api/get-user', {
                            headers: { 'Content-Type': 'application/json' },
                            method: "POST",
                            body: JSON.stringify({
                                query: friend_search_input
                            })
                        });

                        const data = await response.json();

                        let content = "";
                        const friend_result = newPopup.querySelector('#friend-result');

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
            })
            yourFriends.addEventListener('click', async () => {
                document.querySelector('.yourfriends-label').textContent = translations.friends.dropdowns.yourfriends;

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
            document.addEventListener('click', function (event) {
                if (edit_paper && edit_paper.style.display === 'block') {
                    // Check if the clicked element is outside edit_paper and not the editclose button itself
                    if (!edit_paper.contains(event.target) && event.target !== editclose) {
                        edit_paper.style.display = 'none'; // Assign the 'none' value to hide it
                    }
                }
            });
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
    // const text = document.getElementById('message-input').value;


    try {
        const formData = new FormData();
        const messageInput = document.getElementById('message-input');
        const captions = document.querySelector('.file-frame .frame-buttons input')


        const text = (messageInput && messageInput.value.trim() !== '')
            ? messageInput.value
            : (captions && captions.value.trim() !== '')
                ? captions.value
                : '';
        console.log('text', text);

        formData.append('text', text);

        formData.append('isreply', isreply ? 'true' : 'false');

        const fileInput = document.getElementById('image-input');
        const imageInput = document.getElementById('file-input');

        if (fileInput && fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        } else if (imageInput) {
            formData.append('file', imageInput.files[0]);
        }
        await fetch(`/api/send-message/${conv_id}`, {
            method: "POST",

            body: formData
            // JSON.stringify({
            //     text: text,
            //     isreply: isreply,
            //     replyTo: replyTo
            // })
        }).then(res => res.json()).then(async data => {
            if (messages) {
                messages.push(data.newMessage)
            }

            const conversation = data.conversation
            const paper = data.paper
            if (type == 'public') {

                socket.emit("send-to-public-room", { message: { m: data.newMessage, id: conv_id, mainfield } })
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
                        sender: data.sender,
                        notifiedUsers: data.notifiedUsers,
                        type: "public",
                        mainfield: userMainfield
                    });
                    // socket.emit("notify-publicgroup", { message: data.message, user: data.user, conversation: data.friendConversation });
                })
                reset_reply()

            } else if (type == "private") {
                console.log('in private');
                socket.emit("send-message", { message: { m: data.newMessage, id: conv_id } })

                console.log(data.members, data);
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

        // alert("Message not sent")
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
            console.log('Conversation data:', data);

            // Check if data and conv exist
            if (data.conv) {
                // Get the chats container
                const chats = document.getElementById('chats');

                // Create conversation content
                const content = `
                    <div class="conversation-item" onclick="get_conversation('${data.conv._id}')">
                        <img src="/conversation_images/${data.conv.conv_pic}" alt="${data.conv.conv_title}" />
                        <h3>${data.conv.conv_title}</h3>
                    </div>
                `;

                // Find the 'add conversation' button
                const addButton = document.querySelector('.plus-sign');


                if (addButton) {
                    addButton.insertAdjacentHTML('beforebegin', content);
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
document.addEventListener('DOMContentLoaded', function () {


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

    console.log('ids', userIds);
    if (userIds.length == 0) {
        content = "No users have joined your paper yet!"
    }
    for (const userid of userIds) {
        const u = await get_user(userid);
        const user = u.user[0] // Await the async function
        console.log('user', user);
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
    }).then(res => res.json()).then(data => {

        hide_spinner()
    })

}
async function edit_paper(id) {
    try {
        const editPaper = document.querySelector('.edit-paper')
        let content = ''
        await fetch(`/api/paper/${id}`, {
            method: 'GET'
        }).then(res => res.json()).then(async data => {
            console.log('data', data);
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
                           <li data-value="Trauma Surgery">General gynecology</li>
                           <li data-value="Trauma Surgery">Obstetrics</li>
                           <li data-value="Trauma Surgery">Gynecology oncology</li>
                           <li data-value="Trauma Surgery">Infertility</li>
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
                    container.classList.toggle('open'); // Toggle the open class
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
            language
        })
    }).then(res => res.json()).then(data => {
        const paper = document.getElementById(`${id}`)
        paper.querySelector('.paper-title strong').textContent = paper_title
        paper.querySelector('.paper-study strong').textContent = type_of_study
        paper.querySelector('.paper-branch strong').textContent = project_branch
        paper.querySelector('.paper-we-need strong').textContent = we_need
        paper.querySelector('.paper-tags strong').textContent = language
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



async function get_conversation(id, type) {
    conv_id = id;
    cskip = 0
    show_spinner();

    try {
        
           
        loadMessages(id, false)

        join_conversation(id);

        if (type === 'public') {

        } else {
            // Ensure messaging-container is added only once
            let chat_body = document.getElementById('chat-body');
            let message_history = document.getElementById('message-history');
            
            if (!chat_body) {
                chat_body = document.createElement('div')
                chat_body.className = 'chat-body'
                chat_body.id = 'chat-body'
                document.querySelector('.chat-container').append(chat_body)
            }
            if (!message_history) {
                message_history = document.createElement('div')
                message_history.className = 'message-history'
                message_history.id = 'message-history'
                chat_body.append(message_history)
            }
        
            if (!document.getElementById('messaging-container')) {
                chat_body.innerHTML += `
                    <div id="messaging-container" class="messaging-container">
                        <div class="messaging-components">
                            ${fileSend}
                            <input type="text" id="message-input" placeholder="write a message">
                            <i id="send-message" onclick="send_message('private')" class="fa-solid fa-paper-plane"></i>
                        </div>
                    </div>
                `;
            }
            const response = await fetch(`/api/conversation/${id}`);

            if (response.ok) {
                const data = await response.json();
                const chats = document.querySelector('.chat-container');
                message_history.innerHTML =''
                let Chatcontent = '';
        
                Chatcontent = `
                        <div class="chatInfo" style="display:flex">
                            <a onclick="close_conversation()">
                                Close
                            </a>
                            <span style="font-weight:700;">
                                ${data.conversation.conv_title}
                            </span>
                            <img src="/conversation_images/${data.conversation.conv_pic}" alt="Profile Picture">
                        </div>
                `;
        
                chats.innerHTML += Chatcontent;
            }
        }
        
        document.getElementById('message-history').onscroll = () => {
            handleScroll()
        };
        inputListeners(`${type}`)
        control_sendButton();
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

async function buildConversations(paper_UserId, paper_id) {
    let conversationContent = "";

    try {
        const response = await fetch(`/api/conversations/${paper_id}`, {
            method: 'GET',
        });
        const data = await response.json();
        console.log("Conversations data:", data);

        if (data.conversations.length === 0) {
            console.log("No conversations found.");
            return `<p>No matches</p>`;
        }

        for (const conversation of data.conversations) {
            conversationContent += `
                <div id="conversationItem" onclick="get_conversation('${conversation._id}')" class="conversation-item">
                    <img src="/conversation_images/${conversation.conv_pic}" alt="${conversation.conv_title}"/>
                    <h3>${conversation.conv_title}</h3>
                    <div class="new-notification" id="private-new-${conversation._id}">
                    </div>  
                </div>
            `;
        }


        console.log('queue', notificationQueue);
        conversationContent += `
            <div class="plus-sign" 
                onclick="add_conversation('${paper_id}'); event.preventDefault(); event.stopPropagation()" 
                style="${String(paper_UserId) === String(userId) ? 'display: block;' : 'display: none;'}">
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
    console.log('Bottom', isAtBottom);

    if (!isAtBottom) {
        scrollButton.style.display = 'flex';
    } else {
        scrollButton.style.display = 'none';
    }
}

async function show_conversation(paper_id) {

    show_spinner()
    const mainContent = document.getElementById('maincontent');
    mainContent.style.display = 'block'

    popups.forEach(popup => {
        popup.style.display = 'none';
    });
    try {
        const paperResponse = await fetch(`/api/paper/${paper_id}`);
        const paperData = await paperResponse.json();
        const paper_userId = paperData.paper.user_id;

        const content = await buildConversations(paper_userId, paper_id);
        mainContent.innerHTML = `
        <div class="chat-container">
            ${!isMobile() ?
                `
                <div id="chats-view" class="chats-view">
                    <div id="chats-container" class="chats-plus">
                        <div id="chats" class="chat">
                        
                        </div>  
                    </div>
                </div>
                `: ""
            }
            
            <div id="chat-body" class="chat-body">
                ${scrollbutton} 
                <div id="message-history" class="message-history"></div>
            </div>
        </div>
        `;
        if (!isMobile()) {
            const chatsView = document.getElementById('chats')

            chatsView.innerHTML += content;
        }
        // mainContent.classList.add('conversation')
        if (isMobile()) {

            document.querySelector('.sidebar').innerHTML = `
                <div class="chats-mobile">
                    <div id="chats-view" class="chats-view">
                        <div id="chats-container" class="chats-plus">
                            <div id="chats" class="chat">
                                
                            </div>  
                        </div>
                        
                    </div>
                    <a id="exit_conversations">
                        <i class="fa-solid fa-arrow-left-long" style="margin-left: 8px;"></i>
                        <p style="margin: 0;">Exit conversations</p>
                    </a> 
                </div> 
            `

            const chatsView = document.getElementById('chats')
            chatsView.innerHTML += content;
            document.getElementById('exit_conversations').addEventListener('click', function () {

                const sideBarContent = `
                    <ul id="sidebar-content">
        <li>
            <a id="home" href="#">

                <div id="head" class="header">
                <i class="fas fa-home"></i>
                <span class="text-only">Home</span>
                
                </div>
            </a>
        </li>
      <li>
         <a  class="toggle-link" id="paper-toggle" href="">
            <div class="toggle-tab-container">
               <div id="head" class="header">
                  <i id="paper" class="fas fa-file"></i>
                  <span id="new-paper" class="text toggle-item">Create paper</span>
                  <div id="create-newNotification" class="new-notfication"></div>
                  <span class="tab-icon">
                     <div class="create-dropdown">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round"
                           stroke-linejoin="round" stroke-width="2" class="feather feather-chevron-down"
                           viewBox="0 0 34 34" role="img">
                           <path d="m15 18 6 6-6 6"></path>
                        </svg>
                     </div>
                  </span>

               </div>
               <ul class="sublist">
                  <li id="start_paper_button">Start a paper</li>
                  <li id="your-papers-button">Your papers</li>
               </ul>
            </div>
         </a>
      </li>
      <li>
         <a class="toggle-link" id="paper-toggle-2" href="">
            <div class="toggle-tab-container-2">
               <div id="head" class="header">
                  <i id="paper-2" class="fa-solid fa-handshake"></i>
                  <span id="join-paper" class="text toggle-item">Join papers</span>
                  <div id="join-paperNotification" class="new-notfication"></div>

                  <span class="tab-icon">
                     <div class="create-dropdown">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round"
                           stroke-linejoin="round" stroke-width="2" class="feather feather-chevron-down"
                           viewBox="0 0 34 34" role="img">
                           <path d="m15 18 6 6-6 6"></path>
                        </svg>
                     </div>
                  </span>
               </div>
               <ul class="sublist-2">
                  <li id="searchpapers-button">Search </li>
                  <li id="joined-papers-button">already joined</li>
               </ul>
            </div>
         </a>
      </li>
      <li>
         <a class="toggle-link" id="paper-toggle-4" href="">
            <div class="toggle-tab-container-4">
               <div id="head" class="header">
                  <i id="paper-3" class="fa-solid fa-user-group"></i>
                  <span id="friends-tab" class="text toggle-item">friends</span>
                  <span class="tab-icon">
                     <div class="create-dropdown">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round"
                           stroke-linejoin="round" stroke-width="2" class="feather feather-chevron-down"
                           viewBox="0 0 34 34" role="img">
                           <path d="m15 18 6 6-6 6"></path>
                        </svg>
                     </div>
                  </span>
               </div>
               <ul class="sublist-4">
                  <li id="search-friends-button">Search </li>
                  <li id="your-friends-button">Your friends</li>
               </ul>
            </div>
         </a>
      </li>
      <li>
         <a onclick="show_public_conversation()" href="#" id="chat">
            <!-- <i class="fa-solid fa-comment"></i>
            <span class="text-only">Public chat</span> -->
            <div id="head" class="header">
               <!-- <i id="paper-3" class="fa-solid fa-user-group"></i> -->
               <i class="fa-solid fa-comment"></i>
               <span id="chat-tab" class="text toggle-item">Public chat</span>
               
            </div>
         </a>
      </li>
      <li id="notifications-button">
         <a href="#">
            <!-- <i class="fa-solid fa-bell"></i>
            <span class="text-only">Notifications</span> -->
            <div id="head" class="header">
               <i class="fa-solid fa-bell"></i>
               <span id="notifications" class="text-only">Notifications</span>
               
               </span>
            </div>
            <div id="newNotification" class="new-notfication"></div>
         </a>
      </li>
   </ul>
                `

                let sidebar = document.getElementById('sidebar')

                sidebar.innerHTML = sideBarContent
            })
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


}
async function show_Single_conversation(user_id) {
    try {
        show_spinner(); // Ensure spinner is shown at the start

        conversation_type = 'friend';
        let content = "";
        const mainContent = document.querySelector('.mainContent');
        isreply = false;
        replyTo = null;
        mainContent.style.display = 'block'
        // mainContent.className +=' conversation'
        mainContent.classList.add('conversation')
        const response = await fetch(`/api/get-friendconversation/${user_id}`, { method: 'GET' });
        const data = await response.json();

        let conversation_Id;

        if (!data.f_conversation) {

            content = await conversation_layout(user_id);
            mainContent.innerHTML = content;

            load_f_conversations()
            control_sendButton('private')
            inputListeners('private')
        } else {
            conversation_Id = data.f_conversation._id;

            const messagesResponse = await fetch(`/api/messages/${conversation_Id}`, { method: 'GET' });
            const messagesData = await messagesResponse.json();

            let message_content = "";

            content = await conversation_layout(user_id);
            mainContent.innerHTML = content;

            load_f_conversations()

            control_sendButton('private')
            // inputListeners('private')
            const message_history = document.getElementById('message-history');
            if (messagesData.messages.length === 0) {
                message_history.innerHTML = `
                    <p> No Messages</p>
                `;
            } else {
                try {
                    messages = messagesData.messages;
                    message_content = await buildMessageContent(messagesData.messages, messagesData.userId);

                    console.log(message_history);
                    message_history.innerHTML = message_content;

                    messages.forEach(message => {
                        const messageInfo = document.getElementById(`message-info-${message._id}`);
                        console.log(messageInfo);
                        messageInfo.addEventListener('dblclick', function () {
                            reply(message._id, message);
                        });
                    });
                } catch (err) {
                    console.log(err);
                }
            }
        }

        popups.forEach(popup => {
            popup.style.display = 'none';
        });

        toggleSidebar();
    } catch (error) {
        console.error('Error fetching conversation:', error);
    } finally {
        hide_spinner(); // Hide spinner after everything is done
    }
}

async function conversation_layout(user_id) {
    try {

        console.log('Entering conversation_layout for user:', user_id);
        const user = await get_user(user_id);
        console.log('User data received:', user);
        let content = '';
        const rec_name = user.user[0].name;
        const rec_img = user.user[0].profile_picture;

        content += `
        <div class="chat-container">
                <div class="userinfo">
                    <img src="/profile_images/${rec_img}" alt="Profile Picture">
                    <span>
                        ${rec_name}
                    </span>
                </div>
                ${!isMobile() ? `
                    <div id="chats-view" style="top:-10%" class="chats-view">    
                        <div id="friendChats" class="chat">
                            
                        </div>
                    </div>
                    `: ""}
                <div id="chat-body" class="chat-body">
                    <div id="message-history" class="message-history"></div>
                    <div id="messaging-container" class="messaging-container">
                        <div class="messaging-components">
                            ${fileSend}                            
                            <input type="text" id="message-input" placeholder="write a message">
                            <i id="send-message" onclick="send_to_friend('${user_id}')" class="fa-solid fa-paper-plane"></i>
                        </div>
                    </div>
                </div>
        </div>
        `;

        if (isMobile()) {

            document.querySelector('.sidebar').innerHTML = `
                <div class="chats-mobile">
                    <div id="chats-view" class="chats-view">
                        <div id="chats-container" class="chats-plus">
                            <div id="chats" class="chat">
                                
                            </div>  
                        </div>
                        
                    </div>
                    <a id="exit_conversations">
                        <i class="fa-solid fa-arrow-left-long" style="margin-left: 8px;"></i>
                        <p style="margin: 0;">Exit conversations</p>
                    </a> 
                </div> 
            `

            const chatsView = document.getElementById('chats')
            chatsView.innerHTML += content;
            document.getElementById('exit_conversations').addEventListener('click', function () {

                const sideBarContent = `
                    <ul id="sidebar-content">
        <li>
            <a id="home" href="#">

                <div id="head" class="header">
                <i class="fas fa-home"></i>
                <span class="text-only">Home</span>
                
                </div>
            </a>
        </li>
      <li>
         <a  class="toggle-link" id="paper-toggle" href="">
            <div class="toggle-tab-container">
               <div id="head" class="header">
                  <i id="paper" class="fas fa-file"></i>
                  <span id="new-paper" class="text toggle-item">Create paper</span>
                  <div id="create-newNotification" class="new-notfication"></div>
                  <span class="tab-icon">
                     <div class="create-dropdown">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round"
                           stroke-linejoin="round" stroke-width="2" class="feather feather-chevron-down"
                           viewBox="0 0 34 34" role="img">
                           <path d="m15 18 6 6-6 6"></path>
                        </svg>
                     </div>
                  </span>

               </div>
               <ul class="sublist">
                  <li id="start_paper_button">Start a paper</li>
                  <li id="your-papers-button">Your papers</li>
               </ul>
            </div>
         </a>
      </li>
      <li>
         <a class="toggle-link" id="paper-toggle-2" href="">
            <div class="toggle-tab-container-2">
               <div id="head" class="header">
                  <i id="paper-2" class="fa-solid fa-handshake"></i>
                  <span id="join-paper" class="text toggle-item">Join papers</span>
                  <div id="join-paperNotification" class="new-notfication"></div>

                  <span class="tab-icon">
                     <div class="create-dropdown">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round"
                           stroke-linejoin="round" stroke-width="2" class="feather feather-chevron-down"
                           viewBox="0 0 34 34" role="img">
                           <path d="m15 18 6 6-6 6"></path>
                        </svg>
                     </div>
                  </span>
               </div>
               <ul class="sublist-2">
                  <li id="searchpapers-button">Search </li>
                  <li id="joined-papers-button">already joined</li>
               </ul>
            </div>
         </a>
      </li>
      <li>
         <a class="toggle-link" id="paper-toggle-4" href="">
            <div class="toggle-tab-container-4">
               <div id="head" class="header">
                  <i id="paper-3" class="fa-solid fa-user-group"></i>
                  <span id="friends-tab" class="text toggle-item">friends</span>
                  <span class="tab-icon">
                     <div class="create-dropdown">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round"
                           stroke-linejoin="round" stroke-width="2" class="feather feather-chevron-down"
                           viewBox="0 0 34 34" role="img">
                           <path d="m15 18 6 6-6 6"></path>
                        </svg>
                     </div>
                  </span>
               </div>
               <ul class="sublist-4">
                  <li id="search-friends-button">Search </li>
                  <li id="your-friends-button">Your friends</li>
               </ul>
            </div>
         </a>
      </li>
      <li>
         <a onclick="show_public_conversation()" href="#" id="chat">
            <!-- <i class="fa-solid fa-comment"></i>
            <span class="text-only">Public chat</span> -->
            <div id="head" class="header">
               <!-- <i id="paper-3" class="fa-solid fa-user-group"></i> -->
               <i class="fa-solid fa-comment"></i>
               <span id="chat-tab" class="text toggle-item">Public chat</span>
               
            </div>
         </a>
      </li>
      <li id="notifications-button">
         <a href="#">
            <!-- <i class="fa-solid fa-bell"></i>
            <span class="text-only">Notifications</span> -->
            <div id="head" class="header">
               <i class="fa-solid fa-bell"></i>
               <span id="notifications" class="text-only">Notifications</span>
               
               </span>
            </div>
            <div id="newNotification" class="new-notfication"></div>
         </a>
      </li>
   </ul>
                `

                let sidebar = document.getElementById('sidebar')

                sidebar.innerHTML = sideBarContent
            })
        } else {
            toggleSidebar();
        }
        return content;
    } catch (error) {
        console.error("Error in conversation_layout:", error);
        return '';
    }
}
async function send_to_friend(user_id) {
    console.log('global', replyTo, isreply);

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
        console.log(data);
        console.log('global', replyTo, isreply);
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

async function buildMessageContent(messages, userId) {
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

        if (message.isreply && message.replyTo) {
            const originalMessage = messages.find(m => m._id.toString() === message.replyTo.toString());

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
        console.log('isfile', isfile);

        message_content += `    
            <div id="message-info-${message._id}" class="${isfile ? "message-info isfile" : "message-info"}" style="${isImage ? "margin-bottom:1%;margin-top: 2%;" : "10px"}">
                <img onclick="event.stopPropagation();  showProfile('${JSON.stringify(message.senderDetails).replace(/"/g, '&quot;')}')"  src="${path}"  class="sender-image" />
                <div style ="${isImage ? "padding:0px;" : "padding:4px 15px "}"  class="message ${message.sender === userId ? 'sent' : 'received'}" >
                    ${img}
                    ${replyContent} 
                    ${isImage ? `<span class="${isImage ? "imageTime" : "time"}">${formattedDate}</span>
                    <span class='${message.isreply ? "message-text reply" : "message-text"}'>${message.text ? message.text : ""}</span>`
                : `
                    <span class='${message.isreply ? "message-text reply" : "message-text"}'>${message.text ? message.text : ""}</span>

                    <span class="${isImage ? "imageTime" : "time"}">${formattedDate}</span>
                    `}
                    
                    <i style ="${isImage ? "display:none" : "display:block"} class="fa-solid fa-reply" onclick="reply('${message._id}', '${message.text ? message.text.replace(/'/g, "\\'") : ""}')"></i>
                </div>
            </div>
            `;

    }

    return message_content;
}

function show_options() {

    document.getElementById('options-popup').style.display = 'block';

}
// Global event handler functions
const imageInputHandler = (event,value) => {
    initializeFile(value);
    processImage(event);
};

const fileInputHandler = (event,value) => {
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
    imageInput.removeEventListener('change', imageInputHandler);
    fileInput.removeEventListener('change', fileInputHandler);

    // Add new event listeners
    console.log("Adding new event listeners...");
    imageInput.addEventListener('change', (event)=>{imageInputHandler(event,value)});
    fileInput.addEventListener('change', (event)=>{fileInputHandler(event,value)});

    // Verify that event listeners were added correctly
    console.log("Event listeners added!");
}

function initializeFile(value) {
    const fileFrame = document.createElement('div');
    fileFrame.className = 'file-frame';
    fileFrame.innerHTML = `
        <p></p>
        <div class="photo-frame"></div>
        <div class="frame-buttons">
            <a id="cancel-frame">Cancel</a>
            <input id="captions" placeholder="Add caption">
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
// function show_options() {
//     const fileFrame = document.createElement('div')

//     fileFrame.className = 'file-frame'
//     fileFrame.innerHTML =`
//     <p></p>
//     <div id class="photo-frame">
//     </div>
//     <div class="frame-buttons">

//         <a id="cancel-frame">cancel</a>   
//         <input placeholder="Add caption">
//         <button onclick="">Send</button>
//     </div>
//     `
//     document.getElementById('options-popup').style.display = 'block'
//     console.log(document.getElementById('options-popup'));
//     // document.getElementById('image-input').removeEventListener('change', processImage)
//     document.getElementById('image-input').addEventListener('change', processImage)

//     // document.getElementById('file-input').removeEventListener('change', processFile)
//     document.getElementById('file-input').addEventListener('change', processFile)
//     function processFile(event) {
//         event.preventDefault()
//         const files = event.target.files;
//         const p = fileFrame.querySelector('p')
//         p.textContent ='Send a file'
//         const frame = document.createElement('p')

//         frame.textContent = files[0].name
//         frame.id = 'file-frame'
//         // fileFrame.append(p)
//         photoFrame.append(frame)
//         document.getElementById('options-popup').style.display = 'none'
//         document.body.append(fileFrame)
//     }
//     function processImage (event) {
//         event.preventDefault()
//         const files = event.target.files;
//         const frame = document.createElement('img')
//         const p = fileFrame.querySelector('p')
//         p.textContent ='Send a picutre'
//         frame.src = URL.createObjectURL(files[0])
//         frame.id = 'img-frame'
//         const photoFrame = fileFrame.querySelector('.photo-frame')
//         photoFrame.className ='photo-frame'
//         // fileFrame.prepend(p)
//         photoFrame.append(frame)
//         // fileFrame.appendChild(photoFrame)
//         document.getElementById('options-popup').style.display = 'none'

//         document.body.append(fileFrame)
//     }
//     fileFrame.querySelector('#cancel-frame').addEventListener('click',function () {

//         // image-input
//         // file-input
//         const photoFrame = fileFrame.querySelector('.photo-frame')
//         photoFrame.innerHTML = ''
//         const ImageInput = document.getElementById('image-input')
//         const fileInput = document.getElementById('file-input')
//         ImageInput.value = '';
//         fileInput.value = '';
//         fileFrame.remove()
//     })
//     document.addEventListener('click', function (event) {
//         const popup = document.getElementById('options-popup')
//         const clip = document.getElementById('clip');

//         if (popup && popup.style.display === 'block') {
//             // Check if the clicked element is inside the popup or is the clip icon
//             if (!popup.contains(event.target) && event.target !== clip) {
//                 popup.style.display = 'none'; // Hide the popup if clicked outside
//             }
//         }
//     });

// }
async function loadTranslation() {
    const response = await fetch(`/translations/${currentlang}`, {
        method: "GET"
    });
    const translations = await response.json();
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
    // document.getElementById('settings').textContent = translations.topBar.settings
    document.getElementById('home-setting').textContent = translations.topBar.home


    document.getElementById('start_paper_button').textContent = translations.newPaper.dropdowns.startPaper;
    document.getElementById('your-papers-button').textContent = translations.newPaper.dropdowns.yourPapers;

    document.getElementById('searchpapers-button').textContent = translations.sidebar.search;
    document.getElementById('joined-papers-button').textContent = translations.joinPaper.dropdowns.joinedPapers;

    document.getElementById('search-friends-button').textContent = translations.sidebar.search;
    document.getElementById('your-friends-button').textContent = translations.friends.dropdowns.yourfriends;
    document.getElementById('home-setting').textContent = translations.topBar.home
    document.getElementById('dashboard-setting').textContent = translations.topBar.dashboard
    document.getElementById('language-setting').textContent = translations.topBar.language
    document.getElementById('editProfile-setting').textContent = translations.topBar.editProfile
    document.getElementById('sign-out').textContent = translations.topBar.signOut
    document.getElementById('ar').textContent = translations.topBar.ar
    document.getElementById('en').textContent = translations.topBar.en
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
    // document.getElementById('settings').textContent = translations.topBar.settings
    document.getElementById('home-setting').textContent = translations.topBar.home
    // document.getElementById('dashboard').textContent = translations.topBar.dashoard

    // document.getElementById('settings-popup').querySelector('label').textContent = translations.settingsPopup.chooseLanguage


    document.getElementById('start_paper_button').textContent = translations.newPaper.dropdowns.startPaper;
    document.getElementById('your-papers-button').textContent = translations.newPaper.dropdowns.yourPapers;

    document.getElementById('searchpapers-button').textContent = translations.sidebar.search;
    document.getElementById('joined-papers-button').textContent = translations.joinPaper.dropdowns.joinedPapers;

    document.getElementById('search-friends-button').textContent = translations.sidebar.search;
    document.getElementById('your-friends-button').textContent = translations.friends.dropdowns.yourfriends;

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

function control_sendButton(value) {
    const text = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message');
    console.log('text', text, 'send button', sendButton);
    text.removeEventListener('input', function () {
        if (text.value.trim() !== "") {
            sendButton.classList.add('active');
            sendButton.style.pointerEvents = 'auto'; // Enable clicking
        } else {
            sendButton.classList.remove('active');
            sendButton.style.pointerEvents = 'none'; // Disable clicking
        }


    });
    text.addEventListener('input', function () {
        if (text.value.trim() !== "") {
            sendButton.classList.add('active');
            sendButton.style.pointerEvents = 'auto'; // Enable clicking
        } else {
            sendButton.classList.remove('active');
            sendButton.style.pointerEvents = 'none'; // Disable clicking
        }


    });
    document.removeEventListener('keydown',async function (event) {
        if (event.key === 'Enter') { // Correct the key check
            console.log('event', event.key);

            if (text.value.trim() !== "") { // Ensure there is text to send
                await send_message(value);
                text.value = ''; // Clear the input field
                sendButton.classList.remove('active'); // Reset button state
                sendButton.style.pointerEvents = 'none'; // Disable clicking
            }
        }
    });
    document.addEventListener('keydown', async function (event) {
        if (event.key === 'Enter') { // Correct the key check

            if (text.value.trim() !== "") { // Ensure there is text to send
                await send_message(value);
                text.value = ''; // Clear the input field
                sendButton.classList.remove('active'); // Reset button state
                sendButton.style.pointerEvents = 'none'; // Disable clicking
            }
        }
    });
}
async function load_f_conversations() {
    const response = await fetch('/api/get-friendconversations');

    if (response.ok) {
        const data = await response.json();
        let chats = document.getElementById('friendChats');
        if (!chats) {
            chats = document.createElement('div')
            chats.id = 'friendChats'
            chats.className = 'chat'

            chats.style.top = '-9%'

            document.getElementById('chats-view').append(chats)
        }
        let Chatcontent = '';


        for (const conversation of data.f_conversations) {
            const personId = userId === conversation.sender ? conversation.receiver : conversation.sender
            const userObject = await get_user(personId);
            const user = userObject.user[0];
            console.log('convesation', conversation);

            Chatcontent += `
                <div id="conversationItem" onclick="get_conversation('${conversation._id}')" class="conversation-item">
                    <img src="/profile_images/${user.profile_picture}" alt="${conversation.conv_title}"/>
                    <h3>${user.name}</h3>
                    <div class="new-notification" id="private-new-${conversation._id}">
                    </div>  
                </div>
                `;
        }

        // Update innerHTML once all content is ready
        chats.innerHTML = Chatcontent;


    } else {
        document.getElementById('friendChats').innerHTML = `Error loading your conversations`;
    }
}

async function load_conversation(id) {
    const response = await fetch(`/api/conversation/${id}`);

    if (response.ok) {
        // const data = await response.json();
        // const chats = document.querySelector('.chat-container');
        // document.getElementById('message-history').innerHTML =''
        // let Chatcontent = '';

        // Chatcontent = `
        //         <div class="chatInfo" style="display:flex">
        //             <a onclick="close_conversation()">
        //                 Close
        //             </a>
        //             <span style="font-weight:700;">
        //                 ${data.conversation.conv_title}
        //             </span>
        //             <img src="/conversation_images/${data.conversation.conv_pic}" alt="Profile Picture">
        //         </div>
        // `;

        // chats.innerHTML += Chatcontent;

        // get_conversation(data.conversation._id, 'private')
    } else {
        chats.innerHTML = `Error loading your conversations`;
    }
}

function close_conversation() {
    const message_history = document.getElementById('message-history');
    const message_container = document.getElementById('messaging-container');
    const chatInfo = document.querySelector('.chatInfo');
    const chatContainer = document.querySelector('.chat-container')
    const chatsView = document.getElementById('chats-view')
    chatContainer.innerHTML = ''

    if (!isMobile()) {
        chatContainer.appendChild(chatsView)

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
        }).
            then(res => res.json()).
            then(async data => {
                console.log(data);
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
                }).then(res => res.json()).then(data => {



                    socket.emit("send-notification", {
                        message: data.message,
                        receiver,
                        user: data.user,
                        type: 'join-request',
                        notification: data.Notification,
                        conversation: data.conversation,
                        paper: paper
                    });

                })
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

    cskip = 0
    popups.forEach(popup => {
        popup.style.display = 'none';
    });
    conv_id = '66f9d9f7959aff99d674ed77'
    const mainContent = document.getElementById('maincontent');
    content = `
        <div class="chat-container">
        <i id="filter" class="fa-solid fa-filter"></i>
            <div id="chat-body" class="chat-body">
                ${scrollbutton}
                <div id="message-history" class="message-history">
                
                </div>
                <div id="messaging-container" class="messaging-container">
                <div class="messaging-components">
                    ${fileSend}
                    <input type="text" id="message-input" placeholder="write a message">
                    <i id="send-message" onclick="send_message('public')" class="fa-solid fa-paper-plane"></i>
                </div>
            </div>
            </div>
        </div>
        `;

    mainContent.innerHTML = content
    // inputListeners('public')
    mainContent.style.display = 'block'
    control_sendButton('public')
    const messagingContainer = document.getElementById('messaging-container');
    const chatHistory = document.getElementById('message-history')
    const input = document.getElementById('message-input')
    const options_popup = document.getElementById('options-popup')
    const userProfile = document.getElementById('userProfile')
    options_popup.style.left = '1%'
    userProfile.style.left = '36%'
    messagingContainer.style.width = "100%"
    messagingContainer.style.left = "0%"
    chatHistory.style.left = '-40%'
    chatHistory.style.top = '100%'
    input.style.width = '94%'
    await get_conversation(conv_id, 'public', 'All')
    document.getElementById('filter').addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation()
        document.getElementById('filter-input').placeholder = userMainfield
        document.getElementById('chat-filter').style.display = 'flex'
    })

    document.getElementById('filter-input').addEventListener('click', async function (event) {
        event.preventDefault()
        event.stopPropagation()
        console.log('filter input');
        const selectionPan = document.querySelector('.filter-select')
        console.log('selection pan', selectionPan);

        selectionPan.style.display = 'block'

        const filterOptions = document.querySelectorAll(".filter-select li")
        console.log('filter options', filterOptions);

        filterOptions.forEach(filter => {
            filter.addEventListener('click', async () => {
                event.preventDefault()
                event.stopPropagation()
                document.getElementById('filter-select').style.display = 'none'
                document.getElementById('filter-input').textContent = filter.textContent
                userMainfield = filter.textContent
                await loadMessages(conv_id, true)
            })
        })



    })
    document.addEventListener('click', function () {
        document.getElementById('chat-filter').style.display = 'none'
        document.getElementById('filter-select').style.display = 'none'
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
                    </div>
                    ${joinButton}
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











