document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = [
        { inputId: 'looking_for', containerClass: 'university-container', optionsClass: 'university-dropdown-options' },
        { inputId: 'project_branch', containerClass: 'institute-container', optionsClass: 'institute-dropdown-options' },
        { inputId: 'type_of_study', containerClass: 'education-container', optionsClass: 'education-dropdown-options', },
        { inputId: 'country', containerClass: 'country-container', optionsClass: 'country-dropdown-options', }
    ];

    dropdowns.forEach(function (dropdown) {
        const inputElement = document.getElementById(dropdown.inputId);
        const container = document.querySelector(`.${dropdown.containerClass}`);
        const optionsList = container.querySelector(`.${dropdown.optionsClass}`);
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
});
document.addEventListener('DOMContentLoaded', function () {
    const dropdown = document.getElementById('country-drp');
    const searchInput = document.getElementById('country');
    const countainer = document.getElementById('count-cont');
    if (!dropdown || !searchInput) {
        console.error('Dropdown or search input element not found');
        return;
    }   

    fetch('https://restcountries.com/v3.1/all')
        .then(response => response.json())
        .then(data => {

            data.forEach(country => {
                const countryName = country.name?.common;
                if (countryName) {
                    const li = document.createElement('li');
                    li.textContent = countryName;
                    li.dataset.name = countryName;
                    dropdown.appendChild(li);
                } else {
                    console.warn('Country name is not available:', country);
                }
            });

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

            searchInput.addEventListener('focus', function () {
                dropdown.classList.add('open');
                console.log(dropdown.classList);
            });

            document.addEventListener('click', function (e) {
                if (!dropdown.contains(e.target) && e.target !== searchInput) {
                    countainer.classList.remove('open');
                }
            });

            dropdown.addEventListener('click', function (e) {
                if (e.target.tagName === 'LI') {

                    searchInput.value = e.target.textContent;
                    countainer.classList.remove('open');
                    console.log(dropdown.classList);
                    // Ensure dropdown is closed
                }
            }); 
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});









