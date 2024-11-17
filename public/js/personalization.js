
document.addEventListener('DOMContentLoaded', function () {

    const button = document.getElementById('next-button')
    const countryProffession_dropdown = document.getElementById('country-proffession-dropdown')
    const countryProffession_selection = document.getElementById('country-proffession-selection')
    fetch('https://restcountries.com/v3.1/all')
        .then(response => response.json())
        .then(data => {

            data.forEach(country => {
                const countryName = country.name?.common;
                if (countryName) {
                    const li = document.createElement('li');
                    li.textContent = countryName;
                    li.dataset.name = countryName;
                    countryProffession_dropdown.appendChild(li);
                } else {
                    console.warn('Country name is not available:', country);
                }
            });


            setupDropdownSearch(countryProffession_selection, countryProffession_dropdown)
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    button.addEventListener('click', function (e) {
        e.preventDefault()

        const role = document.getElementById('role')
        role.style.display = 'block'

        this.disabled = true
        this.addEventListener('click', function () {
            document.getElementById('country-profession').style.display = 'none'
            document.getElementById('personalization-form').style.display = 'block'

            const searchInput = document.getElementById('country-proffession-selection');
            let unidropdown = document.getElementById('university-dropdown');
            const uni_selection = document.getElementById('university-selection');
            const project_dropdown = document.getElementById('projectBranch-dropdown')
            const project_selection = document.getElementById('project-branch-selection')
            const marketingSource_dropdown = document.getElementById('marketingSource-dropdown');
            const marketingSource_selection = document.getElementById('marketingSource-selection')
            const firstNameE = document.querySelector('[data-e2e-test-id="first-name-input"]');
            const firstName = document.getElementsByName('firstName')[0]
            const lastNameE = document.querySelector('[data-e2e-test-id="last-name-input"]');
            const lastName = document.getElementsByName('lastName')[0]

            const phoneNumberE = document.querySelector('[data-e2e-test-id="phone-number-input"]');
            const phoneNumber = document.getElementsByName('phone_number')[0]
            getUniversities()


            searchInput.addEventListener('focus',getUniversities)
            async function getUniversities() {
                unidropdown.innerHTML = ''
                let url = ''
                url = `http://localhost:3000/api/universities/${searchInput.value}`;

                const response = await fetch(url)
               
                
                if (response.ok) {
                    const data = await response.json()
                    console.log('data',data);
                    
                    if (data.length === 0) unidropdown.innerHTML = 'No resutlts'
                    data.forEach(uni => {
                        const uniName = uni.name;
                        if (uniName) {
                            const li = document.createElement('li');
                            li.textContent = uniName;
                            li.dataset.name = uniName;
                            unidropdown.appendChild(li);
                        } else {
                            console.warn('Country name is not available:', country);
                        }
                    });
                    
                    
                }
            }


            uni_selection.addEventListener('focus', async function () {
                
                setupDropdownSearch(uni_selection, unidropdown)
            })
            setupDropdownSearch(project_selection, project_dropdown)
            lastName.addEventListener('blur', function () {
                if (lastName.value === '') lastNameE.querySelector('.css-kejeg8-InlineContainer').style.display = 'flex'
            })

            firstName.addEventListener('blur', function () {
                if (firstName.value === '') firstNameE.querySelector('.css-kejeg8-InlineContainer').style.display = 'flex'
            })
            phoneNumber.addEventListener('blur', function () {
                if (phoneNumber.value === '') phoneNumberE.querySelector('.css-kejeg8-InlineContainer').style.display = 'flex'
            })

            setupDropdownSearch(marketingSource_selection, marketingSource_dropdown)
            document.getElementById('finish-setup').addEventListener('click', async function (e) {
                e.preventDefault()

                const error = error_validation()
                if (error) {
                    document.getElementById('finish-setup-error').style.display = 'block'
                }

                else {
                    const countryProffession = document.getElementById('country-profession')
                    const personalization = document.getElementById('personalization-form')
                    const countryForm = new FormData(countryProffession)
                    const personalizationForm = new FormData(personalization)
                    const finalForm = new FormData()
                    for (const [k, v] of countryForm.entries()) {
                        finalForm.append(k, v)
                    }
                    for (const [k, v] of personalizationForm.entries()) {
                        finalForm.append(k, v)
                    }

                    finalForm.append('type', 'User')
                    const formDataObject = Object.fromEntries(finalForm.entries());
                    const jsonString = JSON.stringify(formDataObject);
                    const response = await fetch('/api/auth/register', {
                        method: 'POST',
                        body: jsonString,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });


                    if (response.ok) {
                        window.location.href = '/pages/home'; console.log('status', response);
                    } else {
                        console.log('status', response);
                    }

                }
            })

        })

        const selections = document.querySelectorAll('.css-ttz7y2-StyledFakeInput')

        selections.forEach(selection => {
            selection.addEventListener('click', function () {
                button.disabled = false;
                button.style.opacity = '1'
            });
        });

    })
})

function error_validation() {
    let error = false;

    const firstName = document.getElementsByName('firstName')[0];
    const lastName = document.getElementsByName('lastName')[0];
    const phoneNumber = document.getElementsByName('phone_number')[0];
    const university = document.getElementsByName('university')[0];
    const projectBranch = document.getElementsByName('project_branch')[0];
    console.log(
        phoneNumber.value,
        ' - ',
        firstName.value,
        ' - ',
        lastName.value,
        ' - ',
        university.value,
        ' - ',
        projectBranch.value
    );

    const lastNameE = document.querySelector('[data-e2e-test-id="last-name-input"]');
    const firstNameE = document.querySelector('[data-e2e-test-id="first-name-input"]');
    const phoneNumberE = document.querySelector('[data-e2e-test-id="phone-number-input"]');
    const universityE = document.querySelector('[data-e2e-test-id="university-input"]');
    const projectBranchE = document.querySelector('[data-e2e-test-id="project-input"]');

    const termsButton = document.querySelector('#terms');
    console.log(termsButton.checked);

    if (projectBranch.value === '') {
        projectBranchE.querySelector('.css-kejeg8-InlineContainer').style.display = 'flex';
        error = true;
    }
    if (university.value === '') {
        universityE.querySelector('.css-kejeg8-InlineContainer').style.display = 'flex';
        error = true;
    }
    if (!termsButton.checked) {
        document.getElementById('terms-error').style.display = 'flex';
        error = true;
    }
    if (lastName.value === '') {
        lastNameE.querySelector('.css-kejeg8-InlineContainer').style.display = 'flex';
        error = true;
    }
    if (firstName.value === '') {
        firstNameE.querySelector('.css-kejeg8-InlineContainer').style.display = 'flex';
        error = true;
    }
    if (phoneNumber.value === '') {
        phoneNumberE.querySelector('.css-kejeg8-InlineContainer').style.display = 'flex';
        error = true;
    }
    console.log('error', error);

    return error;
}

function setupDropdownSearch(searchInput, dropdown) {
    console.log(dropdown);

    // Handle click on the search input
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
