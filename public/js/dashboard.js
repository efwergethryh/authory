const API_BASE_URL = 'http://145.223.34.195';
const popups = [
    document.getElementById('startpost-popup'),
    document.getElementById('yourposts-popup'),
    document.getElementById('users')
];
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
       <i id="decrease-font-size" class="fa-solid fa-minus"></i>
       <input id="text-font-size" value="18">
       <i id="increase-font-size" class="fa-solid fa-plus"></i>
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
    
    <label for="post-image">
       <i id="upload-image" class="fa-regular fa-image" title="Upload Image"></i>
    </label>
    <input type="file" multiple id="post-image" name="post-image" style="display: none;" accept="image/*">
</section>`;

let li_id = 0
async function loadTranslation(lang) {
    const response = await fetch(`/translations/${lang}`, {
        method: "GET"
    });
    const translations = await response.json();
    console.log(translations);

    document.getElementById('Users').querySelector('.toggle-item').textContent = translations.sidebar.usersEmails;
    document.getElementById('admins').querySelector('.toggle-item').textContent = translations.sidebar.admins;
    document.getElementById('owner-posts').querySelector('.toggle-item').textContent = translations.sidebar.posts;
    // document.getElementById('startpost-popup').querySelector('.startpapers-label').textContent = translations.popupLabels.publishPost;
    document.getElementById('sign-out').textContent = translations.topBar.signOut
    document.getElementById('settings').textContent = translations.topBar.settings
    document.getElementById('settings-popup').querySelector('label').textContent = translations.settingsPpup.chooseLanguage
    document.getElementById('degrade-admin').textContent = translations.userTools.degradeAdmin
    document.getElementById('set-admin').textContent = translations.userTools.setAdmin
}
// loadTranslation('ar')
function show_spinner() {

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
const popup_buttons = [
    document.getElementById('paper-toggle'),
    document.getElementById('paper-toggle-2'),
    document.getElementById('paper-toggle-3'),
    document.getElementById('owner-paper-toggle'),
    document.getElementById('owner-paper-toggle-2'),
    document.getElementById('owner-paper-toggle-3')
];
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
document.addEventListener('DOMContentLoaded', () => {

    const toggleLinks = document.querySelectorAll('.toggle-link');
    const fonts = document.querySelectorAll('.fonts-list a');
    const post_image = document.getElementById('post-image')
    const post_text = document.getElementById('post-text')
    const profileImage = document.getElementById('profileImage')
    const settings = document.getElementById('settings')
    const settingsPopup = document.getElementById('settings-popup')
    const profileSpan = document.getElementById('profile-span')


    profileImage.addEventListener('click', function (e) {
        e.stopPropagation()
        profileSpan.style.display = 'flex'
    })
    settings.addEventListener('click', function (e) {
        console.log(settingsPopup);

        e.stopPropagation()
        // loadTranslation('ar')
        settingsPopup.style.display = 'block'
    })

    document.addEventListener('click', function (event) {
        const profileSpan = document.getElementById('profile-span');

        if (profileSpan.style.display === 'flex') {
            if (!profileSpan.contains(event.target)) {
                profileSpan.style.display = 'none';
            }
        }
        if (settingsPopup.style.display === 'block') {
            if (!settingsPopup.contains(event.target)) {
                settingsPopup.style.display = 'none';
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
    // popup_buttons.forEach((button, index) => {
    //     button.addEventListener('click', function (event) {

    //         popups.forEach((popup, popupIndex) => {
    //             console.log(popup);


    //             if (popupIndex !== index && popup.style.display === 'block') {
    //                 popup.style.display = 'none';
    //             }
    //         });
    //         if (popups[index].style.display === 'block') {
    //             popups[index].style.display = 'none';
    //         } else {
    //             popups[index].style.display = 'block';
    //         }
    //     });
    // });
    popup_buttons.forEach((button, index) => {
        console.log(mainContent)
        console.log('button', button);

        // button.removeEventListener('click', togglePopup); // Ensure no duplicate listeners
        if (button) button.addEventListener('click', togglePopup);
        console.log('popup', popups[index]);
        function togglePopup() {

            mainContent.textContent = '';
            popups.forEach((popup, popupIndex) => {
                if (popupIndex !== index) {
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

                    if (popups[index].id === 'startpost-popup') {
                        console.log('post text', post_text);

                        setTimeout(() => {
                            mainContent.addEventListener('mouseup', (e) => {


                                if (e.target.id === 'post-text') {
                                    console.log(e.target.id);

                                    // try {
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

                                    document.getElementById('bold').classList[styles.fontWeight >= 500 ? 'add' : 'remove']('active');

                                    // Toggle 'active' class for italic
                                    document.getElementById('italic').classList[styles.fontStyle === 'italic' ? 'add' : 'remove']('active');

                                    // Toggle 'active' class for underline
                                    document.getElementById('underline').classList[styles.textDecoration.includes('underline') ? 'add' : 'remove']('active');
                                    document.getElementById('color-picker').value = rgbToHex(styles.color)
                                    document.getElementById('font-size').value = styles.fontSize

                                    // } catch (error) {
                                    //     console.log(error);

                                    // }
                                }
                            });
                        }, 0);


                        document.getElementById('fontFamily').addEventListener('click', function (e) {
                            e.preventDefault()
                            console.log('font-family');
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
                            console.log('Selected text:', currentSelection.toString());
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
                        document.getElementById('divide').addEventListener('click', function (e) {
                            e.preventDefault()
                            const divider = document.createElement('hr');
                            divider.style.border = 'px solid grey'
                            divider.style.backgroundColor = 'grey'



                            editableDiv.appendChild(divider)
                        })


                        document.getElementById('make-list').addEventListener('click', make_list);
                        const post_overlay = document.getElementById('tags-overlay');
                        const tags_input = document.getElementById('tags')

                        if (post_image) {  // Check if the element exists
                            post_image.addEventListener('change', function (event) {

                                const files = Array.from(fileInput.files);
                                selectedFiles = selectedFiles.concat(files);
                                const startpost = document.querySelector('.startpost-popup')

                                if (post_image.files && post_image.files[0]) {
                                    const img = document.createElement('img');
                                    img.className = 'post-image';

                                    img.src = URL.createObjectURL(post_image.files[0]);

                                    img.onload = () => URL.revokeObjectURL(img.src);


                                    const tableElement = startpost.querySelector('table');
                                    console.log(tableElement, startpost);
                                    insertElementAtCursor(img)
                                    updateImageSrc(event.target);
                                }

                            });

                        } else {
                            console.error('Element with ID "post-image" not found');
                        }
                        let overlayText = ''

                        tags_input.addEventListener("input", function () {
                            const update_tags_value = tags_input.value.trim(); // Get the current value of the input field
                            console.log('tags', tags);

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
                            post_overlay.innerHTML = overlayText;
                        });
                        post_overlay.innerHTML = overlayText;

                        document.getElementById('start_post').addEventListener('click', function (e) {
                            e.preventDefault()
                            new_post()
                        })
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

    // document.getElementById('paper-toggle').addEventListener('click',function (e) {
    //     e.preventDefault()

    // })


});
document.getElementById('admins').addEventListener('click', async function () {
    resetPopups()
    show_spinner()
    const response = await fetch(`/api/users/${2}`, {
        method: "GET",
    })
    if (response.ok) {

        const data = await response.json()
        console.log(data);
        const users = document.getElementById('users')

        let content = ``
        let adminId
        data.users.forEach(user => {

            content += `
            <div class="startpapers-label" id="admins">Admins</div>
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

        data.users.forEach(user => {
            document.getElementById(`admin-settings-${user._id}`).addEventListener('click', function (e) {
                e.stopPropagation();
                adminId = user._id
                const admin_tools = document.getElementById('admin-tools');
                admin_tools.style.display = 'flex';
                // Set the user ID in the tool element for reference
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
function resetPopups() {
    // Hide all popup tool elements
    document.getElementById('yourposts-popup').style.display = 'none';
    document.getElementById('users').style.display = 'none';
}

document.getElementById('Users').addEventListener('click', async function () {
    resetPopups()
    show_spinner()
    const response = await fetch(`/api/users/${1}`, {
        method: "GET",
    })
    if (response.ok) {

        const data = await response.json()
        console.log(data);
        const users = document.getElementById('users')

        let content = ``
        let userId
        data.users.forEach(user => {

            content += `
            <div class="startpapers-label" id="joined">Users</div>
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
                <i id="user-settings-${user._id}" class="fa-solid fa-ellipsis-vertical"></i>
                  
                </div>
            </div>
            `
        })
        users.innerHTML = content
        const firstUser = document.querySelector('#users .user ');
        data.users.forEach(user => {
            const user_setting = document.getElementById(`user-settings-${user._id}`)

            user_setting.addEventListener('click', function (e) {

                e.stopPropagation();
                userId = user._id

                // offset+=5
            });
            const user_tools = document.getElementById('user-tools')

            console.log('first user', firstUser);
            if (user_tools === firstUser) {


                user_tools.style.top = `-24vw`;  // Set top for the first element
            } else {

                // Calculate how many elements are before the clicked paperLine
                const users = document.querySelectorAll('.users');
                const index = Array.from(users).indexOf(user_tools);  // Get the index of the clicked paper

                // Set the top value based on the index (each paper adds 6vw to the top)
                let newTop = -24 - (index * 5);  // 13vw + 6vw per paper
                user_tools.style.display = 'flex';
                user_tools.style.top = `${newTop}vw`;  // Set the new top for this paper
            }
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
    resetPopups()
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
            for (const post of data.posts) {
                const User = await get_user(post.user_id);
                const user = await User.user[0];
                console.log(user);

                content += `
                    <div onclick="showPost('${post._id}')" class="post" id="post-${post._id}">
                        <h>${user.user_type === 2 ? 'Admin' : user.user_type === 3 ? 'Owner' : 'User'}</h>
                        <h>-</h>
                        <h>${user.name}</h>
                        <h>-</h>
                        <h>${user._id}</h>
                        <h>-</h>
                        <h>${user.email}</h>
                        <h>-</h>
                        <h>"${post.title}"</h>
                        <div class="post-tools">
                            <i onclick="event.stopPropagation(); edit_post('${post._id}')" class="pen fa-regular fa-pen-to-square"></i>
                            <i onclick="event.stopPropagation(); delete_post('${post._id}')" class="trash-can fa-regular fa-trash-can"></i>
                        </div>
                    </div>
                `;
            }
            posts.innerHTML = content
            console.log(posts);

            document.getElementById('yourposts-popup').style.display = 'flex'
            hide_spinner()
        }
    } catch (error) {
        console.log(error);

    }
})
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
async function edit_post(id) {
    show_spinner()
    let post_info = ''
    listMode = true
    const editPost = document.getElementById('editpost-popup')
    editPost.style.display = 'block'
    const response = await fetch(`/api/posts/${id}`, {
        method: "GET"
    })
    console.log('response status', response)
    if (response.ok) {
        const data = await response.json();
        console.log(data);
        post_info = `
    <div class="editpost-popup">
    <i class="fas fa-times"></i>
    <div class="input-group">
       <input type="text" value="${data.post.title}" name="name" id="text-post-title" required placeholder="Write your project title here ">
    </div>
    <table border="1" cellpadding="10" cellspacing="0">
       <tbody>
          <tr>
             ${tools}
          </tr>
          <tr>
             <div id="edit-post-text" contenteditable="true" class="editable-text" 
                >
                ${data.post.content}
             </div>
          </tr>
          <tr>
             <td>
                <div class="input-group">
                   <label for="name">Tags</label>
                   <div class="input-container">
                      <div id="post-tags-overlay" class="tags-overlay"></div>
                      <input type="text" id="post-tags" value="" name="name" placeholder="Write tags related to the topic...">
                   </div>
                </div>
             </td>
             <td><button onclick="update_post('${data.post._id}')" id="update_post">update</button></td>
          </tr>
       </tbody>
    </table>
 </div>
    `
        editPost.innerHTML = post_info
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

        hide_spinner()

    }
}
async function update_post(id) {
    document.getElementById('edit-post-text').contentEditable = false;

    // Prepare form data
    const formData = new FormData();
    formData.append("content", document.getElementById('edit-post-text').innerHTML);
    formData.append("title", document.getElementById('text-post-title').value);

    console.log('files', selectedFiles);

    selectedFiles.forEach(file => {

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
    document.getElementById('fontFamily').addEventListener('click', function (e) {
        e.preventDefault();
        console.log('font-family');
        const font_list = document.getElementById('fonts-list');
        font_list.style.display = 'flex';
    });

    document.getElementById('text-color-picker').addEventListener('change', function () {
        const color = this.value;
        adjustFont(color);
    });

    document.getElementById('bold-text').addEventListener('click', function (e) {
        e.preventDefault();
        this.classList.toggle('active');
        adjustFont(null, null, null, true);
    });

    document.getElementById('underline-text').addEventListener('click', function (e) {
        e.preventDefault();
        this.classList.toggle('active');
        console.log('Selected text:', currentSelection.toString());
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
        document.getElementById('post-text').appendChild(divider);
    });



    document.getElementById('upload-image').addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('post-image').click();
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

    // document.addEventListener('click', function(event) {
    //     event.stopPropagation()
    //     const fontsListPopup = document.getElementById('text-fonts-list');

    //     // Check if the font list is visible and if the clicked target is not within the font list
    //     if (fontsListPopup.style.display === 'flex' && !fontsListPopup.contains(event.target)) {
    //         fontsListPopup.style.display = 'none'; // Close the font list
    //     }
    // });



    if (edit_post_text) {
        // Initialize the MutationObserver to watch for deletions
        const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach((mutation) => {
                // Check if nodes were removed from the DOM
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

function insertElementAtCursor(object) {
    // Create the element to insert
    // const newElement = document.createElement(elementTag);
    // newElement.innerHTML = content;

    // Get the current selection
    console.log(object);

    // if (!currentSelection.rangeCount) {
    //     console.log('no rangecount');

    //     return};


    range.deleteContents();
    range.insertNode(object);


    range.setStartAfter(object);
    range.setEndAfter(object);
    currentSelection.removeAllRanges();
    currentSelection.addRange(range);
}

// Example usage: insert a <span> with "Hello!" at the cursor


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
    window.location.href = `0/posts/${post_id}`
}
function updateImageSrc(fileInput) {
    // Assuming 'fileInput' is the <input type="file"> element
    const file = fileInput.files[0];
    console.log(file);

    if (file) {

        const filename = file.name;


        const imageElement = document.querySelector('.post-image');
        console.log(imageElement);


        imageElement.src = `/post_images/${filename}`;
    }
}
async function new_post() {
    try {
        document.getElementById('post-text').contentEditable = false;

        // Prepare form data
        const formData = new FormData();
        formData.append("content", document.getElementById('post-text').innerHTML);
        formData.append("title", document.getElementById('post-title').value);

        // Get the file from the input and append it to formData
        console.log('files', fileInput.files);

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
            console.log(data);
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

function make_list() {
    // e.preventDefault();
    // Enable list mode

    listMode = true;

    // Get or create the unordered list in editableDiv
    let list = editableDiv.querySelector('.chapters-list');


    if (!list) {
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
    icon.contentEditable = false
    icon.className = 'list-icon';
    icon.innerHTML = '&#9654;';

    // Title text that remains visible
    const title = document.createElement('span');
    title.className = 'title-text';
    title.contentEditable = true;
    title.textContent = 'Your title';
    titleContainer.appendChild(icon);
    titleContainer.appendChild(title);
    li.appendChild(titleContainer);

    // Create the editable section that toggles
    const section = document.createElement('section');
    section.id = `section-${li_id}`;
    section.contentEditable = true;
    section.style.display = 'none'; // Start hidden
    section.textContent = 'New section content...'; // Default content
    section.addEventListener('focus', function () {
        listMode = false
    })
    li.appendChild(section);
    list.appendChild(li);

    // Increment the li_id counter for the next list item
    li_id++;

    // Add click event listener to toggle the section display
    icon.addEventListener('click', function (event) {
        event.stopPropagation();
        if (section.style.display === 'block') {
            section.style.display = 'none';

            icon.innerHTML = titleContainer.style.direction === 'ltr' ? '&#9654;' : titleContainer.style.direction === 'rtl' ? '◀' : '▶'

        } else {
            section.style.display = 'block';
            icon.innerHTML = '&#9660;'; // Downward triangle (open state)
        }
    });

    // document.addEventListener('keydown', (e) => {
    //     if (e.key === 'Enter' && listMode) {
    //         e.preventDefault(); 
    //         let ul = document.querySelector('.chapters-list');
    //         if (!ul) {
    //             ul = document.createElement('ul');
    //             ul.className = 'chapters-list';
    //             document.getElementById('editableDiv').appendChild(ul);
    //         }

    //         // Create new list item with unique ID
    //         const li = document.createElement('li');
    //         li.id = `li-${li_id}`;

    //         // Create title container with icon and title
    //         const titleContainer = document.createElement('span');
    //         titleContainer.className = 'title-container';

    //         const icon = document.createElement('span');
    //         icon.contentEditable = false
    //         icon.className = 'list-icon';
    //         icon.innerHTML = '▶';

    //         const title = document.createElement('span');
    //         title.className = 'title-text';
    //         title.textContent = 'Your title';

    //         // Append icon and title to the titleContainer, then to li
    //         titleContainer.appendChild(icon);
    //         titleContainer.appendChild(title);
    //         li.appendChild(titleContainer);

    //         // Create editable section and append it to li
    //         const section = document.createElement('section');
    //         section.contentEditable = true;
    //         section.id = `section-${li_id}`;
    //         section.style.display = 'none'; // Hidden initially
    //         section.textContent = 'New section content...';

    //         li.appendChild(section);
    //         ul.appendChild(li); // Append li to the ul


    //         icon.addEventListener('click', function (event) {
    //             event.stopPropagation();
    //             section.style.display = section.style.display === 'block' ? 'none' : 'block';
    //             // icon.innerHTML = section.style.display === 'block' ? '&#9660;' : '&#9654;'; // Toggle icon direction
    //             icon.innerHTML = titleContainer.style.direction === 'ltr' ?'&#9654;' :titleContainer.style.direction === 'rtl'?'◀':'▶'

    //         });

    //         li_id++; // Increment the li_id to ensure each list item is unique
    //     }
    // });
}
function make_text_list() {
    // e.preventDefault();
    // Enable list mode

    listMode = true;
    const editabletext = document.getElementById('edit-post-text')
    let text_list

    if (!text_list) {
        text_list = document.createElement('ul');
        text_list.className = 'chapters-list';
        editabletext.appendChild(text_list);
    }

    // Create a new list item
    const li = document.createElement('li');
    li.id = `li-${li_id}`;

    // Create title container
    const titleContainer = document.createElement('span');
    titleContainer.className = 'title-container';

    // Create the disclosure icon
    const icon = document.createElement('span');
    icon.contentEditable = false
    icon.className = 'list-icon';
    icon.innerHTML = '&#9654;';

    // Title text that remains visible
    const title = document.createElement('span');
    title.className = 'title-text';
    title.contentEditable = true; // Make only the title editable
    title.textContent = 'Your title'; // Example title text

    // Append icon and title to the titleContainer
    titleContainer.appendChild(icon);
    titleContainer.appendChild(title);
    li.appendChild(titleContainer);

    // Create the editable section that toggles
    const section = document.createElement('section');
    section.id = `section-${li_id}`;
    section.contentEditable = true;
    section.style.display = 'none'; // Start hidden
    section.textContent = 'New section content...'; // Default content
    section.addEventListener('focus', function () {
        listMode = false
    })
    li.appendChild(section);
    text_list.appendChild(li);

    // Increment the li_id counter for the next list item
    li_id++;

    // Add click event listener to toggle the section display
    icon.addEventListener('click', function (event) {
        event.stopPropagation();
        if (section.style.display === 'block') {
            section.style.display = 'none';
            icon.innerHTML = titleContainer.style.direction === 'ltr' ? '&#9654;' : titleContainer.style.direction === 'rtl' ? '◀' : '▶'

        } else {
            section.style.display = 'block';
            icon.innerHTML = '&#9660;'; // Downward triangle (open state)
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && listMode) {
            e.preventDefault(); // Prevent default action (e.g., form submission)

            // Check for an existing unordered list container, or create it if it doesn't exist
            let ul = document.querySelector('.chapters-list');
            if (!ul) {
                ul = document.createElement('ul');
                ul.className = 'chapters-list';
                document.getElementById('editableDiv').appendChild(ul);
            }

            // Create new list item with unique ID
            const li = document.createElement('li');
            li.id = `li-${li_id}`;

            // Create title container with icon and title
            const titleContainer = document.createElement('span');
            titleContainer.className = 'title-container';

            const icon = document.createElement('span');
            icon.contentEditable = false
            icon.className = 'list-icon';
            icon.innerHTML = '▶';

            const title = document.createElement('span');
            title.className = 'title-text';
            title.textContent = 'Your title';

            // Append icon and title to the titleContainer, then to li
            titleContainer.appendChild(icon);
            titleContainer.appendChild(title);
            li.appendChild(titleContainer);

            // Create editable section and append it to li
            const section = document.createElement('section');
            section.contentEditable = true;
            section.id = `section-${li_id}`;
            section.style.display = 'none'; // Hidden initially
            section.textContent = 'New section content...';

            li.appendChild(section);
            ul.appendChild(li); // Append li to the ul

            // Toggle section display on icon click
            // icon.addEventListener('click', function (event) {
            //     event.stopPropagation();
            //     section.style.display = section.style.display === 'block' ? 'none' : 'block';
            //     icon.innerHTML = section.style.display === 'block' ? '&#9660;' : '&#9654;'; // Toggle icon direction
            // });
            icon.addEventListener('click', function (event) {
                event.stopPropagation();
                section.style.display = section.style.display === 'block' ? 'none' : 'block';
                // icon.innerHTML = section.style.display === 'block' ? '&#9660;' : '&#9654;'; // Toggle icon direction
                icon.innerHTML = titleContainer.style.direction === 'ltr' ? '&#9654;' : titleContainer.style.direction === 'rtl' ? '◀' : '▶'

            });
            li_id++; // Increment the li_id to ensure each list item is unique
        }
    });

}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && listMode) {
        e.preventDefault(); // Prevent default action (e.g., form submission)

        // Check for an existing unordered list container, or create it if it doesn't exist
        let ul = document.querySelector('.chapters-list');
        if (!ul) {
            ul = document.createElement('ul');
            ul.className = 'chapters-list';
            document.getElementById('editableDiv').appendChild(ul);
        }

        // Create new list item with unique ID
        const li = document.createElement('li');
        li.id = `li-${li_id}`;

        // Create title container with icon and title
        const titleContainer = document.createElement('span');
        titleContainer.className = 'title-container';

        const icon = document.createElement('span');
        icon.contentEditable = false
        icon.className = 'list-icon';
        icon.innerHTML = '▶';

        const title = document.createElement('span');
        title.className = 'title-text';
        title.textContent = 'Your title';

        // Append icon and title to the titleContainer, then to li
        titleContainer.appendChild(icon);
        titleContainer.appendChild(title);
        li.appendChild(titleContainer);

        // Create editable section and append it to li
        const section = document.createElement('section');
        section.contentEditable = true;
        section.id = `section-${li_id}`;
        section.style.display = 'none'; // Hidden initially
        section.textContent = 'New section content...';

        li.appendChild(section);
        ul.appendChild(li); // Append li to the ul

        // Toggle section display on icon click
        icon.addEventListener('click', function (event) {
            event.stopPropagation();
            section.style.display = section.style.display === 'block' ? 'none' : 'block';
            icon.innerHTML = titleContainer.style.direction === 'ltr' ? '&#9654;' : titleContainer.style.direction === 'rtl' ? '◀' : '▶'

            icon.innerHTML = section.style.display === 'block' ? '&#9660;' : '&#9654;'; // Toggle icon direction
        });

        li_id++; // Increment the li_id to ensure each list item is unique
    }
});



function hidePlaceHolder() {
    document.getElementById('placeholder').style.display = 'none'
}
function showPlaceHolder() {
    document.getElementById('placeholder').style.display = 'block'
}

// function adjustFont(
//     font_color = null,
//     font_size = null,
//     font_family = null,
//     bold = false,
//     underline = false,
//     italic = false,
//     align_left = false,
//     align_right = false,
//     align_center = false
// ){
//     const post_text = document.getElementById('post-text');

//     console.log(currentSelection);
//     let span
//     if (range && range.startContainer && range.startContainer.parentNode) {
//         const parent = range.startContainer.parentNode;
//         if (parent.tagName === "SPAN" && parent.id === "adjust-span") {
//             span = parent;
//         } else {
//             span = document.createElement("span");
//             span.id = 'adjust-span';
//         }
//     } else {
//         span = document.createElement("span");
//         span.id = 'adjust-span';
//     }

//     if (font_family) span.style.fontFamily = font_family;
//     if (font_size) span.style.fontSize = font_size + "px";
//     if (font_color) span.style.color = font_color;
//     if (bold) span.style.fontWeight = span.style.fontWeight === 'bold' ? '400' : 'bold';
//     if (underline) span.style.textDecoration = span.style.textDecoration === 'underline' ? 'none' : 'underline';
//     if (italic) span.style.fontStyle = span.style.fontStyle === 'italic' ? 'normal' : 'italic';
//     if (align_left) {
//         const listItems = document.querySelectorAll('.chapters-list li');
//         listItems.forEach(li => {
//             const titleContainer = li.querySelector('.title-container')
//             const title = titleContainer.querySelector('.title-text');
//             const icon = titleContainer.querySelector('.list-icon');
//             const adjust_span = document.getElementById('adjust-span')
//             titleContainer.style.direction = 'ltr';
//             titleContainer.style.textAlign = 'left';
//             icon.textContent = '▶';

//             titleContainer.appendChild(icon);
//             titleContainer.appendChild(title);


//         });

//         // Set text direction for post_text
//         post_text.style.direction = 'ltr';
//         adjust_span.remove()
//     }
//     if (align_right) {
//         const listItems = document.querySelectorAll('.chapters-list li');
//         const adjust_span = document.getElementById('adjust-span')
//         listItems.forEach(li => {
//             const titleContainer = li.querySelector('.title-container')
//             const title = titleContainer.querySelector('.title-text');
//             const icon = titleContainer.querySelector('.list-icon');

//             titleContainer.style.direction = 'rtl';
//             titleContainer.style.textAlign = 'right';
//             icon.textContent = '◀';
//             titleContainer.appendChild(icon);
//             titleContainer.appendChild(title);

//         });
//         console.log(adjust_span);

//         // 
//         post_text.style.direction = 'rtl'


//         if (adjust_span) {
//             adjust_span.textContent = ''
//             adjust_span.remove()
//         }
//     };
//     if (align_center) post_text.style.textAlign = 'center'

//     span.textContent = currentSelection

//     console.log('before', span);

//     range.deleteContents(); 
//     range.insertNode(span);
//     span = ''
//     console.log('after', span);
//     console.log('selection', currentSelection);
// }

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
    const post_text = document.getElementById('post-text');

    console.log('currentSelection', currentSelection);

    // Determine if the selection already has a span with id 'adjust-span'
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

    // Handle text alignment
    if (align_left) {
        post_text.style.direction = 'ltr';
        post_text.style.textAlign = 'left';
    }
    if (align_right) {
        post_text.style.direction = 'rtl';
        post_text.style.textAlign = 'right';
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






