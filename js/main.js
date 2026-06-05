let lunrIndex;
let documents = [];

async function initializeSearch() {
    const posts = await fetchPostsForSearch();
    const projects = await fetchProjectsForSearch();
    documents = [...posts, ...projects];

    lunrIndex = lunr(function () {
        this.ref('id');
        this.field('title');
        this.field('content');
        this.field('description');

        documents.forEach(function (doc, idx) {
            doc.id = idx;
            this.add(doc);
        }, this);
    });
}

async function fetchProjectsForSearch() {
    const response = await fetch('projects.json');
    const projects = await response.json();
    return projects.map(project => ({...project, type: 'project'}));
}


async function fetchPostsForSearch() {
    const response = await fetch('posts.json');
    const posts = await response.json();
    return posts.map(post => ({...post, type: 'post'}));
}

function search(query) {
    const results = lunrIndex.search(query);
    const searchResults = results.map(result => {
        return documents[result.ref];
    });
    displaySearchResults(searchResults);
}

function displaySearchResults(results) {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    if (results.length === 0) {
        postsContainer.innerHTML = '<p class="text-gray-400">No results found.</p>';
        return;
    }

    results.forEach(result => {
        const postElement = document.createElement('div');
        postElement.className = 'bg-card rounded-lg shadow-lg overflow-hidden card-glow';
        
        const url = result.type === 'project' ? result.url : `post.html?post=${result.fileName}`;
        const title = result.title;
        const excerpt = result.excerpt || result.description;

        postElement.innerHTML = `
            <div class="p-6">
                <p class="text-sm text-gray-400">${result.date || ''}</p>
                <h3 class="text-2xl font-semibold text-white mt-2">${title}</h3>
                <p class="text-gray-300 mt-2">${excerpt}</p>
                <a href="${url}" class="text-accent hover:text-white transition duration-300 font-medium mt-4 inline-block">
                    Read More <i class="fas fa-arrow-right ml-1"></i>
                </a>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    if (document.getElementById('posts-container')) {
        initializeSearch().then(() => {
            fetchPosts();
        });

        const searchBar = document.getElementById('search-bar');
        if (searchBar) {
            searchBar.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.length > 2) {
                    search(query);
                } else {
                    fetchPosts();
                }
            });
        }
    }

    if (document.getElementById('post-content')) {
        loadPost();
    }

    if (document.getElementById('projects-container')) {
        loadProjects();
    }

    if (document.getElementById('skills-container')) {
        loadSkills();
    }

    if (document.getElementById('projects-preview-container')) {
        loadProjectsPreview();
    }

    if (document.getElementById('blog-preview-container')) {
        loadBlogPreview();
    }
    // Animations
    anime({
        targets: '.header-animated-gradient',
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeInOutQuad'
    });

    anime({
        targets: '#typewriter-title, #subtitle, #hero-p, #connect-buttons a',
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 1000,
        delay: anime.stagger(200, {start: 500}),
        easing: 'easeOutExpo'
    });

    document.querySelectorAll('nav a:not(.text-accent)').forEach(el => {
        el.addEventListener('mouseenter', () => {
            anime({
                targets: el,
                color: '#FF0000',
                duration: 300,
                easing: 'easeInOutQuad'
            });
        });
        el.addEventListener('mouseleave', () => {
            anime({
                targets: el,
                color: '#FFFFFF',
                duration: 300,
                easing: 'easeInOutQuad'
            });
        });
    });

    document.querySelectorAll('.card-glow').forEach(el => {
        el.addEventListener('mouseenter', () => {
            anime({
                targets: el,
                translateY: -5,
                boxShadow: '0 0 20px rgba(255, 0, 0, 0.4)',
                duration: 300,
                easing: 'easeOutExpo'
            });
        });
        el.addEventListener('mouseleave', () => {
            anime({
                targets: el,
                translateY: 0,
                boxShadow: '0 0 0 rgba(255, 0, 0, 0)',
                duration: 300,
                easing: 'easeOutExpo'
            });
        });
    });

    const toTopButton = document.getElementById('to-top-button');
    if (toTopButton) {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                toTopButton.classList.remove('hidden');
            } else {
                toTopButton.classList.add('hidden');
            }
        });

        toTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

async function loadSkills() {
    const skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer) return;

    const response = await fetch('skills.json');
    const categories = await response.json();

    skillsContainer.innerHTML = '';
    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'card-glow bg-card p-6 rounded-lg flex flex-col';

        const badgesHtml = (cat.skills || [])
            .map(s => `<span class="skill-badge">${s}</span>`)
            .join('');

        card.innerHTML = `
            <div class="flex items-center space-x-3 mb-4">
                <i class="${cat.icon} text-2xl text-accent"></i>
                <h3 class="text-xl font-semibold text-white">${cat.category}</h3>
            </div>
            <div class="flex flex-wrap gap-2">
                ${badgesHtml}
            </div>
        `;
        skillsContainer.appendChild(card);
    });
}

function renderProjectCard(project, titleClass = 'text-2xl') {
    const tagsHtml = (project.tags || [])
        .map(tag => `<span class="project-tag">${tag}</span>`)
        .join('');

    let linksHtml = '';
    if (project.url) {
        linksHtml += `<a href="${project.url}" target="_blank" rel="noopener" class="text-accent hover:text-white transition duration-300 font-medium"><i class="fab fa-github mr-1"></i>View on GitHub <i class="fas fa-arrow-up-right-from-square ml-1 text-xs"></i></a>`;
    }
    if (project.tutorialUrl) {
        linksHtml += `<a href="${project.tutorialUrl}" target="_blank" rel="noopener" class="text-accent hover:text-white transition duration-300 font-medium ml-4"><i class="fas fa-play mr-1"></i>Tutorial <i class="fas fa-arrow-up-right-from-square ml-1 text-xs"></i></a>`;
    }

    const featuredBadge = project.featured
        ? '<span class="featured-badge"><i class="fas fa-star mr-1"></i>Featured</span>'
        : '';
    const statusBadge = project.status
        ? `<span class="status-badge">${project.status}</span>`
        : '';

    const card = document.createElement('div');
    card.className = 'project-card bg-card rounded-lg shadow-lg overflow-hidden card-glow flex flex-col';
    card.innerHTML = `
        <div class="p-6 flex flex-col h-full">
            <div class="flex flex-wrap gap-2 mb-3">
                ${featuredBadge}${statusBadge}
            </div>
            <h3 class="${titleClass} font-semibold text-white">${project.title}</h3>
            <p class="text-gray-300 mt-2 flex-grow">${project.description}</p>
            <div class="flex flex-wrap gap-2 mt-4">
                ${tagsHtml}
            </div>
            <div class="mt-5">
                ${linksHtml}
            </div>
        </div>
    `;
    return card;
}

async function loadProjects() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;

    const response = await fetch('projects.json');
    const projects = await response.json();

    projectsContainer.innerHTML = '';
    projects.forEach(project => {
        projectsContainer.appendChild(renderProjectCard(project, 'text-2xl'));
    });
}


function loadPost() {
    const postContentEl = document.getElementById('post-content');
    const urlParams = new URLSearchParams(window.location.search);
    const postFile = urlParams.get('post');

    if (!postFile) {
        postContentEl.innerHTML = '<p class="text-red-500">Post not found.</p>';
        return;
    }

    fetch('posts.json')
        .then(response => response.json())
        .then(posts => {
            const post = posts.find(p => p.fileName === postFile);
            if (post) {
                fetch(`_posts/${post.fileName}`)
                    .then(response => response.text())
                    .then(text => {
                        const { frontMatter, content } = parseFrontMatterAndContent(text);
                        const htmlContent = marked.parse(content);

                        document.title = `${frontMatter.title} | Mugtaba Shaikeldin`;

                        postContentEl.innerHTML = `
                            <h1 class="text-4xl font-extrabold text-white">${frontMatter.title}</h1>
                            <p class="text-gray-400 mt-2">By ${frontMatter.author} on ${frontMatter.date}</p>
                            <div class="prose prose-invert lg:prose-xl max-w-none mt-8">
                                ${htmlContent}
                            </div>
                        `;
                    })
                    .catch(error => {
                        console.error('Error loading post content:', error);
                        postContentEl.innerHTML = '<p class="text-red-500">Could not load post content.</p>';
                    });
            } else {
                postContentEl.innerHTML = '<p class="text-red-500">Post not found.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading posts index:', error);
            postContentEl.innerHTML = '<p class="text-red-500">Could not load posts index.</p>';
        });
}


async function fetchPosts() {
    try {
        const response = await fetch('posts.json');
        const posts = await response.json();
        posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

        displayPosts(posts);
        populateCategories(posts);

        const searchBar = document.getElementById('search-bar');
        const categoryFilter = document.getElementById('category-filter');

        if (searchBar) {
            searchBar.addEventListener('input', () => filterPosts(posts));
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => filterPosts(posts));
        }

    } catch (error) {
        console.error("Error fetching posts: ", error);
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = '<p class="text-red-500">Could not load blog posts. Please try again later.</p>';
    }
}

function parseFrontMatterAndContent(content) {
    const frontMatterMatch = content.match(/---([\s\S]*?)---/);
    if (!frontMatterMatch) return { frontMatter: {}, content: content };

    const frontMatterString = frontMatterMatch[1];
    const lines = frontMatterString.split('\n');
    const frontMatter = {};

    lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            frontMatter[key.trim()] = valueParts.join(':').trim().replace(/"/g, '');
        }
    });

    const contentAfterFrontMatter = content.substring(frontMatterMatch[0].length).trim();
    return { frontMatter, content: contentAfterFrontMatter };
}

function parseFrontMatter(content) {
    return parseFrontMatterAndContent(content).frontMatter;
}


function displayPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p class="text-gray-400">No posts found.</p>';
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'bg-card rounded-lg shadow-lg overflow-hidden card-glow';
        const excerpt = post.excerpt || '';
        const categories = post.categories
            ? post.categories.replace(/[\[\]]/g, '').split(',').map(c => c.trim()).filter(Boolean)
            : [];
        const tagsHtml = categories.map(c => `<span class="project-tag">${c}</span>`).join('');
        postElement.innerHTML = `
            <div class="p-6">
                <p class="text-sm text-gray-400 font-mono">${post.date || ''}</p>
                <h3 class="text-2xl font-semibold text-white mt-2">${post.title}</h3>
                ${excerpt ? `<p class="text-gray-300 mt-2">${excerpt}</p>` : ''}
                ${tagsHtml ? `<div class="flex flex-wrap gap-2 mt-3">${tagsHtml}</div>` : ''}
                <a href="post.html?post=${post.fileName}" class="text-accent hover:text-white transition duration-300 font-medium mt-4 inline-block">
                    Read More <i class="fas fa-arrow-right ml-1"></i>
                </a>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}

function populateCategories(posts) {
    const categoryFilter = document.getElementById('category-filter');
    const categories = new Set();
    posts.forEach(post => {
        if (post.category) {
            categories.add(post.category);
        }
    });

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function filterPosts(posts) {
    const searchBar = document.getElementById('search-bar');
    const categoryFilter = document.getElementById('category-filter');
    const searchTerm = (searchBar?.value || '').toLowerCase();
    const selectedCategory = categoryFilter?.value || 'all';

    const filteredPosts = posts.filter(post => {
        const title = (post.title || '').toLowerCase();
        const excerpt = (post.excerpt || '').toLowerCase();
        const categories = (post.categories || '').toLowerCase();
        const matchesSearch = title.includes(searchTerm) || excerpt.includes(searchTerm) || categories.includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || (post.category === selectedCategory);
        return matchesSearch && matchesCategory;
    });

    displayPosts(filteredPosts);
}

async function loadProjectsPreview() {
    const projectsContainer = document.getElementById('projects-preview-container');
    if (!projectsContainer) return;

    const response = await fetch('projects.json');
    const projects = await response.json();

    const featured = projects.filter(p => p.featured);
    const previewSet = (featured.length >= 3 ? featured : projects).slice(0, 3);

    projectsContainer.innerHTML = '';
    previewSet.forEach(project => {
        projectsContainer.appendChild(renderProjectCard(project, 'text-xl'));
    });
}

async function loadBlogPreview() {
    const blogContainer = document.getElementById('blog-preview-container');
    if (!blogContainer) return;
    /* renders 3 most recent posts; gracefully handles missing excerpt */

    try {
        const response = await fetch('posts.json');
        const posts = await response.json();

        blogContainer.innerHTML = '';
        const recent = [...posts].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 3);
        recent.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'bg-card rounded-lg shadow-lg overflow-hidden card-glow';
            const excerpt = post.excerpt || '';
            postElement.innerHTML = `
                <div class="p-6">
                    <p class="text-sm text-gray-400 font-mono">${post.date || ''}</p>
                    <h3 class="text-xl font-semibold text-white mt-2">${post.title}</h3>
                    ${excerpt ? `<p class="text-gray-300 mt-2">${excerpt}</p>` : ''}
                    <a href="post.html?post=${post.fileName}" class="text-accent hover:text-white transition duration-300 font-medium mt-4 inline-block">
                        Read More <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
            `;
            blogContainer.appendChild(postElement);
        });

    } catch (error) {
        console.error("Error fetching posts for preview: ", error);
        blogContainer.innerHTML = '<p class="text-red-500">Could not load blog posts.</p>';
    }
}

