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
    
    const view_post_h1 = document.querySelector('.view-post h1')

    if(document.getElementById('placeholder'))document.getElementById('placeholder').remove()
        listItems.forEach(li => {
            const titleContainer = li.querySelector('.title-container')
            const title = titleContainer.querySelector('.title-text');
            const icon = titleContainer.querySelector('.list-icon');
            const adjust_span = titleContainer.querySelector('span')
            adjust_span.contentEditable = false
            title.contentEditable = false
            const post_text = document.getElementById('post-text')
            console.log('direction',post_text.getAttribute('direction'));
            const direction = post_text.getAttribute('dir') || post_text.dir;
            const section = li.querySelector('section')
            if(post_text.getAttribute('direction') ==='rtl'){

                view_post_h1.style.alignSelf = 'end'
                section.style.marginLeft = '0%'

                section.style.marginRight = '5%'

                Customicon = '◀'
            }else{
                view_post_h1.style.alignSelf = 'start'
                Customicon = '▶'
            }
            
            section.style.display = 'none'
            section.style.height = '100%'
            section.contentEditable = false
            icon.addEventListener('click', function () {
                // Toggle the icon text
                
                icon.textContent = icon.textContent === '▼' ? Customicon : '▼';
                

                // Toggle the section's display style
                if (section.style.display === 'block') {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });


        });
})


async function showPosts(tag) {
    try {
        const potsContainer =  document.querySelector('.postsContainer')
        // Update the DOM with generated content
        potsContainer.style.display ='flex'
        const response = await fetch(`/api/posts/${tag}`, {
            method: "GET",
        });
        
        if (response.ok) {
            const data = await response.json();
            let content ='';

            content =`
            <strong><span style="font-size:large" class="tag">${tag}</span></strong>
            `
            if (data.posts.length === 0) {
                content = translations.sidebar.no_papers;
            } else {
                data.posts.forEach(post => {
                    content += `
                    
                    <div class="css-sh7anr-StyledBox">
                        <p class="css-gkrxgl-StyledText">${post.title}</p>
                        <a class="css-1k7990c-StyledButton" href="/posts/${post._id}">
                            Go to post
                        </a>
                        
                    </div>`;
                });
            }
            potsContainer.innerHTML = content;

            document.addEventListener('click',()=>{
                potsContainer.style.display ='none'
            })
        } else {
            console.error('Failed to fetch papers:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching papers:', error);
    }
}
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        alert('No history to go back to.');
    }
}