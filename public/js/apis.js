

let conv_id;
let user_type
// const spinner = document.getElementById('loading-spinner')
// apiRequest('', {})



function previewAvatar(blob) {
    const avatarButton = document.getElementById('avatar-label');

    if (blob) {
        const url = URL.createObjectURL(blob);

        // Set the background image of the avatar button
        avatarButton.style.backgroundImage = `url(${url})`;
        avatarButton.style.backgroundSize = 'cover';
        avatarButton.style.backgroundPosition = 'center';
    }
}
const checkboxes = document.querySelectorAll('input[name="option"]');
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        // Uncheck all checkboxes except the one currently being changed
        checkboxes.forEach((cb) => {
            if (cb !== checkbox) cb.checked = false;
        });

        // Log the selected value
        const selectedCheckbox = Array.from(checkboxes).find((cb) => cb.checked);
        user_type = selectedCheckbox ? selectedCheckbox.value : null;
        // console.log(selectedValues);
    });
});

async function post_api(api, formData) {


    try {
        await new Promise(resolve => setTimeout(resolve, 100));

        let response;
        if (api === '/api/auth/register') {
            response = await fetch(api, {
                method: 'POST',
                body: formData,
            });
            // if(jsonFormData.type=="Admin" ||jsonFormData.type=="Owner" ){

            // }else{
            
            
            if (response.ok) {
                window.location.href = '/pages/home'
            }
            // }    
        } else {
            const jsonFormData = {};
            formData.forEach((value, key) => {
                jsonFormData[key] = value;
            });
            console.log('form darta',jsonFormData);
            
            response = await fetch(api, {
                method: 'POST',
                body: JSON.stringify(jsonFormData),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.ok) {

                if (jsonFormData.type == "Admin" || jsonFormData.type == "Owner") {
                    window.location.href = '/pages/dashboard'
                } else {
                    window.location.href = '/pages/home'
                }
            } else {
                display_Message("Something went wrong")
            }
        }

        if (!response.ok) {
            const errorData = await response.json();
            const error = document.getElementById('error')
            error.textContent = errorData.message
            error.style.display = 'block'
            console.log(errorData);
           

            display_Message(errorData.message || 'An error occurred'); // Display the error message from the server
            return;
        }

        // Process the successful response
        const responseData = await response.json();

        display_Message(responseData.message || 'Request successful');
    } catch (err) {
        console.log('error', err);

        display_Message(err.message);
    } finally {
        // Hide the spinner after the request is finished
        // hide_spinner();
    }
}



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

document.addEventListener('DOMContentLoaded', async () => {

    let cropper;

    const togglePassword = document.getElementById('passowrd-Toggle');
    const passwordInput = document.getElementById('password')

    togglePassword.addEventListener('click', function () {
        // Toggle password visibility
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        const closedEyeSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
            <path fill="currentColor" fill-rule="evenodd" d="M12.3 12.57l2.286 2.344L16 13.5 2.914.086 1.5 1.5l2.013 2.063c-.537.396-1.007.827-1.407 1.246a13.327 13.327 0 00-1.65 2.135 2 2 0 000 2.112c.053.084.111.176.176.275.332.505.826 1.18 1.474 1.86C3.387 12.531 5.381 14 8 14c1.707 0 3.148-.623 4.3-1.43zm-1.42-1.455l-.868-.89a3 3 0 01-4.187-4.292l-.899-.92c-.509.345-.968.753-1.373 1.177A11.328 11.328 0 002.155 8c.044.07.093.148.148.232.284.432.705 1.007 1.25 1.577C4.66 10.97 6.165 12 8 12c1.078 0 2.043-.355 2.88-.884zM7.225 7.368A1 1 0 008.613 8.79zm-.016-5.323l2.146 2.146c1.231.35 2.271 1.14 3.092 2A11.335 11.335 0 0113.845 8a10.71 10.71 0 01-.269.412l1.435 1.435a13.598 13.598 0 00.533-.791 2 2 0 000-2.112 13.314 13.314 0 00-1.65-2.135C12.613 3.467 10.619 2 8 2c-.27 0-.534.017-.79.046z" clip-rule="evenodd"></path>
            </svg>
            `;

        const openEyeSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
            <g fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" clip-rule="evenodd">
                <path d="M1 8s2.545-5 7-5 7 5 7 5-2.546 5-7 5c-4.455 0-7-5-7-5z"></path>
                <path d="M8 10a2 2 0 100-4 2 2 0 000 4z"></path>
            </g>
            </svg>
        `;

        // Get current icon
        const currentIcon = this.innerHTML.trim();

        // Toggle the icon
        if (currentIcon.includes("M12.3 12.57")) {
            this.innerHTML = openEyeSVG; // Switch to open eye
        } else {
            this.innerHTML = closedEyeSVG; // Switch to closed eye
        }
    });

    const loginButton = document.getElementById('login-button');
    const create_owner = document.getElementById('create-owner')
    const log_in = document.getElementById('log-in')

    if (loginButton) {

        loginButton.addEventListener('click', async function (event) {
            event.preventDefault();
            
            console.log(document.getElementsByName('email'));
            console.log(document.getElementsByName('password'));
            const formData = new FormData();
            formData.append('email',document.getElementsByName('email')[0].value)
            formData.append('password',document.getElementsByName('password')[0].value)
            formData.append('type', "User")
            // Log form data
            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            await post_api('/api/auth/login', formData);
        });
    }
    if (document.getElementById('profile_picture')) {
        document.getElementById('profile_picture').addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const image = document.getElementById('imageToCrop');
                    image.src = e.target.result
                    document.getElementById('openPopupBtn').click();
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('openPopupBtn').addEventListener('click', function () {
            document.getElementById('imagePopup').style.display = 'flex';

            const image = document.getElementById('imageToCrop');

            if (cropper) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1,
                viewMode: 1,
                movable: true,
                zoomable: true,
                rotatable: true,
                scalable: true
            });
        });
        document.getElementById('closePopupBtn').addEventListener('click', function () {
            document.getElementById('imagePopup').style.display = 'none';
            if (cropper) {
                cropper.destroy();
            }
        });
        document.getElementById('cropImageBtn').addEventListener('click', function () {
            if (cropper) {
                const croppedCanvas = cropper.getCroppedCanvas();
                const imagepopup = document.getElementById('imagePopup');
                const register_form = document.getElementById('register');
                const formData = new FormData(register_form);
                if (croppedCanvas.toBlob) {
                    croppedCanvas.toBlob(async (blob) => {
                        if (blob) {
                            previewAvatar(blob);


                            const url = URL.createObjectURL(blob);
                            const newImage = document.createElement('img');
                            newImage.src = url;
                            newImage.style.display = 'none';


                            formData.delete('profile_picture');
                            const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
                            formData.append('profile_picture', file);
                            formData.append('type', 'User')

                            for (const [key, value] of formData.entries()) {
                                console.log(`${key}: ${value}`);
                            }

                            // Hide the popup and destroy cropper
                            imagepopup.style.display = 'none';
                            if (cropper) {
                                cropper.destroy();
                            }

                            // Submit the form when user clicks 'reg' button
                            document.getElementById('reg').addEventListener('click', async function (event) {
                                event.preventDefault();  // Prevent default form submission
                                await post_api('/api/auth/register', formData);  // Custom API call
                            });
                        }
                    }, 'image/jpeg');
                } else {
                    console.error("toBlob is not supported by this browser.");
                }
            }
        });

    }
    if (create_owner) {
        try {
            const registerForm = document.getElementById('owner-register');
            const create_owner = document.getElementById('create-owner');

            create_owner.addEventListener('click', async function (e) {
                e.preventDefault();
                const formData = new FormData(registerForm);
                formData.append('type', user_type)
                // Logging form entries to the console
                for (const [k, v] of formData.entries()) {
                    console.log(k, ':', v);
                }

                // Send the form data via API
                await post_api('/api/create-owner', formData);
            });
        } catch (error) {
            alert(error);
        }
    }
    if (log_in) {
        try {
            const log_in_form = document.getElementById('custom-login');

            log_in.addEventListener('click', async function (e) {
                e.preventDefault();
                const formData = new FormData(log_in_form);

                // formData.append('type', user_type)
                for (const [k, v] of formData.entries()) {
                    console.log(k, ':', v);
                }

                // Send the form data via API
                await post_api('/api/auth/login', formData);
            });
        } catch (error) {
            alert(error);
        }
    }

});

async function refreshAccessToken() {
    const refreshToken = getCookie('refreshToken'); // Get refreshToken from cookies
    if (!refreshToken) {
        console.log('No refresh token found');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/refresh_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('accessToken', result.accessToken);
            localStorage.setItem('refreshToken', result.refreshToken);
        } else {
            console.error('Refresh failed:', result.message);
        }
    } catch (error) {
        console.log('error', error);

        console.error('Error during token refresh:');
    }
}
async function apiRequest(url, options) {
    if (isTokenExpired()) {
        console.log('Refreshing token...');

        refreshAccessToken();
    }

    const response = await fetch(url, options);
    if (response.status === 401) {

        refreshAccessToken();
        options.headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
        return fetch(url, options);
    }
    return response;
}
function getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function isTokenExpired() {
    const token = getCookie('accessToken');
    if (!token) return true;
    try {
        const decoded = jwt_decode(token);

        return Date.now() >= decoded.exp * 1000;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
}

