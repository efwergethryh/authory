

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
        console.log(selectedValues);
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
            // Assuming the server sends JSON errors
            

            display_Message(errorData.message || 'An error occurred'); // Display the error message from the server
            return; // Stop further execution
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

                formData.append('type', user_type)
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

