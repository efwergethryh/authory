const API_BASE_URL = 'http://145.223.34.195';
const userType = document.getElementById('userType').value
let popups = []
let direction;
const socket = io(API_BASE_URL, {
    // transports: ['polling', 'websocket'],
    // query: {
    //     userId: userId
    // }
});
function isMobile() {
    return /Mobi|Android|iPhone|iPod|Opera Mini/i.test(navigator.userAgent);
}
popups = userType === "2" ? [
    document.getElementById('startpost-popup'),
    document.getElementById('yourposts-popup'),
] : [
    document.getElementById('users-popup'),
    document.getElementById('admins-popup'),
    document.getElementById('yourposts-popup'),
]


const mainContent = document.getElementById('maincontent')
let selectedFiles = [];
const spinner =
    document.getElementById('loading-spinner')
let offset = 5
let topValue = -24
let tags = new Set();
const tools = `
<section class="tools">
    <input id="text-fontFamily" class="fontFamily" title="Font family" value="Arial, sans-serif">
    
    <div class="text-fontSize">
        <i id="decrease-font-size">
            <svg height="24" viewBox="0 0 24 24" width="60" xmlns="http://www.w3.org/2000/svg">
                <path class="heroicon-ui" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm4-8a1 1 0 0 1-1 1H9a1 1 0 0 1 0-2h6a1 1 0 0 1 1 1z"></path>
            </svg>
        </i>
       <input id="text-font-size" value="18">
       <i id="increase-font-size    ">
            <svg width="26" id="increase" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="m12.002 2c5.518 0 9.998 4.48 9.998 9.998 0 5.517-4.48 9.997-9.998 9.997-5.517 0-9.997-4.48-9.997-9.997 0-5.518 4.48-9.998 9.997-9.998zm0 1.5c-4.69 0-8.497 3.808-8.497 8.498s3.807 8.497 8.497 8.497 8.498-3.807 8.498-8.497-3.808-8.498-8.498-8.498zm-.747 7.75h-3.5c-.414 0-.75.336-.75.75s.336.75.75.75h3.5v3.5c0 .414.336.75.75.75s.75-.336.75-.75v-3.5h3.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3.5v-3.5c0-.414-.336-.75-.75-.75s-.75.336-.75.75z" fill-rule="nonzero"></path>
            </svg>
        </i>
       
    </div>

    <input type="color" name="color" id="text-color-picker" title="Font color">
    
    <div class="divider"></div>
    
    <i id="bold-text" class="fa-solid fa-bold" title="Bold"></i>
    <i id="italic-text" class="fa-solid fa-italic" title="Italic"></i>
    <i id="underline-text" class="fa-solid fa-underline" title="Underline"></i>
    <i id="insert-divider" class="fa-solid fa-window-minimize" title="Insert Divider"></i>
    
    <div class="divider"></div>

    <i id="make-bullet-list" class="fa-solid fa-caret-right" title="Bullet List"></i>
    
    <div class="divider"></div>

    <i id="text-align-left" class="fa-solid fa-align-left" title="Align Left"></i>
    <i id="text-align-right" class="fa-solid fa-align-right" title="Align Right"></i>
    <i id="text-align-center" class="fa-solid fa-align-center" title="Align Center"></i>
    
    <div class="divider"></div>
    
    <label for="update-post-image">
       <i id="choose-post-image" class="fa-regular fa-image" title="Upload Image"></i>
    </label>
    <input type="file" multiple id="update-post-image" name="post-image" style="display: none;" accept="image/*">
</section>`;
let currentlang = sessionStorage.getItem('lang') || 'en'

console.log('current lang', currentlang);

async function loadTranslation() {
    const response = await fetch(`/translations/${currentlang}`, {
        method: "GET"
    });
    const translations = await response.json();

    console.log('translations', translations);

    if (userType === "3") {
        document.getElementById('Users').querySelector('.toggle-item').textContent = translations.sidebar.users;
        document.getElementById('admins').querySelector('.toggle-item').textContent = translations.sidebar.admins;
        document.getElementById('owner-posts').querySelector('.toggle-item').textContent = translations.sidebar.posts;
    }
    else {
        document.getElementById('new-post').textContent = translations.sidebar.newPost
        document.getElementById('your-posts').textContent = translations.sidebar.yourPosts
    }

    document.getElementById('sign-out').textContent = translations.topBar.signOut
    // document.getElementById('settings').textContent = translations.topBar.settings
    // document.getElementById('settings-popup').querySelector('label').textContent = translations.settingsPopup.chooseLanguage
    document.getElementById('degrade-admin').textContent = translations.userTools.degradeAdmin
    document.getElementById('set-admin').textContent = translations.userTools.setAdmin
    document.getElementById('ban-user').textContent = translations.userTools.banUser

    return translations
}


let li_id = 0

function setLang(lang) {
    console.log('lang', lang);

    sessionStorage.setItem('lang', lang)
    currentlang = lang
    location.reload()
} function show_spinner() {

    spinner.style.display = 'block'
}
function hide_spinner() {
    spinner.style.display = 'none'
}
const fileInput = document.getElementById('post-image');

let currentSelection;
let range;
let sizeNumber = 18;
let listMode = false
let popup_buttons = []
popup_buttons = userType === "2" ? [
    document.getElementById('paper-toggle'),
    document.getElementById('paper-toggle-2'),
    // document.getElementById('paper-toggle-3'),

] : [
    document.getElementById('owner-paper-toggle'),
    document.getElementById('owner-paper-toggle-2'),
    document.getElementById('owner-paper-toggle-3')
];
console.log('popups', popups, 'buttons', popup_buttons);
const editableDiv = document.getElementById('post-text');
// function toggleSidebar() {
//     const circleButton = document.querySelector('.circle-button');
//     const sidebar = document.getElementById('sidebar');
//     const maincontent = document.getElementById('maincontent')

//     if (sidebar.style.left === '0px') {
//         sidebar.style.left = '-30%';
//         circleButton.classList.toggle('collapsed');
//         maincontent.classList.remove('shifted');

//     } else {

//         sidebar.style.left = '0px';
//         circleButton.classList.toggle('toggled');
//         maincontent.classList.add('shifted');
//     }
// }
function toggleSidebar() {
    const circleButton = document.querySelector('.circle-button');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('maincontent');
    const label = document.getElementById('joined')
    console.log(label);

    // Check if the sidebar is closed and toggle accordingly
    if (sidebar.classList.contains('closed')) {
        // Sidebar is closed, open it
        sidebar.classList.remove('closed');
        sidebar.classList.add('open');
        mainContent.classList.add('shifted');
        // label.classList.add('shifted');
        // Shift main content to make space for the sidebar
        circleButton.classList.remove('collapsed');
        circleButton.classList.add('toggled'); // Rotate the button
    } else {
        // Sidebar is open, close it
        sidebar.classList.remove('open');
        sidebar.classList.add('closed');
        mainContent.classList.remove('shifted');
        // label.classList.remove('shifted'); // Revert main content position
        circleButton.classList.remove('toggled');
        circleButton.classList.add('collapsed');  // Reset button rotation
    }
}
function getCurrentSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return null; // No selection
    }
    return selection;
}

function getSelectedText() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        currentSelection = selection.toString();
        range = selection.getRangeAt(0) // Store selected text globally
        console.log("Selected Text:", currentSelection); // Debugging output
    }

}
function getCursorPosition() {
    const selection = window.getSelection();
    console.log(selection.toString());

    return selection;
}

