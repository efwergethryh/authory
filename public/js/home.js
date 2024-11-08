const API_BASE_URL = 'http://ictoob.com/3000';
let messages;
let conversation_type;
let isreply = false
let notificationCount = 0;
const userId = document.getElementById('user-id').value;
let replyTo;
let conv_id;
let paperId;
let members = new Set();
const inputField = document.getElementById('tags');
const overlay = document.getElementById('tags-overlay');
let tags = new Set();
const spinner = document.getElementById('loading-spinner')
const create_paper = document.getElementById('start_create')
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
const friend_search = document.getElementById('friend-search')
let notificationQueue = [];
let conversationsLoaded = false;
const chatContainer = document.querySelector('.chat-container');
const advancedSearch = document.querySelector('.advancedsearch-container');
const toggleButton = document.getElementById('advanced_button');
const search_button = document.getElementById('search')
const socket = io(API_BASE_URL, {
    query: {
        userId: userId
    }
});

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

async function buildmessagecontent(message) {
    const sender = await get_user(message.m.sender);
    let messageContent = '';
    console.log('received message', message);

    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedDate = new Date(message.m.createdAt).toLocaleString('en-US', dateOptions);

    let replyContent = '';
    let img = '';
    let fileUrl
    let fileExtension
    console.log('real time isreply ', message.m.isreply, 'real time replyTo ', message.m.replyTo);
    if (message.m.fileUrl) {
        // Get the file extension
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


    console.log('isImage', isImage);

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
        <p> ${user._id}</p>
        <label>E-mail</label>
        <p> ${user.email}</p>
        <label>Country</label>
        <p> ${user.country}</p>
        <label>Type of Study</label>
        <p>${user.scientific_interest}</p>
    `;
    const profileCard = document.getElementById('userProfile')
    profileCard.innerHTML = content
    profileCard.style.display = 'flex'
    document.addEventListener('click', function (e) {

        if (profileCard.style.display === 'flex' && !profileCard.contains(e.target)) profileCard.style.display = 'none'
    })
}


/*
<p>${user.type_of_study}</p>
        <label>Project Branch: </label>
        <p>${user.project_branch}</p>
        <label>Interested in</label>
*/
document.addEventListener('DOMContentLoaded', function () {
    const profileImage = document.getElementById('profileImage')
    const settings = document.getElementById('settings')
    const settings_popup = document.getElementById('settings-popup')
    const profileSpan = document.getElementById('profile-span')
    console.log(profileImage);

    profileImage.addEventListener('click', function (e) {
        e.stopPropagation()

        profileSpan.style.display = 'flex'
    })
    settings.addEventListener('click', function (e) {
        // loadTranslation('ar')
        e.stopPropagation()
        settings_popup.style.display = 'block'
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

        console.log('message', message);

        if (message) {
            let chatHistory = document.getElementById('message-history');

            let content = await buildmessagecontent(message)
            chatHistory.innerHTML += content
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
    const dropdowns = [
        { inputId: 'we_need', containerid: 'weneed-container', optionsid: 'weneed-list' },
        { inputId: 'type_of_study', containerid: 'typeofstudy-container', optionsid: 'typeofstudy-list' },
        { inputId: 'project_branch', containerid: 'projectbranch-container', optionsid: 'projectbranch-list' },
        { inputId: 'start-language-input', containerid: 'start-language-container', optionsid: 'start-language-list' },

    ];
    const papersdropdowns = [
        { inputId: 'paper_we_need', containerid: 'paper-weneed-container', optionsid: 'paper-weneed-list' },
        { inputId: 'language-input', containerid: 'language-container', optionsid: 'language-list' },
        { inputId: 'paper_project_branch', containerid: 'paper-projectbranch-container', optionsid: 'paper-projectbranch-list' },
    ];

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

    dropdowns.forEach(function (dropdown) {

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


    socket.emit('register', userId)

});



inputField.addEventListener("input", function () {
    const inputValue = inputField.value;
    let overlayText = '';

    const tagRegex = /#[a-zA-Z0-9-_]+(?=\s|$)/g;
    const matches = inputValue.match(tagRegex);

    tags.clear();
    if (matches) {
        matches.forEach(tag => tags.add(tag)); // Only add full tags
    }


    inputValue.split(/(\s+)/).forEach((word) => {
        if (tags.has(word)) {
            overlayText += `<span class="is-tag"><strong>${word}</strong></span> `;
        } else {
            overlayText += `<span><strong>${word}</strong></span> `;
        }
    });

    overlay.innerHTML = overlayText; // Update the overlay

    // Debug: Check tags
});


create_paper.addEventListener('click', async function (e) {
    e.preventDefault()
    const we_need = document.getElementById('we_need').value;
    const type_of_study = document.getElementById('type_of_study').value;
    const project_branch = document.getElementById('project_branch').value;
    const paper_title = document.getElementById('paper_title').value;
    const language = document.getElementById('language-input').value;
    tags = Array.from(tags)
    await fetch('/api/create-paper', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
            type_of_study,
            project_branch,
            title: paper_title,
            we_need,
            tags,
            language
        })
    }).then(res => res.json()).then(async data => {
        const form = new FormData();
        form.append('type', 'private')
        form.append('paper_id', data.paper._id)
        form.append('members', Array.from(members))
        form.append('conv_pic', 'welcome.png')
        form.append('title', 'welcome chat')
        await fetch('/api/new-conversation', {
            method: 'POST',
            body: form
        }).then(response => response.json()).then(data => {
            console.log(data);

        })
    })
})


document.addEventListener('DOMContentLoaded', () => {

    // Select all toggle links
    const toggleLinks = document.querySelectorAll('.toggle-link');

    // Iterate over each toggle link
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
            paper_id,
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
function display_notification(data) {
    console.log(data);
    const redDot = document.getElementById('newNotification')
    notificationCount += 1
    redDot.textContent = notificationCount


    if (data.data.paper && data.data.type !== "join-request") {

        if (data.data.paper.user_id == userId) {
            const createNew = document.getElementById('create-newNotification');

            createNew.style.display = 'flex';
        } else {
            const joineNew = document.getElementById('join-paperNotification');

            joineNew.style.display = 'flex';
        }

        // Your existing code for notification rendering
        document.getElementById('notifications-container').innerHTML += `
            <div class="notification" onclick="handleNotificationClick('${data.data.type}', ${JSON.stringify(data.conversation)})">
                <img src="profile_images/${data.data.user.profile_picture}" alt="Profile Picture"/>
                <p>${data.data.type === "message" ? `${data.data.user.name} sent you a message`
                : data.data.type === "join-request" ? `${data.data.user.name} requested to join your paper`
                    : data.data.type === "accept-request" ? `${data.data.user.name} accepted your request `
                        : data.data.type === "private" ? `${data.data.user.name} requested to join your paper`
                            : data.data.type === "mention-in-public" ? `${data.data.user.name} mentioned you in public chat`
                                : data.data.type === "mention-in-welcome" ? `${data.data.user.name} mentioned you in welcome chat`
                                    : data.data.type === "reply" ? `${data.data.user.name} replied to you in private`

                                        : "You have a new notification"
            }</p>
            <button onclick="accept_request('${data.data.paper._id}', '${data.data.user._id}')" id="accept-button" style='display:${data.data.type === "join-request" ? 'block' : 'none'}'>accept</button>
            </div>
        `;
    } else {
        // Your existing code for notifications without a paper
        document.getElementById('notifications-container').innerHTML += `
            <div class="notification" onclick="handleNotificationClick('${data.data.type}', ${JSON.stringify(data.conversation)})">
                <img src="profile_images/${data.data.user.profile_picture}" alt="Profile Picture"/>
                <p>${data.data.type === "message" ? `${data.data.user.name} sent you a message`
                : data.data.type === "join-request" ? `${data.data.user.name} requested to join your paper`
                    : data.data.type === "private" ? `${data.data.user.name} requested to join your paper`
                        : data.data.type === "mention-in-public" ? `${data.data.user.name} mentioned you in public chat`
                            : data.data.type === "mention-in-welcome" ? `${data.data.user.name} mentioned you in welcome chat`
                                : data.data.type === "reply" ? `${data.data.user.name} replied to you in private`
                                    : data.data.type === "accept" ? `your request to join the paper has been approved`
                                        : "You have a new notification"
            }</p>
            <button onclick="accept_request('${data.data.paper._id}', '${data.data.user._id}')" id="accept-button" style='display:${data.data.type === "join-request" ? 'block' : 'none'}'>accept</button>
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


toggleButton.addEventListener('click', () => {
    advancedSearch.classList.toggle('show');
    toggleButton.classList.toggle('toggled')
});
function handleNotificationClick(notificationType, notification) {
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
    let content = "";

    const notificationPromises = notifications.map(async (notification) => {
        const user = await get_user(notification.sender);

        return `
            <div class="notification"   
                    onclick="handleNotificationClick('${notification.type}', ${JSON.stringify(notification).replace(/"/g, '&quot;')})">


                <img src="profile_images/${user.user[0].profile_picture}" alt="Profile Picture"/>
                <p>${notification.type === "message" ? `${user.user[0].name} sent you a message`
                : notification.type === "join-request" ? `${user.user[0].name} requested to join your paper`
                    : notification.type === "accept-request" ? `${user.user[0].name} accepted your request`
                        : notification.type === "private" ? `${user.user[0].name} sent a message in private chat`
                            : notification.type === "mention-in-public" ? `${user.user[0].name} mentioned you in public chat`
                                : notification.type === "mention-in-welcome" ? `${user.user[0].name} mentioned you in welcome chat`
                                    : notification.type === "reply" ? `${user.user[0].name} replied to you in private`
                                        : notification.type === "accept" ? `your request to join the paper has been approved`
                                            : "You have a new notification"
            }</p>
            <button onclick="accept_request('${notification.paper_id}','${notification.sender}')" id="accept-button" style='display:${notification.type === "join-request" ? 'block' : 'none'}'>accept</button>               
                
            </div>
        `;
    });

    // Wait for all promises to resolve
    const notificationContents = await Promise.all(notificationPromises);

    // Join all contents into one string
    content = notificationContents.join('');
    return content;
}

document.addEventListener('DOMContentLoaded', async function () {
    try {
        document.getElementById('your-papers-button').addEventListener('click', async function () {
            show_spinner()
            const response = await fetch('/api/papers', {
                method: "GET"
            });
            if (response.ok) {

                const data = await response.json()
                console.log(data);
                let content = ''
                data.papers.forEach(paper => {
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
                    <div class="new-notification" id="${paper._id}"></div>
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
                console.log(paperscontainer);

                paperscontainer.innerHTML = content

                const paper_settings = document.getElementById('paper-settings');
                const confirm_delete = document.getElementById('confirm-delete');
                const paperLines = document.querySelectorAll('.paper-line');
                const firstPaperLine = document.querySelector('.paper-line:first-child');

                console.log(paperLines);

                paperLines.forEach(function (paperLine) {
                    const gear = paperLine.querySelector('.gear');

                    const deletePaper = document.getElementById('deletePaper');
                    const editPaper = document.getElementById('editPaper');
                    const dufp = document.getElementById('delete-user-from-paper')
                    gear.addEventListener('click', function () {
                        const paperLine = gear.closest('.paper-line');
                        paperId = paperLine.id;

                        if (paper_settings) {
                            paper_settings.style.display = 'none'
                        }
                        if (paperLine === firstPaperLine) {
                            paper_settings.style.display = 'flex';
                            paper_settings.style.top = `16vw`;  // Set top for the first element
                        } else {

                            // Calculate how many elements are before the clicked paperLine
                            const allPapers = document.querySelectorAll('.paper-line');
                            const index = Array.from(allPapers).indexOf(paperLine);  // Get the index of the clicked paper

                            // Set the top value based on the index (each paper adds 6vw to the top)
                            let newTop = 13 + (index * 6);  // 13vw + 6vw per paper
                            paper_settings.style.display = 'flex';
                            paper_settings.style.top = `${newTop}vw`;  // Set the new top for this paper
                        }
                    });


                    deletePaper.addEventListener('click', function () {
                        confirm_delete.style.display = 'flex';
                    });
                    editPaper.addEventListener('click', function () {
                        edit_paper(paperId)
                    })
                    dufp.addEventListener('click', function () {
                        showUsers()
                    })
                });

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
                console.log(data);
                let content = ''
                if (data.joinedpapers.length == 0) {
                    content = 'No joined papers yet'
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
                        <div class="new-notification" id="${paper._id}"></div>
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
                const paperscontainer = document.querySelector('.joinedpapers-container')
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
                                <img src="/profile_images/${user.profile_picture}" alt="Profile Picture">
                                <span>
                                ${user.name}
                                </span>
                            </div>
                        
                    `

                    })
                }
                const paperscontainer = document.querySelector('.yourfriends-container')
                console.log(paperscontainer);

                paperscontainer.innerHTML = content
                hide_spinner()
            }
        })
        const response = await fetch('/api/notifications', {
            method: "GET"
        });

        const data = await response.json();

        // Build the notifications content and update the DOM
        const content = await buildNotifications(data.Notifications);
        document.getElementById('notifications-container').innerHTML = content;

    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
});

function closeConversation() {
    const mainContent = document.getElementById('maincontent')
    if (mainContent.style.display === 'block') {
        mainContent.style.display = 'none' // Clear conversation content if needed
    }
}

document.addEventListener('DOMContentLoaded', function () {



    popup_buttons.forEach((button, index) => {
        button.addEventListener('click', function (event) {
            const mainContent = document.getElementById('maincontent')
            mainContent.style.display = 'none'
            popups.forEach((popup, popupIndex) => {


                if (popupIndex !== index && popup.style.display === 'block') {
                    popup.style.display = 'none';
                }
            });

            if (popups[index].style.display === 'block') {
                popups[index].style.display = 'none';
            } else {
                popups[index].style.display = 'block';
            }
        });
    });
});


function show_spinner() {

    spinner.style.display = 'block'
}
function hide_spinner() {
    spinner.style.display = 'none'
}

// Add event listener for typing in the input field


async function send_message(type) {
    const text = document.getElementById('message-input').value;

    try {
        await fetch(`/api/send-message/${conv_id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                isreply: isreply,
                replyTo: replyTo
            })
        }).then(res => res.json()).then(async data => {
            messages.push(data.newMessage)

            const conversation = data.conversation
            const paper = data.paper
            if (type == 'public') {

                socket.emit("send-to-public-room", { message: { m: data.newMessage, id: conv_id } })
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

                    socket.emit("notify-publicgroup", { message: data.message, user: data.user, conversation: data.friendConversation });
                })
                reset_reply()

            } else if (type == "private") {
                console.log('in private');
                socket.emit("send-message", { message: { m: data.newMessage, id: conv_id } })

                console.log(data.members, data);
                if (data.members.length > 0) {
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
                } else {
                    console.log('members is empty');

                }
                reset_reply()
            }
            else if (type == 'subchat') {


                console.log('in subchat');
                socket.emit("send-to-subchat", { message: { m: data.newMessage, id: conv_id, members: data.members } })
            }
        })
    } catch (error) {
        console.log(error);

        alert("Message not sent")
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
        const user = await get_user(userid); // Await the async function

        content += `
            <div class="paper-line">
                <div class="paperinfo">
                    <img src="/profile_images/${user.user[0].profile_picture}" alt="Profile Picture">
                    <span class="paper-title"><strong>${user.user[0].name}</strong></span>
                    <span class="dash"><strong>-</strong></span>
                    <span class="paper-study"><strong>${user.user[0]._id}</strong></span>
                </div>
                <button onclick ="delete_userPaper('${user.user[0]._id}')" id="delete-user-from-paper">Delete user</button>
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
        const edit_paper = document.querySelector('.edit-paper')
        let content = ''
        await fetch(`/api/paper/${id}`, {
            method: 'GET'
        }).then(res => res.json()).then(data => {
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
                  <div class="input-group" id="project-branch">
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
                  <div class="input-group">
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
                  <div class="input-group">
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
                  <div class="input-group">
                     <label for="name">Tags</label>
                     <div class="input-container">
                        <div id="update-tags-overlay" class="tags-overlay"></div>
                        <input type="text" id="update-tags" name="name" value="" placeholder="Write tags related to the topic...">
                     </div>
                  </div>
               </td>
               <td>
                <div class="input-group" id="project-branch">
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
            edit_paper.innerHTML = content
            edit_paper.style.display = 'block'
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

document.addEventListener('DOMContentLoaded', function () {
    const cancel = document.getElementById('cancel');
    const confirm_delete = document.getElementById('confirm-delete');
    const edit_paper = document.querySelector('.edit-paper')
    const editclose = document.getElementById('closeedit')
    const users_to_delete = document.getElementById('users-to-delete')
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
    cancel.addEventListener('click', function () {
        confirm_delete.style.display = 'none';
    });
    console.log(editclose);

    document.addEventListener('click', function (event) {
        if (edit_paper && edit_paper.style.display === 'block') {
            // Check if the clicked element is outside edit_paper and not the editclose button itself
            if (!edit_paper.contains(event.target) && event.target !== editclose) {
                edit_paper.style.display = 'none'; // Assign the 'none' value to hide it
            }
        }
    });

})

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
            const yourpapers = document.getElementById('yourpapers-container')
            const paper = document.getElementById(`${paperId}`)
            yourpapers.removeChild(paper)
        })
        .catch(error => {
            console.error('There was an error with the deletion:', error);
        });

}
async function get_conversation(id, type) {
    conv_id = id;
    show_spinner();

    try {
        const res = await fetch(`/api/messages/${id}`, {
            method: "GET",
        });

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await res.json(); // Await the JSON parsing
        console.log(data);

        messages = data.messages;
        const message_history = document.getElementById('message-history');
        const chat_body = document.getElementById('chat-body');

        let content = "";
        content = await buildMessageContent(data.messages, userId);
        join_conversation(id);
        message_history.innerHTML = content;


        if (type === 'public') {

        } else {
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

        const text = document.getElementById('message-input');
        const sendButton = document.getElementById('send-message');
        text.addEventListener('input', function () {
            if (text.value.trim() !== "") {
                sendButton.classList.add('active');
                sendButton.style.pointerEvents = 'auto'; // Enable clicking
            } else {
                sendButton.classList.remove('active');
                sendButton.style.pointerEvents = 'none'; // Disable clicking
            }
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        // Optionally display an error message to the user
    } finally {
        hide_spinner(); // Ensure the spinner is hidden after the fetch
    }
}


members.add(userId)
function add_conversation(paper_id) {
    paperId = paper_id
    document.getElementById("add_conversation").style.display = 'block'
    const avatarButton = document.getElementById('avatar-label');
    const profile_picture = document.getElementById('conversation_picture')
    const usersDropdown = document.getElementById('users_dropdown')
    const user_name = document.getElementById('user-name')
    let membersNames = new Set()
    fetch('/api/users', {
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
        user_name.addEventListener('input', function () {
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
    user_name.addEventListener('focus', () => {
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
                onclick="add_conversation('${paper_id}')" 
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
            <div id="chats-view" class="chats-view">
                <div id="chats-container" class="chats-plus">
                    <div id="chats" class="chat">
                    
                    </div>  
                </div>
            </div>
            <div id="chat-body" class="chat-body">
                <div id="message-history" class="message-history"></div>
            </div>
        </div>
        `;
        const chatsView = document.getElementById('chats')
        chatsView.innerHTML += content;


    } catch (err) {
        console.error('Error fetching paper details:', err);
    } finally {
        hide_spinner()
    }

    // Hide all popups
    popups.forEach(popup => {
        popup.style.display = 'none';
    });

    toggleSidebar();
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
    console.log('messages', messages);

    for (const message of messages) {
        const sender = await get_user(message.sender);  // Get sender info
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        const formattedDate = new Date(message.createdAt).toLocaleString('en-US', dateOptions);
        let img = '';
        let fileExtension;
        let replyContent = '';
        let fileUrl
        if (message.fileUrl) {
            fileUrl = message.fileUrl;
            fileExtension = fileUrl.split('.').pop().toLowerCase();  // Get the file extension
            console.log('fileExtension', fileExtension);



            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {

                img = `
                    <img onclick="openImage('${fileUrl}')" id="sent_image" src='conversation_files/${fileUrl}' alt="sent image" />
                `;
            }
            else {
                console.log('file');

                img = `
                    <a id="sent_file" href='conversation_files/${fileUrl}' target="_blank" download>
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
        console.log('file:', img);
        let isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)

        message_content += `
            <div id="message-info-${message._id}" class="message-info">
                <img onclick="event.stopPropagation();  showProfile('${JSON.stringify(sender.user[0]).replace(/"/g, '&quot;')}')"  src="/profile_images/${sender.user[0].profile_picture ? sender.user[0].profile_picture : 'non-picture.jpg'}"  class="sender-image" />
                <div style ="${isImage ? "padding:0px;" : "padding:4px 15px "}"  class="message ${message.sender === userId ? 'sent' : 'received'}" >
                    ${img}
                    ${replyContent} 
                    ${isImage ? `<span class="${isImage ? "imageTime" : "time"}">${formattedDate}</span>
                    <span class='${message.isreply ? "message-text reply" : "message-text"}'>${message.text}</span>`
                : `
                    <span class='${message.isreply ? "message-text reply" : "message-text"}'>${message.text}</span>

                    <span class="${isImage ? "imageTime" : "time"}">${formattedDate}</span>
                    `}
                    
                    <i style ="${isImage ? "display:none" : "display:block"} class="fa-solid fa-reply" onclick="reply('${message._id}', '${message.text.replace(/'/g, "\\'")}')"></i>
                </div>
            </div>
            `;

    }

    return message_content;
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
                    <span>
                        ${rec_name}
                    </span>
                    <img src="/profile_images/${rec_img}" alt="Profile Picture">
                </div>
                <div id="chats-view" style="top:-10%" class="chats-view">    
                    <div id="friendChats" class="chat">
                        
                    </div>
                </div>
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


        return content;
    } catch (error) {
        console.error("Error in conversation_layout:", error);
        return '';
    }
}
function show_options() {
    document.getElementById('options-popup').style.display = 'block'
    console.log(document.getElementById('options-popup'));
    document.getElementById('image-input').addEventListener('change', (event) => {
        event.preventDefault()
        const files = event.target.files;
        const frame = document.createElement('img')
        frame.src = URL.createObjectURL(files[0])
        frame.id = 'img-frame'
        const message_container = document.getElementById('messaging-container')
        message_container.classList.add('toggled')
        message_container.appendChild(frame)
        document.getElementById('options-popup').style.display = 'none'
        document.getElementById('send-message').classList.add('active')
        console.log(document.getElementById('send-message'));
    })

    document.getElementById('file-input').addEventListener('change', (event) => {
        event.preventDefault()
        const files = event.target.files;
        const frame = document.createElement('p')
        frame.textContent = files[0].name
        frame.id = 'file-frame'
        const message_container = document.getElementById('messaging-container')
        message_container.classList.add('toggled')
        message_container.appendChild(frame)
        document.getElementById('options-popup').style.display = 'none'
        document.getElementById('send-message').classList.add('active')
    })
    document.addEventListener('click', function (event) {
        const popup = document.getElementById('options-popup')
        const clip = document.getElementById('clip');

        if (popup && popup.style.display === 'block') {
            // Check if the clicked element is inside the popup or is the clip icon
            if (!popup.contains(event.target) && event.target !== clip) {
                popup.style.display = 'none'; // Hide the popup if clicked outside
            }
        }
    });
}

async function show_Single_conversation(user_id) {
    try {
        show_spinner(); // Ensure spinner is shown at the start

        conversation_type = 'friend';
        let content = "";
        const mainContent = document.getElementById('maincontent');
        isreply = false;
        replyTo = null;
        mainContent.style.display = 'block'
        const response = await fetch(`/api/get-friendconversation/${user_id}`, { method: 'GET' });
        const data = await response.json();

        let conversation_Id;

        if (!data.f_conversation) {

            content = await conversation_layout(user_id);
            mainContent.innerHTML = content;
            load_f_conversations()

            const text = document.getElementById('message-input');
            const sendButton = document.getElementById('send-message');
            text.addEventListener('input', function () {
                if (text.value.trim() !== "") {
                    sendButton.classList.add('active');
                    sendButton.style.pointerEvents = 'auto'; // Enable clicking
                } else {
                    sendButton.classList.remove('active');
                    sendButton.style.pointerEvents = 'none'; // Disable clicking
                }
            });
        } else {
            conversation_Id = data.f_conversation._id;

            const messagesResponse = await fetch(`/api/messages/${conversation_Id}`, { method: 'GET' });
            const messagesData = await messagesResponse.json();

            let message_content = "";

            content = await conversation_layout(user_id);
            mainContent.innerHTML = content;
            load_f_conversations()
            const text = document.getElementById('message-input');
            const sendButton = document.getElementById('send-message');
            text.addEventListener('input', function () {
                if (text.value.trim() !== "") {
                    sendButton.classList.add('active');
                    sendButton.style.pointerEvents = 'auto'; // Enable clicking
                } else {
                    sendButton.classList.remove('active');
                    sendButton.style.pointerEvents = 'none'; // Disable clicking
                }
            });

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

        toggleSidebar(); // Ensure sidebar is toggled
    } catch (error) {
        console.error('Error fetching conversation:', error);
    } finally {
        hide_spinner(); // Hide spinner after everything is done
    }
}
async function load_f_conversations() {
    const response = await fetch('/api/get-friendconversations');

    if (response.ok) {
        const data = await response.json();
        const chats = document.getElementById('friendChats');
        console.log('response is ok');
        let Chatcontent = '';


        for (const conversation of data.f_conversations) {
            const personId = userId === conversation.sender ? conversation.receiver : conversation.sender
            const userObject = await get_user(personId);
            const user = userObject.user[0];

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
        console.log(chats);

    } else {
        document.getElementById('friendChats').innerHTML = `Error loading your conversations`;
    }
}

function toggleSidebar() {
    const circleButton = document.querySelector('.circle-button');
    const sidebar = document.getElementById('sidebar');
    const maincontent = document.getElementById('maincontent')

    if (sidebar.style.left === '0px') {
        sidebar.style.left = '-30%';
        circleButton.classList.toggle('collapsed');
        maincontent.classList.remove('shifted');

    } else {

        sidebar.style.left = '0px';
        circleButton.classList.toggle('toggled');
        maincontent.classList.add('shifted');
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

function show_public_conversation() {


    popups.forEach(popup => {
        popup.style.display = 'none';
    });
    conv_id = '66f9d9f7959aff99d674ed77'
    const mainContent = document.getElementById('maincontent');
    content = `
        <div class="chat-container">
        <i id="filter" class="fa-solid fa-filter"></i>
            <div id="chat-body" class="chat-body">
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

    mainContent.style.display = 'block'
    const text = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message');
    text.addEventListener('input', function () {
        if (text.value.trim() !== "") {
            sendButton.classList.add('active');
            sendButton.style.pointerEvents = 'auto'; // Enable clicking
        } else {
            sendButton.classList.remove('active');
            sendButton.style.pointerEvents = 'none'; // Disable clicking
        }
    });
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
    chatHistory.style.top = '105%'
    input.style.width = '94%'
    get_conversation(conv_id, 'public')
    toggleSidebar()

}

console.log(chatContainer);

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



search_button.addEventListener('click', async function (e) {
    e.preventDefault()
    show_spinner()
    let content = ''
    const title = document.getElementById('paper-title').value
    const projectbranch = document.getElementById('paper_project_branch').value
    const we_need = document.getElementById('paper_we_need').value
    const language = document.getElementById('language-input').value
    const id = document.getElementById('ID').value
    const paper_result = document.getElementById('paper-result')
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
    } catch (error) {
        console.log(error);

    }
    finally {
        hide_spinner()
    }
})

async function show_search_result(Paperdata) {
    let content = "";
    await fetch('/api/search-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: Paperdata
    }).then(response => response.json()).then(data => {


        const paper_result = document.getElementById('paper-result')
        if (data.papers.length == 0) {
            paper_result.innerHTML = `
            <p> No matches</p>
            `
        }

        data.papers.forEach(paper => {

            content += `    
            
                <div class="paper-line">
                    <div class="paperinfo">
                        <i id="joined-paper" class="fas fa-file"></i>
                        <span class="paper-title"><strong>${paper.title}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-study"><strong>${paper.type_of_study}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-we-need"><strong id="need">We Need:</strong> <strong>${paper.we_need}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-branch"><strong>${paper.project_branch}</strong></span>
                        <span class="dash"><strong>-</strong></span>
                        <span class="paper-tags"><strong>${paper.language}</strong></span>
                    </div>
                    <button onclick="join_paper('${paper._id}')" id="join-paper-${paper._id}">Join</button>
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
                            <img src="/profile_images/${u.profile_picture}" alt="Profile Picture">
                            <span class="paper-title"><strong>${u.name}</strong></span>
                            <span class="dash"><strong>-</strong></span>
                            <span class="paper-study"><strong>${u._id}</strong></span>
                        </div>
                        <button id="send-friend-message" onclick="show_Single_conversation('${u._id}')">send a message</button>
                    </div>
                `;
            });
        }

        friend_result.innerHTML = content;
    } catch (err) {
        console.error('Error during fetch:', err);
        // You can handle any errors here
    } finally {
        // Hide spinner after everything is done

    }
});











