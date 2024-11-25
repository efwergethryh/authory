document.addEventListener('DOMContentLoaded', function () {
    const listItems = document.querySelectorAll('.chapters-list li');
    console.log(listItems);
    const images = document.querySelectorAll('.post-image');
    // Get the value of the input field
    const inputValue = document.getElementById('images').value;

    // Convert the string to an array by splitting on the comma
    const imageArray = inputValue.split(',');

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
    
            // Remove 'public/' from the beginning of the path, if present
            
            newSrc = newSrc.substring('public/'.length); // Using substring to remove 'public/'
            
            
            // Update backslashes to forward slashes
            newSrc = newSrc.replace(/\\/g, '/');
            newSrc = '/' + newSrc 
            // Set the new src for the image
            image.src = newSrc; // Update the src with the cleaned-up path
        }
    });
    
    
    if(document.getElementById('placeholder'))this.remove()
    listItems.forEach(li => {
        const titleContainer = li.querySelector('.title-container')
        const title = titleContainer.querySelector('.title-text');
        const icon = titleContainer.querySelector('.list-icon');
        const adjust_span = titleContainer.querySelector('span')
        adjust_span.contentEditable = false
        icon.textContent = '▶';
        const post_text = document.getElementById('post-text')
        const section = li.querySelector('section')
        section.style.display = 'none'
        section.style.height = '100%'
        section.contentEditable = false
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
})
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        alert('No history to go back to.');
    }
}