function keyHandler(event) {
    // Check if the Enter key is pressed
    if (event.key === 'Enter') {
        // Exit immediately if listMode is off
        console.log('enter is pressed');

        if (!listMode) {
            event.preventDefault()

            const br = document.createElement('br');

            insertElementAtCursor(br)
            return;


        }



        event.preventDefault();
        const editableDiv = document.getElementById('post-text');
        let list = editableDiv.querySelector('.chapters-list');

        if (!list) {
            console.error("No list found. Creating a new list.");
            list = document.createElement('ul');
            list.className = 'chapters-list';
            editableDiv.appendChild(list);
        }

        // Create a new list item
        const li = document.createElement('li');
        li.id = `li-${li_id}`;

        // Create title container
        const titleContainer = document.createElement('span');
        titleContainer.className = 'title-container';

        // Create the disclosure icon
        const icon = document.createElement('span');
        icon.contentEditable = false;
        icon.className = 'list-icon';
        icon.innerHTML = '&#9654;';

        const title = document.createElement('span');
        title.className = 'title-text';
        title.contentEditable = true;
        title.textContent = 'Your title';
        titleContainer.appendChild(icon);
        titleContainer.appendChild(title);
        li.appendChild(titleContainer);

        const section = document.createElement('section');
        section.id = `section-${li_id}`;
        section.contentEditable = true;
        section.style.display = 'none';
        section.textContent = 'New section content...';
        section.addEventListener('click', function () {
            listMode = false
            const make_list = document.getElementById('make-list')
            console.log('make_list', make_list);
            make_list.classList.remove('active')
        })
        li.appendChild(section);

        const br = document.createElement('br')

        list.appendChild(li);
        list.appendChild(br)

        li_id++;

        icon.addEventListener('click', function (event) {
            event.stopPropagation();
            if (section.style.display === 'block') {
                section.style.display = 'none';
                icon.innerHTML = titleContainer.style.direction === 'ltr' ? '&#9654;' : '&#9654;';
            } else {
                section.style.display = 'block';
                icon.innerHTML = '&#9660;';
            }
        });
    }
}
function edit_keyHandler(event) {
    // Check if the Enter key is pressed
    if (event.key === 'Enter') {
        // Exit immediately if listMode is off

        if (!listMode) {
            event.preventDefault()
            // const selection = window.getSelection();

            // Check if there's a valid selection
            const br = document.createElement('br'); // Create a new line element

            insertElementAtCursor(br)
            return;


        }



        event.preventDefault();
        const editableDiv = document.getElementById('edit-post-text');
        let list = editableDiv.querySelector('.chapters-list');

        if (!list) {
            console.error("No list found. Creating a new list.");
            list = document.createElement('ul');
            list.className = 'chapters-list';
            editableDiv.appendChild(list);
        }

        // Create a new list item
        const li = document.createElement('li');
        li.id = `li-${li_id}`;

        // Create title container
        const titleContainer = document.createElement('span');
        titleContainer.className = 'title-container';

        // Create the disclosure icon
        const icon = document.createElement('span');
        icon.contentEditable = false;
        icon.className = 'list-icon';
        icon.innerHTML = '&#9654;';

        const title = document.createElement('span');
        title.className = 'title-text';
        title.contentEditable = true;
        title.textContent = 'Your title';
        titleContainer.appendChild(icon);
        titleContainer.appendChild(title);
        li.appendChild(titleContainer);

        const section = document.createElement('section');
        section.id = `section-${li_id}`;
        section.contentEditable = true;
        section.style.display = 'block';

        section.addEventListener('click', function () {
            listMode = false

        })
        li.appendChild(section);

        const br = document.createElement('br')

        list.appendChild(li);
        list.appendChild(br)

        li_id++;

        icon.addEventListener('click', function (event) {
            event.stopPropagation();
            if (section.style.display === 'block') {
                section.style.display = 'none';
                icon.innerHTML = titleContainer.style.direction === 'ltr' ? '&#9654;' : '&#9654;';
            } else {
                section.style.display = 'block';
                icon.innerHTML = '&#9660;';
            }
        });
    }
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
document.addEventListener('DOMContentLoaded', async () => {
    if (isMobile()) {

        document.getElementById('sidebar').classList.add('closed')
        document.getElementById('maincontent').classList.remove('shifted')
        document.querySelector('.circle-button').classList.add('collapsed')
        // document.getElementById('home').addEventListener('click', toggleSidebar)
        // document.getElementById('notifications-button').addEventListener('click', toggleSidebar)
        popup_buttons.forEach((button) => {

            button.addEventListener('click', toggleSidebar)
        })
    }
    await loadTranslation()
    const toggleLinks = document.querySelectorAll('.toggle-link');
    const fonts = document.querySelectorAll('.fonts-list a');

    const post_text = document.getElementById('post-text')
    const profileImage = document.getElementById('profileImage')
    const settings = document.getElementById('settings')
    const profileSpan = document.getElementById('profile-span')
    const settings_popup = document.getElementById('settings-popup')


    profileImage.addEventListener('click', function (e) {
        e.stopPropagation()
        profileSpan.style.display = 'flex'
    })
    
    document.addEventListener('click', function (event) {
        const profileSpan = document.getElementById('profile-span');

        if (profileSpan.style.display === 'flex') {
            if (!profileSpan.contains(event.target)) {
                profileSpan.style.display = 'none';
            }
        }
        if (settings_popup.style.display === 'block') {
            if (!settings_popup.contains(event.target)) {
                settings_popup.style.display = 'none';
            }
        }
    });



    fonts.forEach(font => {
        font.addEventListener('click', function (e) {
            e.preventDefault()
            document.getElementById('fontFamily').value = font.textContent
            adjustFont(null, null, font.textContent, false, false, false)
            const font_list = document.getElementById('fonts-list')
            font_list.style.display = 'none'
        });
    });
    toggleLinks.forEach(toggleLink => {
        toggleLink.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent the default anchor click behavior
            // Check if the clicked element is a sublist item
            if (event.target.tagName.toLowerCase() === 'li') {
                return; // Do nothing if a sublist item is clicked
            }
            toggleLinks.forEach(link => {
                const container = link.querySelector('.toggle-tab-container, .toggle-tab-container-2, .toggle-tab-container-3');
                if (container) {
                    container.classList.remove('active');
                }
            });
            const toggleContainer = this.querySelector('.toggle-tab-container, .toggle-tab-container-2, .toggle-tab-container-3');

            toggleContainer.classList.toggle('active');
        });
    });
    console.log('user Type', userType);

    popup_buttons.forEach(async (button, index) => {
        // console.log('button', button);

        // button.removeEventListener('click', togglePopup); // Ensure no duplicate listeners
        if (button) button.addEventListener('click', togglePopup);
        // console.log('popup', popups[index]);

        async function togglePopup() {

            const translations = await loadTranslation()
            console.log('main content', mainContent)

            mainContent.textContent = '';
            popups.forEach((popup, popupIndex) => {
                if (popupIndex !== index) {
                    console.log('popup', popup);

                    popup.style.display = 'none';
                }
            });

            if (popups[index]) {


                if (popups[index].style.display === 'flex') {
                    popups[index].style.display = 'none';
                } else {

                    popups[index].style.display = 'flex';


                    popups[index].remove()
                    mainContent.innerHTML = popups[index].innerHTML;

                    console.log('index', index, 'Popup', popups[index]);
                    if (popups[index].id === 'users') {

                    }


                    const handleNewPost = (e) => {
                        e.preventDefault();
                        new_post();
                    };
                    if (popups[index].id === 'startpost-popup' || popups[index].id === 'yourposts-popup') {


                        document.getElementById('publish-post').textContent = translations.sidebar.newPost
                        document.getElementById('posts-label').textContent = translations.sidebar.yourPosts

                        document.getElementById('post-title').placeholder = translations.postForm.titlePlaceholder

                        document.getElementById('placeholder').textContent = translations.postForm.text_placeholder
                        document.getElementById('tags').placeholder = translations.startPaper.tags.placeholder

                        document.getElementById('start_post').textContent = translations.postForm.publishButton

                        mainContent.addEventListener('mouseup', (e) => {
                            console.log('id', e.target.id, ',tag name', e.target.tagName);

                            const targetId =
                                e.target.id === 'maincontent' ? "" : !e.target.id ? "post-text" : e.target.id


                            if (targetId === 'post-text'  || e.target.tagName === 'UL') {


                                setTimeout(() => {
                                    console.log('selecting');

                                    getSelectedText();

                                    const tempSpan = document.createElement('span');
                                    const selectedContent = range.extractContents();
                                    tempSpan.appendChild(selectedContent);

                                    // Insert the styled span at the selection
                                    range.insertNode(tempSpan);

                                    // Get computed styles for `tempSpan`
                                    const computedStyle = window.getComputedStyle(tempSpan);
                                    const styles = {
                                        fontWeight: computedStyle.fontWeight,
                                        fontStyle: computedStyle.fontStyle,
                                        textDecoration: computedStyle.textDecoration,
                                        fontSize: computedStyle.fontSize,
                                        fontFamily: computedStyle.fontFamily,
                                        color: computedStyle.color,
                                    };
                                    console.log(styles);

                                    document
                                        .getElementById('bold')
                                        .classList[styles.fontWeight >= 500 ? 'add' : 'remove']('active');

                                    // Toggle 'active' class for italic
                                    document
                                        .getElementById('italic')
                                        .classList[styles.fontStyle === 'italic' ? 'add' : 'remove']('active');

                                    // Toggle 'active' class for underline
                                    document
                                        .getElementById('underline')
                                        .classList[styles.textDecoration.includes('underline') ? 'add' : 'remove']('active');

                                    document.getElementById('color-picker').value = rgbToHex(styles.color);
                                    document.getElementById('font-size').value = styles.fontSize;
                                }, 0);
                            }


                            

                        });


                        document.getElementById('fontFamily').addEventListener('click', function (e) {
                            e.preventDefault()
                            e.stopPropagation()
                            const font_list = document.getElementById('fonts-list')
                            console.log(font_list);

                            font_list.style.display = 'flex'
                        })

                        document.getElementById('color-picker').addEventListener('change', function () {
                            const color = this.value

                            adjustFont(color)
                        })
                        document.getElementById('bold').addEventListener('click', function (e) {
                            e.preventDefault()
                            if (this.classList.contains('active')) {
                                this.classList.remove('active')
                            } else {
                                this.classList.add('active')
                            }
                            adjustFont(null, null, null, true)

                        })
                        document.getElementById('underline').addEventListener('click', function (e) {
                            e.preventDefault()
                            if (this.classList.contains('active')) {
                                this.classList.remove('active')
                            } else {
                                this.classList.add('active')
                            }
                            adjustFont(null, null, null, false, true)
                        })
                        document.getElementById('italic').addEventListener('click', function (e) {
                            e.preventDefault()
                            if (this.classList.contains('active')) {
                                this.classList.remove('active')
                            } else {
                                this.classList.add('active')
                            }
                            adjustFont(null, null, null, false, false, true)
                        })
                        document.getElementById('increase').addEventListener('click', function (e) {
                            e.preventDefault()

                            const fontSize = document.getElementById('font-size')
                            sizeNumber += 1
                            fontSize.value = sizeNumber
                            adjustFont(null, sizeNumber)
                        })
                        document.getElementById('decrease').addEventListener('click', function (e) {
                            e.preventDefault()
                            const fontSize = document.getElementById('font-size')
                            sizeNumber -= 1
                            fontSize.value = sizeNumber
                            adjustFont(null, sizeNumber)
                        })
                        document.getElementById('align-left').addEventListener('click', function (e) {
                            e.preventDefault()
                            if (this.classList.contains('active')) {
                                this.classList.remove('active')
                            } else {
                                this.classList.add('active')
                            }
                            adjustFont(null, null, null, false, false, false, true, false, false)
                        })
                        document.getElementById('align-right').addEventListener('click', function (e) {
                            e.preventDefault()
                            if (this.classList.contains('active')) {
                                this.classList.remove('active')
                            } else {
                                this.classList.add('active')
                            }
                            adjustFont(null, null, null, false, false, false, false, true, false)
                        })
                        document.getElementById('align-center').addEventListener('click', function (e) {
                            e.preventDefault()
                            if (this.classList.contains('active')) {
                                this.classList.remove('active')
                            } else {
                                this.classList.add('active')
                            }
                            adjustFont(null, null, null, false, false, false, false, false, true)
                        })
                        document.getElementById('make-list').addEventListener('click', make_list)
                        document.getElementById('divide').addEventListener('click', divider)

                        const post_image = document.getElementById('post-image')
                        post_image.addEventListener('change', function (event) {

                            const files = Array.from(post_image.files);
                            selectedFiles = selectedFiles.concat(files);

                            console.log('Post image', post_image);
                            if (post_image.files && post_image.files[0]) {
                                const img = document.createElement('img');
                                img.className = 'post-image';

                                img.src = URL.createObjectURL(post_image.files[0]);

                                img.onload = () => URL.revokeObjectURL(img.src);

                                insertElementAtCursor(img)
                                // updateImageSrc(event.target);
                            }

                        });



                        //New post listeners
                        if (popups[index].id === 'startpost-popup') {
                            console.log('this is a start post popup');

                            const post_overlay = document.getElementById('tags-overlay');
                            const tags_input = document.getElementById('tags');

                            let overlayText = '';

                            tags_input.addEventListener("input", function () {
                                const update_tags_value = tags_input.value.trim();
                                
                                overlayText = '';

                                const tagRegex = /#[a-zA-Z0-9-_\u0600-\u06FF]+(?=\s|$)/g;
                                const matches = update_tags_value.match(tagRegex);

                                tags.clear();

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
                                post_overlay.innerHTML = overlayText;
                            });

                            post_overlay.innerHTML = overlayText;
                            const startPostButton = document.getElementById('start_post');
                            startPostButton.removeEventListener('click', handleNewPost);
                            startPostButton.addEventListener('click', handleNewPost);
                        }


                    }
                    else {
                        document.getElementById('users-label').textContent = translations.sidebar.users
                        document.getElementById('admins-label').textContent = translations.sidebar.admins

                    }


                }
            }



        }
    });
    document.addEventListener('click', function (e) {

        const font_list = document.getElementById('fonts-list');
        console.log(font_list);

        // Toggle the display style of font_list
        if (font_list.style.display === 'flex') {
            font_list.style.display = 'none';
        }
    });


    document.getElementById('posts').addEventListener('click', async function () {
        show_spinner()
        try {

            const response = await fetch('/api/posts', {
                method: "GET",
            })
            if (response.ok) {

                const data = await response.json()
                console.log(data);
                const posts = document.getElementById('Myposts')
                let content = ``
                data.posts.forEach(post => {
                    content += `
                    <div onclick="showPost('${post._id}')" class="post" id="post-${post._id}">
                        <h>${post.title}</h>
                        <div class="post-tools" >
                            <i onclick="event.stopPropagation(); edit_post('${post._id}')" class="pen fa-regular fa-pen-to-square"></i>
                            <i onclick="event.stopPropagation(); delete_post('${post._id}')"  class="trash-can fa-regular fa-trash-can"></i>
                        </div>
                    </div>
                    `
                })
                posts.innerHTML = content
                posts.style.display = 'flex'
                hide_spinner()
            }
        } catch (error) {

        }
    })

});


