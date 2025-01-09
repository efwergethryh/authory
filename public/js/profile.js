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

    // items.forEach(item => {
    //   items
    // });
    // Close the dropdown if clicked outside
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
        saveButton.addEventListener('click', updateProfileField);


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
        display_message(data.message)
    } else {
        display_error(data.message, popup)
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
            console.log(`Updated successfully:`, data);
            display_message(data.message);
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