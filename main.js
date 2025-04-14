// Navigation configuration for ALL pages
const pages = [
    { name: "Home", path: "index.html" },
    { name: "View Donors", path: "list.html" },
    { name: "Play Game", path: "game.html" }
];

// Initialize navigation on all pages
function initNavigation() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    
    const ul = document.createElement('ul');
    
    pages.forEach(page => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        a.href = page.path;
        a.textContent = page.name;
        
        // Highlight current page
        if (window.location.pathname.endsWith(page.path)) {
            a.classList.add('active');
        }
        
        li.appendChild(a);
        ul.appendChild(li);
    });
    
    nav.appendChild(ul);
}

// Run when page loads
document.addEventListener('DOMContentLoaded', initNavigation);