function divider() {
    const divider = document.createElement('hr');
    divider.style.border = 'px solid grey'
    divider.style.backgroundColor = 'grey'

    insertElementAtCursor(divider)
}





document.getElementById('Users').addEventListener('click', async function () {
    show_spinner()
    const response = await fetch(`/api/users/${1}`, {
        method: "GET",
    })
    if (response.ok) {

        const data = await response.json()

        const users = document.getElementById('users')
        console.log('users popup', users);
        let content = ``
        let userId
        data.users.forEach(user => {
            content += `
                
                <div class="user" id="user-${user._id}">
                    <div class="user-info">
                        <h>user</h>
                        <h>-</h> 
                        <h>${user._id}</h>
                        <h>-</h> 
                        <h>${user.email}</h>
                        <h>-</h> 
                        <h>${user.name}</h>
                    </div>
                    <div class="post-tools" >
                    <i id="user-settings-${user._id}" class=" user-sittings fa-solid fa-ellipsis-vertical">
                    </i>
                    
                    </div>
                </div>
            `
        })
        users.innerHTML = content
        const firstUser = document.querySelector('.user:first-child');
        const user_tool = document.getElementById('user-tools')
        data.users.forEach(user => {
            const user_setting = document.getElementById(`user-settings-${user._id}`)

            user_setting.addEventListener('click', function (e) {

                e.stopPropagation();

                userId = user._id;
                const parentUserElement = document.getElementById(`user-${user._id}`);

                const fUser = user_setting.closest('.user');

                if (!user_tool) {
                    console.error('No user tools found for user:', user._id);
                    return;
                }

                user_tool.style.display = 'flex';

                // const allusers = document.querySelectorAll('.user');
                // const index = Array.from(allusers).indexOf(fUser);
                if (fUser === firstUser) {
                    console.log('first user');

                    user_tool.style.top = `16vw`; // First user gets a fixed top
                } else {
                    const rect = parentUserElement.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const viewportWidth = window.innerWidth;


                    // Calculate initial top position
                    let newTop = ((rect.top + rect.height) / viewportWidth) * 100; // Position directly below the parent element

                    // Prevent overflow: ensure it doesn't go beyond the viewport
                    const maxAllowedTop = viewportHeight - user_tool.offsetHeight - 10; // 10px padding from bottom
                    if (newTop > maxAllowedTop) {
                        newTop = maxAllowedTop;
                    }

                    // Set calculated position
                    user_tool.style.top = `${newTop}vw`;

                    console.log('Dropdown position:', { newTop, rect }); // Set new top position
                }
            });



            // console.log('first user', firstUser);

        });
        users.style.display = 'flex'
        document.addEventListener('click', function (e) {
            const user_tools = document.getElementById('user-tools')

            if (user_tools.style.display === 'flex' && !user_tools.contains(e.target)) user_tools.style.display = 'none'
        })

        document.getElementById('ban-user').addEventListener('click', async function (e) {
            const response = await fetch(`/api/ban-user/${userId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (response.ok) {
                const data = await response.json()
                console.log(data);

            }
        })
        document.getElementById('set-admin').addEventListener('click', async function (e) {
            const response = await fetch(`/api/set-admin/${userId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (response.ok) {
                const data = await response.json()
                console.log(data);

            }
        })
        hide_spinner()
    }

});
document.getElementById('owner-posts').addEventListener('click', async function () {
    // resetPopups()
    show_spinner()
    try {

        const response = await fetch('/api/posts', {
            method: "GET",
        })
        if (response.ok) {

            const data = await response.json()
            console.log(data);
            const posts = document.getElementById('Myposts')
            let content = ``
            data.posts.forEach(post => {
                content += `
                    <div onclick="showPost('${post._id}')" class="post" id="post-${post._id}">
                        <h>${post.title}</h>
                        <div class="post-tools" >
                            <i onclick="event.stopPropagation(); edit_post('${post._id}')" class="pen fa-regular fa-pen-to-square"></i>
                            <i onclick="event.stopPropagation(); delete_post('${post._id}')"  class="trash-can fa-regular fa-trash-can"></i>
                        </div>
                    </div>
                    `
            })
            posts.innerHTML = content
            posts.style.display = 'flex'

            hide_spinner()
        }
    } catch (error) {

    }
    // show_spinner()
    // try {

    //     const response = await fetch('/api/posts', {
    //         method: "GET",
    //     })
    //     if (response.ok) {

    //         const data = await response.json()
    //         console.log(data);
    //         const posts = document.getElementById('Myposts')

    //         let content = ``
    //         for (const post of data.posts) {
    //             const User = await get_user(post.user_id);
    //             const user = await User.user[0];
    //             console.log(user);

    //             content += `
    //                 <div onclick="showPost('${post._id}')" class="post" id="post-${post._id}">
    //                     <h>${user.user_type === 2 ? 'Admin' : user.user_type === 3 ? 'Owner' : 'User'}</h>
    //                     <h>-</h>
    //                     <h>${user.name}</h>
    //                     <h>-</h>
    //                     <h>${user._id}</h>
    //                     <h>-</h>
    //                     <h>${user.email}</h>
    //                     <h>-</h>
    //                     <h>"${post.title}"</h>
    //                     <div class="post-tools">
    //                         <i onclick="event.stopPropagation(); edit_post('${post._id}')" class="pen fa-regular fa-pen-to-square"></i>
    //                         <i onclick="event.stopPropagation(); delete_post('${post._id}')" class="trash-can fa-regular fa-trash-can"></i>
    //                     </div>
    //                 </div>
    //             `;
    //         }
    //         posts.innerHTML = content
    //         console.log(posts);

    //         document.getElementById('yourposts-popup').style.display = 'flex'
    //         hide_spinner()
    //     }
    // } catch (error) {
    //     console.log(error);

    // }
});
document.getElementById('admins').addEventListener('click', async function () {
    // resetPopups()
    show_spinner()
    const response = await fetch(`/api/users/${2}`, {
        method: "GET",
    })
    if (response.ok) {

        const data = await response.json()
        console.log(data);
        const users = document.getElementById('Admins')

        let content = ``
        let adminId
        data.users.forEach(user => {

            content += `
            
            <div class="user" id="user-${user._id}">
                <div class="user-info">
                    <h>user</h>
                    <h>-</h> 
                    <h>${user._id}</h>
                    <h>-</h> 
                    <h>${user.email}</h>
                    <h>-</h> 
                    <h>${user.name}</h>
                </div>
                <div class="post-tools" >
                <i id="admin-settings-${user._id}" class="fa-solid fa-ellipsis-vertical"></i>
                
                </div>
            </div>
            `
        })
        users.innerHTML = content

        // data.users.forEach(user => {
        //     document.getElementById(`admin-settings-${user._id}`).addEventListener('click', function (e) {
        //         e.stopPropagation();
        //         adminId = user._id
        //         const admin_tools = document.getElementById('admin-tools');
        //         admin_tools.style.display = 'flex';
        //         // Set the user ID in the tool element for reference
        //     });
        // });
        const firstUser = document.querySelector('.user:first-child');
        const user_tool = document.getElementById('admin-tools')
        data.users.forEach(user => {
            const user_setting = document.getElementById(`admin-settings-${user._id}`)

            user_setting.addEventListener('click', function (e) {

                e.stopPropagation(); // Prevent click event propagation

                // Fetch the user ID from the clicked button
                adminId = user._id;
                const parentUserElement = document.getElementById(`user-${user._id}`);

                // Find the tools container relative to this user
                const fUser = user_setting.closest('.user');

                if (!user_tool) {
                    console.error('No user tools found for user:', user._id);
                    return;
                }

                user_tool.style.display = 'flex';

                // Calculate top position based on the user element's position
                const allusers = document.querySelectorAll('.user');
                const index = Array.from(allusers).indexOf(fUser);
                if (fUser === firstUser) {
                    console.log('first user');

                    user_tool.style.top = `16vw`; // First user gets a fixed top
                } else {
                    const rect = parentUserElement.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;

                    // Calculate initial top position
                    let newTop = rect.top + rect.height; // Position directly below the parent element

                    // Prevent overflow: ensure it doesn't go beyond the viewport
                    const maxAllowedTop = viewportHeight - user_tool.offsetHeight - 10; // 10px padding from bottom
                    if (newTop > maxAllowedTop) {
                        newTop = maxAllowedTop;
                    }

                    user_tool.style.top = `${newTop}px`;

                }
            });


        });
        document.addEventListener('click', function (e) {
            const admin_tools = document.getElementById('admin-tools')
            if (admin_tools.style.display === 'flex' && !admin_tools.contains(e.target)) admin_tools.style.display = 'none'

        })
        document.getElementById('degrade-admin').addEventListener('click', async function (e) {
            const response = await fetch(`/api/degrade-admin/${adminId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (response.ok) {
                const data = await response.json()
                console.log(data);

            }
        })

        users.style.display = 'flex'
        hide_spinner()
    }
});

async function edit_post(id) {
    const translations = await loadTranslation()
    mainContent.style.overflowY = 'auto'
    show_spinner()
    let post_info = ''
    listMode = true
    const editPost = document.getElementById('editpost-popup')
    editPost.style.display = 'block'
    const response = await fetch(`/api/posts/${id}`, {
        method: "GET"
    })

    if (response.ok) {
        const data = await response.json();
        console.log(data);
        post_info = `
    <div class="editpost-popup">
    <i id="close-edit" class="fas fa-times"></i>
    <div class="input-group">
       <input type="text" value="${data.post.title}" name="name" id="text-post-title" required placeholder="${translations.postForm.titlePlaceholder}">
    </div>
    <table border="1" cellpadding="10" cellspacing="0">
       <tbody>
          <tr>
             ${tools}
          </tr>
          <tr>
             <div id="edit-post-text" contenteditable="true" class="editable-text">
                ${data.post.content}
             </div>
          </tr>
          <tr>
             <td>
                <div class="input-group">
                   <label for="name">Tags</label>
                   <div class="input-container">
                      <div id="post-tags-overlay" class="tags-overlay"></div>
                      <input type="text" id="post-tags" value="" name="name" placeholder="${translations.postForm.tagsPlaceholder}">
                   </div>
                </div>
             </td>
             <td><button onclick="update_post('${data.post._id}')" id="update_post">${translations.postForm.update}</button></td>
          </tr>
       </tbody>
    </table>
 </div>
    `
        editPost.innerHTML = post_info
        editPost.remove()
        mainContent.appendChild(editPost)
        addListeners()
        const listItems = document.querySelectorAll('.chapters-list li');
        const imageArray = data.post.post_image;
        listItems.forEach(li => {
            const titleContainer = li.querySelector('.title-container')
            // const title = titleContainer.querySelector('.title-text');
            const icon = titleContainer.querySelector('.list-icon');
            // const adjust_span = titleContainer.querySelector('span')
            icon.contentEditable = false
            const images = document.querySelectorAll('.post-image');
            const titleText = titleContainer.querySelector('.title-text');
            // Get the value of the input field
            if (titleText) {
                const span = `
                <span>${titleText.textContent}</span>`
                titleText.innerHTML = span;
            }

            // Convert the string to an array by splitting on the comma


            // Trim any whitespace from each element in the array
            const trimmedImageArray = imageArray.map(image => image.trim());

            // Output the result
            console.log(trimmedImageArray);

            // Check if the current src is a Blob URL
            images.forEach((image, index) => {
                if (image.src.startsWith('blob:') && index < imageArray.length) {
                    // Get the new source from the imageArray
                    let newSrc = imageArray[index];

                    // Trim any whitespace from the start and end of the newSrc
                    newSrc = newSrc.trim();

                    // // Remove 'public/' from the beginning of the path, if present

                    newSrc = newSrc.substring('public/'.length); // Using substring to remove 'public/'


                    // // Update backslashes to forward slashes
                    newSrc = newSrc.replace(/\\/g, '/');
                    newSrc = '/' + newSrc
                    // Set the new src for the image
                    image.src = newSrc; // Update the src with the cleaned-up path
                }
            });

            const section = li.querySelector('section')



            icon.addEventListener('click', function () {
                // Toggle the icon text
                icon.textContent = icon.textContent === '▼' ? '▶' : '▼';
                console.log(icon);

                // Toggle the section's display style
                if (section.style.display === 'block') {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });

        });
        const update_overlay = document.getElementById('post-tags-overlay');
        const update_tags = document.getElementById('post-tags');

        let overlayText = ''

        update_tags.addEventListener("input", function () {
            const update_tags_value = update_tags.value.trim(); // Get the current value of the input field
            console.log('tags', tags);

            // Reset overlayText on each input event and rebuild it
            overlayText = '';

            const tagRegex = /#[a-zA-Z0-9-_\u0600-\u06FF]+(?=\s|$)/g;
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

        hide_spinner()

    }
}

async function update_post(id) {
    document.getElementById('edit-post-text').contentEditable = false;

    // Prepare form data
    const formData = new FormData();
    const contentElement =  document.getElementById('edit-post-text')
    contentElement.setAttribute('direction', `${direction}`);
    contentElement.id='post-text'
    formData.append("content", contentElement.outerHTML);
    formData.append("title", document.getElementById('text-post-title').value);

    console.log('files', selectedFiles);

    selectedFiles.forEach(file => {
        console.log('file', file);

        formData.append('post-image', file);
    });
    for (const [k, v] of formData.entries()) {
        console.log(`${k} ${v}`);
    }
    const response = await fetch(`/api/update-post/${id}`, {
        method: "PUT",
        body: formData
    })
    if (response.ok) {

        document.getElementById('post-text').contentEditable = true;
    }
}

function addListeners() {
    

    

    document.getElementById('bold-text').addEventListener('click', function (e) {
        e.preventDefault();
        this.classList.toggle('active');
        adjustFont(null, null, null, true);
    });

    document.getElementById('underline-text').addEventListener('click', function (e) {
        e.preventDefault();
        this.classList.toggle('active');
        adjustFont(null, null, null, false, true);
    });

    document.getElementById('italic-text').addEventListener('click', function (e) {
        e.preventDefault();
        this.classList.toggle('active');
        adjustFont(null, null, null, false, false, true);
    });

    document.getElementById('increase-font-size').addEventListener('click', function (e) {
        e.preventDefault();
        const fontSize = document.getElementById('text-font-size');
        sizeNumber += 1;
        fontSize.value = sizeNumber;
        adjustFont(null, sizeNumber);
    });

    document.getElementById('decrease-font-size').addEventListener('click', function (e) {
        e.preventDefault();
        const fontSize = document.getElementById('text-font-size');
        sizeNumber -= 1;
        fontSize.value = sizeNumber;
        adjustFont(null, sizeNumber);
    });

    document.getElementById('text-fontFamily').addEventListener('click', function (e) {
        e.preventDefault();
        console.log('font-family');
        const font_list = document.getElementById('fonts-list');
        font_list.style.display = 'flex';
    });
    document.getElementById('text-color-picker').addEventListener('change', function () {
        const color = this.value;
        adjustFont(color);
    });
    document.getElementById('text-align-left').addEventListener('click', function (e) {
        e.preventDefault()
        if (this.classList.contains('active')) {
            this.classList.remove('active')
        } else {
            this.classList.add('active')
        }
        adjustFont(null, null, null, false, false, false, true, false, false)
    });

    document.getElementById('text-align-right').addEventListener('click', function (e) {
        e.preventDefault()
        if (this.classList.contains('active')) {
            this.classList.remove('active')
        } else {
            this.classList.add('active')
        }
        adjustFont(null, null, null, false, false, false, false, true, false)
    })

    document.getElementById('text-align-center').addEventListener('click', function (e) {
        e.preventDefault();
        this.classList.toggle('active');
        adjustFont(null, null, null, false, false, false, false, false, true);
    });

    document.getElementById('insert-divider').addEventListener('click', function (e) {
        e.preventDefault();
        const divider = document.createElement('hr');
        divider.style.border = '1px solid grey';
        divider.style.backgroundColor = 'grey';
        insertElementAtCursor(divider)
    });

    document.getElementById('text-fontFamily').addEventListener('click', function (e) {
        e.preventDefault()
        console.log('font-family');
        const font_list = document.getElementById('text-fonts-list')
        console.log(font_list);

        font_list.style.display = 'flex'
    })
    const fonts = document.querySelectorAll('.text-fonts-list a');
    console.log(fonts)

    fonts.forEach(font => {
        font.addEventListener('click', function (e) {
            console.log(font)
            e.preventDefault()
            e.stopPropagation()
            document.getElementById('text-fontFamily').value = font.textContent
            adjustFont(null, null, font.textContent, false, false, false)
            const font_list = document.getElementById('text-fonts-list')
            font_list.style.display = 'none'
        });

    });
    fonts.forEach(font => {
        font.addEventListener('mouseover', function (e) {
            e.preventDefault()
            adjustFont(null, null, font.textContent, false, false, false)

        })
    })
    const edit_post_text = document.getElementById('edit-post-text')
    // The container where images and other content are stored
    document.addEventListener('click', function (event) {
        const editpopup = document.getElementById('editpost-popup');

        // Check if the popup is visible and if the click was outside the popup
        if (editpopup.style.display === 'block' && !editpopup.contains(event.target)) {
            editpopup.style.display = 'none';
        }

    });
    document.getElementById('close-edit').addEventListener('click', function (event) {
        const editpopup = document.getElementById('editpost-popup');
        editpopup.style.display = 'none';
    });
    document.getElementById('update-post-image').addEventListener('change', function (e) {
        const post_image = document.getElementById('update-post-image')
        console.log('Post image', post_image);

        const files = Array.from(post_image.files);
        console.log('input files', post_image.files);

        selectedFiles = selectedFiles.concat(files);
        if (post_image.files && post_image.files[0]) {
            const img = document.createElement('img');
            img.className = 'post-image';

            img.src = URL.createObjectURL(post_image.files[0]);

            img.onload = () => URL.revokeObjectURL(img.src);

            insertElementAtCursor(img)
            updateImageSrc(e.target);
        }
    })
    if (edit_post_text) {
        const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach((mutation) => {
                if (mutation.type === "childList" && mutation.removedNodes.length > 0) {
                    mutation.removedNodes.forEach((node) => {
                        // If the removed node is an image
                        if (node.tagName === "IMG" && node.classList.contains("post-image")) {
                            const src = node.src;

                            // Find the index in selectedFiles based on the image src
                            const fileIndex = selectedFiles.findIndex(file => URL.createObjectURL(file) === src);

                            // Remove the file from selectedFiles if it exists
                            if (fileIndex > -1) selectedFiles.splice(fileIndex, 1);
                        }
                    });
                }
            });
        });

        // Configure the observer to watch for child list changes (additions/deletions)
        observer.observe(edit_post_text, { childList: true, subtree: true });
    } else {
        console.error('Element with ID "edit-post-text" not found');
    }
    document.getElementById('text-font-size').addEventListener('input', function (e) {
        e.preventDefault()
        adjustFont(null, this.value)
    })
    document.getElementById('make-bullet-list').addEventListener('click', make_text_list);
    edit_post_text.addEventListener('mouseup', () => {
        setTimeout(function () {
            getSelectedText();
            const tempSpan = document.createElement('span');
            const selectedContent = range.extractContents();
            tempSpan.appendChild(selectedContent);
            range.insertNode(tempSpan);
            const computedStyle = window.getComputedStyle(tempSpan);
            const styles = {
                fontWeight: computedStyle.fontWeight,
                fontStyle: computedStyle.fontStyle,
                textDecoration: computedStyle.textDecoration,
                fontSize: computedStyle.fontSize,
                fontFamily: computedStyle.fontFamily,
                color: computedStyle.color,
            };
            console.log(styles);

            document.getElementById('bold-text').classList[styles.fontWeight >= 500 ? 'add' : 'remove']('active');

            // Toggle 'active' class for italic
            document.getElementById('italic-text').classList[styles.fontStyle === 'italic' ? 'add' : 'remove']('active');

            // Toggle 'active' class for underline
            document.getElementById('underline-text').classList[styles.textDecoration.includes('underline') ? 'add' : 'remove']('active');
            document.getElementById('text-color-picker').value = rgbToHex(styles.color)
            document.getElementById('font-size').value = styles.fontSize

        }, 0);

    });

}

// function insertElementAtCursor(object) {

//     const editableDiv = document.getElementById('post-text')
//     const editableDiv_edit = document.getElementById('edit-post-text')
//     if (editableDiv) {

//         editableDiv.appendChild(object)}
//     if (editableDiv_edit) editableDiv_edit.appendChild(object)
//     if (!range) {
//         console.log('object', Object);


//     }

//     else {
//         console.log('Not');

//         range.deleteContents();
//         range.insertNode(object);

//         range.setStartAfter(object);
//         range.setEndAfter(object);
//         if (currentSelection) {
//             currentSelection.removeAllRanges();
//             currentSelection.addRange(range);
//         }
//     }
// }
// function insertElementAtCursor(object) {
//     const editableDiv = document.getElementById('post-text');
//     const editableDiv_edit = document.getElementById('edit-post-text');

//     // Fallback for appending the element directly
//     if (!range) {
//         if (editableDiv) editableDiv.appendChild(object);
//         if (editableDiv_edit) editableDiv_edit.appendChild(object);
//         console.log('No range, appending directly');
//         return;
//     }

//     // Insert at the cursor position
//     range.deleteContents();
//     range.insertNode(object);

//     // Ensure the cursor moves after the inserted object
//     range.setStartAfter(object);
//     range.setEndAfter(object);

//     if (currentSelection) {
//         currentSelection.removeAllRanges();
//         currentSelection.addRange(range);
//     }

//     // Add a small hack for <br> visibility quirks
//     if (object.tagName === "BR") {
//         const spacer = document.createTextNode('\u200B'); // Zero-width space
//         range.insertNode(spacer);
//         range.setStartAfter(spacer);
//         range.setEndAfter(spacer);

//         currentSelection.removeAllRanges();
//         currentSelection.addRange(range);
//     }

//     console.log('Element inserted and cursor adjusted.');
// }
function insertElementAtCursor(object) {
    const editableDiv = document.getElementById('post-text');
    const editableDiv_edit = document.getElementById('edit-post-text');

    // Ensure currentSelection is always retrieved
    const currentSelection = window.getSelection();
    if (!currentSelection) {
        console.error("No selection available.");
        return;
    }

    // Fallback for appending the element directly
    if (!range) {
        if (editableDiv) editableDiv.appendChild(object);
        if (editableDiv_edit) editableDiv_edit.appendChild(object);
        console.log('No range, appending directly');
        return;
    }

    // Insert at the cursor position
    // range.deleteContents();
    range.insertNode(object);

    // Ensure the cursor moves after the inserted object
    range.setStartAfter(object);
    range.setEndAfter(object);

    // Properly update the selection
    currentSelection.removeAllRanges();
    currentSelection.addRange(range);

    // Add a small hack for <br> visibility quirks
    if (object.tagName === "BR") {
        const spacer = document.createTextNode('\u200B'); // Zero-width space
        range.insertNode(spacer);
        range.setStartAfter(spacer);
        range.setEndAfter(spacer);

        currentSelection.removeAllRanges();
        currentSelection.addRange(range);
    }

    console.log('Element inserted and cursor adjusted.');
}

document.getElementById('font-size').addEventListener('input', function (e) {
    e.preventDefault()
    adjustFont(null, this.value)
})

function display_Message(message) {
    try {
        // Check if the message is valid
        if (!message || typeof message !== 'string') {
            throw new Error('Invalid message');
        }

        const popup_message = document.createElement('div');
        popup_message.classList.add('popup-message');

        popup_message.innerHTML = `
            <h1>${message}</h1>
        `;

        // Append the message to the body
        document.body.appendChild(popup_message);

        // Add the 'show' class to trigger the fade-in animation
        popup_message.classList.add('show');
        setTimeout(() => {
            popup_message.classList.remove('show');

            setTimeout(() => {

                popup_message.remove();
            }, 100); // Wait for the fade-out transition to complete before removing the element
        }, 3000);

    } catch (error) {
        console.error('Error displaying message:', error.message);
    }
}
function delete_post(id) {
    try {
        const response = fetch(`/api/delete-post/${id}`, {
            method: "DELETE",
        })
        if (response.ok) {
            const data = response.json()
            const post = document.getElementById(`post-${id}`)
            post.remove()
            display_Message(data.message)
        }
    } catch (error) {
        console.log(error);
    }
}
async function showPost(post_id) {
    window.location.href = `/posts/${post_id}`
}

function updateImageSrc(fileInput) {
    // Assuming 'fileInput' is the <input type="file"> element
    const file = fileInput.files[0];
    console.log(file);

    if (file) {

        const filename = file.name;
        const imageElement = document.querySelector('.post-image');
        console.log('image element', imageElement);
        imageElement.src = `/post_images/${filename}`;
    }
}
async function get_notification(userId) {
    try {
        const response = await fetch(`/api/notifications/${userId}`, { metod: "GET" })
        if (response.ok) {
            const data = await response.json()
            console.log('notification data', data);

            const notification = data.Notification
            return notification
        }
    } catch (error) {
        alert('an error happened')
    }
}
async function new_post() {

    try {
        document.getElementById('post-text').contentEditable = false;

        // Prepare form data
        tags = Array.from(tags);

        const formData = new FormData();
        const contentElement =  document.getElementById('post-text')
        contentElement.setAttribute('direction', `${direction}`);
        contentElement.id = 'post-text'
        formData.append("content",contentElement.outerHTML);
        formData.append("title", document.getElementById('post-title').value);
        formData.append('tags',tags)
        selectedFiles.forEach(file => {

            formData.append('post-image', file);
        });
        for (const [k, v] of formData.entries()) {
            console.log(`${k} ${v}`);
        }

        const response = await fetch('/api/new-post', {
            method: "POST",

            body: formData

        });

        document.getElementById('post-text').contentEditable = true;

        // Check for response and log it
        if (response.ok) {
            const data = await response.json();

            const post = data.post
            let user = await get_user(post.user_id)
            user = user.user[0]
            console.log('user', user);
            const notification = await get_notification(user._id)
            console.log('notification', notification);

            await fetch(`/api/notify-all`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    type: "new-post",
                    post_id: post._id
                })
            }).then(res => res.json()).then(data => {
                socket.emit("notify-publicgroup", { post, user, type: "new-post", notification });
            })
        } else {
            console.error("Failed to create post", response.statusText);
        }
    } catch (error) {
        console.log(error);
    }
}

function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    return `#${result.map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
}
function createListItem(list) {
    const li = document.createElement('li');
    li.id = `li-${li_id}`;

    // Create title container
    const titleContainer = document.createElement('span');
    titleContainer.className = 'title-container';

    const icon = document.createElement('span');
    icon.contentEditable = false;
    icon.className = 'list-icon';
    icon.innerHTML = '&#9660;';

    const title = document.createElement('span');
    title.className = 'title-text';
    title.contentEditable = true;
    title.textContent = 'Your title';

    titleContainer.appendChild(icon);
    titleContainer.appendChild(title);
    li.appendChild(titleContainer);

    // Create hidden editable section
    const section = document.createElement('section');
    section.id = `section-${li_id}`;
    section.contentEditable = true;
    section.style.display = 'block';
    section.textContent = 'New section content...';
    section.addEventListener('click', function () {
        listMode = false;
        const make_list = document.getElementById('make-bullet-list')

        make_list.classList.remove('active')
    });
    li.appendChild(section);
    const br = document.createElement('br')
    list.appendChild(li);
    list.appendChild(br)
    icon.addEventListener('click', function (event) {
        event.stopPropagation();
        if (section.style.display === 'block') {
            section.style.display = 'none';
            icon.innerHTML = titleContainer.style.direction === 'ltr' ? '&#9654;' : '&#9654;';
        } else {
            section.style.display = 'block';
            icon.innerHTML = '&#9660;';
        }
    });

    li_id++; // Increment unique ID
}
function make_list() {

    const toggle = document.getElementById('make-list')
    if (listMode) {
        listMode = false;
        toggle.classList.remove('active')
    }
    else {
        listMode = true;
        toggle.classList.add('active')
        const editableDiv = document.getElementById('post-text')
        editableDiv.addEventListener('input', async function () {
            getSelectedText()
        })
        let list = editableDiv.querySelector('.chapters-list');

        if (!list) {
            list = document.createElement('ul');
            list.className = 'chapters-list';
            editableDiv.appendChild(list);

        }

        createListItem(list)


        console.log('Removing listener');
        document.removeEventListener('keydown', keyHandler);

        document.addEventListener('keydown', keyHandler);

    }


}

function make_text_list() {

    const toggle = document.getElementById('make-bullet-list')
    if (listMode) {
        listMode = false;
        toggle.classList.remove('active')
    }
    else {
        listMode = true;
        toggle.classList.add('active')
        const editableDiv = document.getElementById('edit-post-text')
        let list = editableDiv.querySelector('.chapters-list');
        editableDiv.addEventListener('input', async function () {
            getSelectedText()
        })
        if (!list) {
            list = document.createElement('ul');
            list.className = 'chapters-list';
            editableDiv.appendChild(list);

        }

        createListItem(list)


        console.log('Removing listener');
        document.removeEventListener('keydown', edit_keyHandler);

        document.addEventListener('keydown', edit_keyHandler);

    }
}
// const li = document.createElement('li');
// li.id = `li-${li_id}`;

// // Create title container
// const titleContainer = document.createElement('span');
// titleContainer.className = 'title-container';

// // Create the disclosure icon
// const icon = document.createElement('span');
// icon.contentEditable = false
// icon.className = 'list-icon';
// icon.innerHTML = '&#9654;';

// // Title text that remains visible
// const title = document.createElement('span');
// title.className = 'title-text';
// title.contentEditable = true; // Make only the title editable
// title.textContent = 'Your title'; // Example title text

// // Append icon and title to the titleContainer
// titleContainer.appendChild(icon);
// titleContainer.appendChild(title);
// li.appendChild(titleContainer);

// // Create the editable section that toggles
// const section = document.createElement('section');
// section.id = `section-${li_id}`;
// section.contentEditable = true;
// section.style.display = 'none';
// section.textContent = 'New section content...';
// section.addEventListener('focus', function () {
//     listMode = false
// })
// const br = document.createElement('br')
// li.appendChild(section);
// text_list.appendChild(li);
// text_list.appendChild(br)
// li_id++;

// icon.addEventListener('click', function (event) {
//     event.stopPropagation();
//     if (section.style.display === 'block') {
//         section.style.display = 'none';
//         icon.innerHTML = titleContainer.style.direction === 'ltr' ? '&#9654;' : titleContainer.style.direction === 'rtl' ? '◀' : '▶'

//     } else {
//         section.style.display = 'block';
//         icon.innerHTML = '&#9660;'; // Downward triangle (open state)
//     }
// });
function hidePlaceHolder() {
    document.getElementById('placeholder').style.display = 'none'
}
function showPlaceHolder() {
    document.getElementById('placeholder').style.display = 'block'
}

function adjustFont(
    font_color = null,
    font_size = null,
    font_family = null,
    bold = false,
    underline = false,
    italic = false,
    align_left = false,
    align_right = false,
    align_center = false
) {
    const post_text = document.getElementById('post-text') || document.getElementById('edit-post-text');

    console.log('currentSelection', currentSelection);

    let span;
    if (range && range.startContainer && range.startContainer.parentNode) {
        const parent = range.startContainer.parentNode;
        if (parent.tagName === "SPAN" && parent.id === "adjust-span") {
            span = parent; // Use the existing span
        } else {
            span = document.createElement("span"); // Create a new span
            span.id = 'adjust-span';
        }
    } else {
        span = document.createElement("span"); // Create a new span if no range
        span.id = 'adjust-span';
    }

    if (font_family) span.style.fontFamily = font_family;
    if (font_size) span.style.fontSize = font_size + "px";
    if (font_color) span.style.color = font_color;
    if (bold) span.style.fontWeight = span.style.fontWeight === 'bold' ? '400' : 'bold';
    if (underline) span.style.textDecoration = span.style.textDecoration === 'underline' ? 'none' : 'underline';
    if (italic) span.style.fontStyle = span.style.fontStyle === 'italic' ? 'normal' : 'italic';

    if (align_left) {
        post_text.style.direction = 'ltr';
        post_text.style.textAlign = 'left';
        direction = 'ltr'
        // const icons = document.querySelectorAll('.list-icon');  // Make sure to target the correct class name

        const listItems = document.querySelectorAll('.chapters-list li');
        console.log('listItems', listItems);
        listItems.forEach(li => {
            const titleContainer = li.querySelector('.title-container');

            if (!titleContainer) {
                console.error("Title container not found for list item:", li);
                return; // Skip this `li` if it doesn't have a title container
            }

            const icon = titleContainer.querySelector('.list-icon');
            if (icon.textContent === '◀') icon.textContent = "▶"

            if (!icon) {
                console.error("Icon not found inside title container:", titleContainer);
                return; // Skip if there's no icon in the title container
            }

            const section = li.querySelector('section');
            if (!section) {
                console.error("Section not found for list item:", li);
                return; // Skip if there's no section in the `li`
            }

            // Remove any existing event listeners to prevent duplicate bindings
            icon.replaceWith(icon.cloneNode(true));
            const newIcon = titleContainer.querySelector('.list-icon');

            newIcon.addEventListener('click', function () {
                // Toggle the icon text
                if (newIcon.textContent === '◀') newIcon.textContent = "▶";
                else newIcon.textContent = newIcon.textContent === '▼' ? '▶' : '▼';

                // Toggle the section visibility
                if (section.style.display === 'block') {
                    newIcon.textContent = '▶';
                    section.style.display = 'none';
                } else {
                    newIcon.textContent = '▼';
                    section.style.display = 'block';
                }
            });
        });

        // listItems.forEach(li => {
        //     const titleContainer = li.querySelector('.title-container')
        //     const icon = titleContainer.querySelector('.list-icon');
        //     console.log('Icon',icon);
        //     // const titleText = titleContainer.querySelector('.title-text');

        //     const section = li.querySelector('section')
        //     console.log('section',section);

        //     icon.addEventListener('click', function () {
        //         // Toggle the icon text
        //         if(icon.textContent ==='◀') icon.textContent ="▶"
        //         icon.textContent = icon.textContent === '▼' ? '▶' : '▼';

        //         if (section.style.display === 'block') {
        //             icon.textContent = '▶'
        //             section.style.display = 'none';
        //         } else {
        //             icon.textContent = '▼'
        //             section.style.display = 'block';
        //         }
        //     });

        // });
        // if (listItems) {

        // }
        // icons.forEach(icon => {

        //     console.log('ICON', icon);

        //     icon.className = 'list-icon';
        //     // icon.innerHTML = '&#9654;';
        //     icon.addEventListener('click', function (event) {
        //         event.stopPropagation();
        //         if (section.style.display === 'block') {
        //             section.style.display = 'none';
        //             icon.innerHTML = titleContainer.style.direction === 'ltr' ? '&#9664;' : '&#9654;';
        //         } else {
        //             section.style.display = 'block';
        //             icon.innerHTML = '&#9660;';
        //         }
        //     });
        //     // icon.addEventListener('click', function (event) {
        //     //     event.stopPropagation();
        //     //     // Compare icon's innerHTML correctly
        //     //     if (icon.innerHTML === '&#9654;') { // Right arrow
        //     //         icon.innerHTML = '&#9664;'; // Left arrow
        //     //     } else {
        //     //         icon.innerHTML = '&#9654;'; // Right arrow
        //     //     }
        //     // });
        // });
    }


    if (align_right) {
        post_text.style.direction = 'rtl';
        post_text.style.textAlign = 'right';
        direction = 'rtl'
        // const icons = document.querySelectorAll('list-icon');
        const listItems = document.querySelectorAll('.chapters-list li');
        console.log('listItems', listItems);
        listItems.forEach(li => {
            const titleContainer = li.querySelector('.title-container');
            if (!titleContainer) {
                console.error("Title container not found for list item:", li);
                return; // Skip this `li` if it doesn't have a title container
            }

            const icon = titleContainer.querySelector('.list-icon');
            if (icon.textContent === '▶') icon.textContent = "◀"

            if (!icon) {
                console.error("Icon not found inside title container:", titleContainer);
                return; // Skip if there's no icon in the title container
            }

            const section = li.querySelector('section');
            if (!section) {
                console.error("Section not found for list item:", li);
                return; // Skip if there's no section in the `li`
            }

            // Remove any existing event listeners to prevent duplicate bindings
            icon.replaceWith(icon.cloneNode(true));
            const newIcon = titleContainer.querySelector('.list-icon');

            newIcon.addEventListener('click', function () {
                // Toggle the icon text
                if (newIcon.textContent === '▶') newIcon.textContent = "◀";
                else newIcon.textContent = newIcon.textContent === '▼' ? '◀' : '▼';

                // Toggle the section visibility
                if (section.style.display === 'block') {
                    newIcon.textContent = '◀';
                    section.style.display = 'none';
                } else {
                    newIcon.textContent = '▼';
                    section.style.display = 'block';
                }
            });
        });

        // if (listItems) {

        // }
        // icons.forEach(icon => {

        //     // icon.innerHTML = '&#9664;';
        //     icon.addEventListener('click', function (event) {
        //         event.stopPropagation();
        //         if (section.style.display === 'block') {
        //             section.style.display = 'none';
        //             icon.innerHTML = titleContainer.style.direction === 'ltr' ? '&#9664;' : '&#9654;';
        //         } else {
        //             section.style.display = 'block';
        //             icon.innerHTML = '&#9660;';
        //         }
        //     });
        //     // icon.addEventListener('click', function (event) {
        //     //     event.stopPropagation();
        //     //     if (section.style.display === 'block') {
        //     //         section.style.display = 'none';
        //     //         icon.innerHTML = titleContainer.style.direction === 'ltr' ? '&#9664;' : '&#9654;';
        //     //     } else {
        //     //         section.style.display = 'block';
        //     //         icon.innerHTML = '&#9660;';
        //     //     }
        //     // });
        //     // icon.addEventListener('click', function (event) {
        //     //     event.stopPropagation();
        //     //     if (icon.innerHTML = '&#9664;') {

        //     //         icon.innerHTML = '&#9654;';
        //     //     } else {

        //     //         icon.innerHTML = '&#9664;';
        //     //     }
        //     // });
        // })
    }
    if (align_center) {
        post_text.style.textAlign = 'center';
    }
    if (range) {
        const selectedText = range.toString();
        if (selectedText) {
            const newSpan = span.cloneNode(false);
            newSpan.textContent = selectedText;
            range.deleteContents();
            range.insertNode(newSpan);
        }
    }

}






