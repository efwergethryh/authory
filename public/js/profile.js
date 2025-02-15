window.env = {
    API_KEY: 'yznteYMicN1lyxpwSBR1BL27dxjPwfaGrNUSu4Bm'
}
let isFetching = false;
const user = JSON.parse(document.getElementById('user-data').value)

let country_selection = document.querySelector('input[name="country"]')
let uni_selection = document.getElementById('university-selection');
let firstNameInput = document.querySelector('input[name="firstName"]');
let lastNameInput = document.querySelector('input[name="lastName"]');
let emailInput = document.querySelector('input[name="email"]');
document.addEventListener('DOMContentLoaded', async function () {

    firstNameInput.value = user.firstName
    lastNameInput.value = user.lastName
    emailInput.value = user.email
    uni_selection.value = user.university
    country_selection.value = user.country
    const togglePassword = document.getElementById('change-Toggle');
    const passwordInput = document.getElementById('new-password');
    if (togglePassword && passwordInput) {
        console.log('change', togglePassword);

        const closedEyeSVG = `
        <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="eye-slash" class="svg-inline--fa fa-eye-slash " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" color="#797979" font-size="18px"><path fill="currentColor" d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z"></path></svg>                
        `;

        const openEyeSVG = `
                        <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="eye" class="svg-inline--fa fa-eye " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" color="#797979" font-size="18px"><path fill="currentColor" d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"></path></svg> `;

        // Set default state
        togglePassword.innerHTML = closedEyeSVG;
        togglePassword.dataset.visible = "false";

        togglePassword.addEventListener('click', function () {
            const isVisible = togglePassword.dataset.visible === "true";
            passwordInput.type = isVisible ? 'password' : 'text';
            togglePassword.innerHTML = isVisible ? closedEyeSVG : openEyeSVG;
            togglePassword.dataset.visible = isVisible ? "false" : "true";
        });
    }
    document.addEventListener('click', async function (e) {
        const nameTab = e.target.closest('#name-tab');
        const emailTab = e.target.closest('#email-tab');
        const passwordTab = e.target.closest('#password-tab');
        const pictureTab = e.target.closest('#picture-tab');
        const countryTab = e.target.closest('#country-tab')
        const universityTab = e.target.closest('#university-tab')

        if (nameTab) {
            displayPopup('name-popup');
        }
        if (emailTab) {
            displayPopup('email-popup');
        }
        if (passwordTab) {
            displayPopup('password-popup');
            if (passwordTab) {
                displayPopup('password-popup');


            }

        }

        if (pictureTab) {
            displayPopup('profilePicture-popup');
            document.getElementById('profile-image').addEventListener('change', function () {
                const file = this.files[0]; // Get the selected file
                console.log('File:', file);

                if (file) {
                    const reader = new FileReader();

                    // Load the file and set it as the source of an image element
                    reader.onload = function (e) {
                        const imagePreview = document.getElementById('user-image'); // ID of the preview image
                        if (imagePreview) {
                            imagePreview.src = e.target.result; // Set the image source to the file data
                        } else {
                            console.error('Image preview element not found.');
                        }
                    };

                    reader.readAsDataURL(file); // Read the file as a data URL
                } else {
                    console.log('No file selected.');
                }
            });

        }
        if (countryTab) {
            displayPopup('country-popup')
            const country_dropdown = document.getElementById('country-dropdown')

            fetch(`https://countryapi.io/api/all?apikey=${window.env.API_KEY}`)
                .then(response => response.json())
                .then(data => {
                    console.log('data', data);


                    Object.values(data).forEach(country => {
                        const countryName = country.name;
                        if (countryName) {
                            const li = document.createElement('li');
                            li.textContent = countryName; // Add the country name
                            li.dataset.name = countryName; // Optionally store the name as a data attribute
                            country_dropdown.appendChild(li); // Append the list item to the dropdown
                        } else {
                            console.warn('Country name is not available:', country);
                        }
                    });
                    setupDropdownSearch(country_selection, country_dropdown)
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
        if (universityTab && !isFetching) {
            isFetching = true;
            console.log('universityTab');

            displayPopup('university-popup');
            let unidropdown = document.getElementById('university-dropdown');
            unidropdown.innerHTML = '';

            const url = `/api/universities/${country_selection.value}`;

            try {
                const response = await fetch(url, { method: "GET" });

                if (response.ok) {
                    const data = await response.json();
                    console.log('data', data);

                    if (data.length === 0) unidropdown.innerHTML = 'No results';
                    data.forEach(uni => {
                        const uniName = uni.name;
                        if (uniName) {
                            const li = document.createElement('li');
                            li.textContent = uniName;
                            li.dataset.name = uniName;
                            unidropdown.appendChild(li);
                        } else {
                            console.warn('Country name is not available:', uni);
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                isFetching = false; // Reset the flag once the request is done
            }

            setupDropdownSearch(uni_selection, unidropdown);
        }
    });

});

function setupDropdownSearch(searchInput, dropdown) {

    searchInput.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropdown.style.display = 'flex';
    });

    // Handle input in the search field
    searchInput.addEventListener('input', function () {
        const filter = searchInput.value.toLowerCase();
        const items = dropdown.querySelectorAll('li');
        items.forEach(item => {
            const text = item.dataset.name.toLowerCase();
            if (text.includes(filter)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });

    
    document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target) && e.target !== searchInput) {
            dropdown.style.display = 'none';
        }
    });

    // Handle item selection from the dropdown
    dropdown.addEventListener('click', function (e) {
        e.preventDefault()
        if (e.target.tagName === 'LI') {
            searchInput.value = '';
            // Optionally clear placeholder
            searchInput.value = e.target.textContent;

            // Hide the dropdown
            dropdown.style.display = 'none'

        }
    });
}
function displayPopup(id) {
    const overlay = document.querySelector('.overlay');

    overlay.style.display = 'none';

    // Show the selected popup
    const popup = document.getElementById(id);
    if (popup) {
        popup.style.display = 'block';
        // let fieldsToUpdate = [];
        const saveButton = popup.querySelector('.save-button');
        const closeButton = popup.querySelector('[data-testid="close-button"]')


        // Overlay click handler to close the popup
        overlay.style.display = 'block';
        overlay.addEventListener('click', function () {
            popup.style.display = 'none';
            this.style.display = 'none';
        });
        closeButton.removeEventListener('click', function () {
            popup.style.display = 'none'
            overlay.style.display = 'none';

        })
        closeButton.addEventListener('click', function () {
            popup.style.display = 'none'
            overlay.style.display = 'none';

        })
        // Adding the click event listener for the save button
        saveButton.removeEventListener('click', updateProfileField);
        saveButton.addEventListener('click', () => updateProfileField(popup));


    }
}
async function change_password() {
    const popup = document.getElementById('password-popup')
    const new_password = document.querySelector('input[name="newPassword"]');
    const password = document.querySelector('input[name="password"]');
    console.log('new password', new_password.value);
    console.log('password', password.value);

    const response = await fetch('/api/change-password', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_password: new_password.value, password: password.value }),
    });
    const data = await response.json()
    if (response.ok) {
        console.log('data',data.message);
        
        display_message(data.message)
    } else {
        console.log('data',data.message);
        display_error(data.message, popup)
    }
}
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        alert('No history to go back to.');
    }
}
async function updateProfileField(popup) {
    try {
        // Create a FormData object
        const formData = new FormData()


        const profilePicture = document.getElementById('profile-image').files[0]

        const name = `${firstNameInput.value} ${lastNameInput.value}`
        const fieldsToUpdate = [
            { field: "firstName", value: firstNameInput.value },
            { field: "lastName", value: lastNameInput.value },
            { field: "name", value: name },
            { field: "email", value: emailInput.value },
            { field: "university", value: uni_selection.value },
            { field: "country", value: country_selection.value }
        ];
        formData.append('fieldsToUpdate', JSON.stringify(fieldsToUpdate))
        formData.append('profile_picture', profilePicture)

        const response = await fetch('/api/update-profile', {
            method: "PUT",
            body: formData, // Use FormData object
        });

        const data = await response.json();

        if (response.ok) {

            display_message(data.message);
            popup.style.display = 'none'
            const overlay = document.querySelector('.overlay');
            overlay.style.display = 'none'
        } else {
            console.error('Error updating:', display_error(data.message, popup) || "Unknown error");
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

function display_error(message, popup) {
    const error = document.createElement('p')
    error.style.color = 'red'
    error.textContent = message
    popup.append(error)
}
async function phoneNumber(value) {
    const response = await fetch(`/api/update-phone`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            value: value
        })
    })
    const data = await response.json()
    if (response.ok) {
        console.log('data', data);

        if (value === 'private') {
            document.getElementById('public').classList.remove('active')
            document.getElementById('private').classList.add('active')
        } else {
            document.getElementById('public').classList.add('active')
            document.getElementById('private').classList.remove('active')
        }
    }

}
function display_message(message) {
    const popup_message = document.createElement('div');
    popup_message.classList.add('popup-message');

    popup_message.innerHTML = `
        <h1>${message}</h1>
    `;

    document.body.appendChild(popup_message)
}