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
    const response = await fetch('_posts/');
    const files = await response.text();
    const fileNames = files.match(/href="([^"]+\.md)"/g).map(href => href.substring(6, href.length - 1));

    const posts = await Promise.all(fileNames.map(async (file) => {
        const postResponse = await fetch(`_posts/${file}`);
        const postContent = await postResponse.text();
        const { frontMatter, content } = parseFrontMatterAndContent(postContent);
        return { ...frontMatter, content, url: `post.html?post=${file}` };
    }));

    return posts;
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
        searchBar.addEventListener('input', (e) => {
            const query = e.target.value;
            if (query.length > 2) {
                search(query);
            } else {
                fetchPosts();
            }
        });
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
    const skills = await response.json();

    skillsContainer.innerHTML = '';
    skills.forEach(skill => {
        const skillElement = document.createElement('div');
        skillElement.className = 'card-glow bg-card p-4 rounded-lg flex items-center space-x-4 h-24';
        skillElement.innerHTML = `
            <i class="${skill.icon} text-4xl text-accent w-12 text-center"></i>
            <span class="font-semibold text-white text-lg">${skill.name}</span>
        `;
        skillsContainer.appendChild(skillElement);
    });
}

async function loadProjects() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;

    const response = await fetch('projects.json');
    const projects = await response.json();

    projectsContainer.innerHTML = '';
    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'bg-card rounded-lg shadow-lg overflow-hidden card-glow';
        
        let tagsHtml = '';
        if (project.tags) {
            tagsHtml = project.tags.map(tag => `<span class="text-xs text-accent bg-red-900/50 px-2 py-1 rounded-full">${tag}</span>`).join('');
        }

        let linksHtml = '';
        if (project.url) {
            linksHtml += `<a href="${project.url}" target="_blank" class="text-accent hover:text-white transition duration-300 font-medium">View Code (GitHub) <i class="fas fa-external-link-alt ml-1"></i></a>`;
        }
        if (project.tutorialUrl) {
            linksHtml += `<a href="${project.tutorialUrl}" target="_blank" class="text-accent hover:text-white transition duration-300 font-medium ml-4">View Tutorial <i class="fas fa-external-link-alt ml-1"></i></a>`;
        }

        projectElement.innerHTML = `
            <div class="p-6">
                <h3 class="text-2xl font-semibold text-white">${project.title}</h3>
                <p class="text-gray-300 mt-2">${project.description}</p>
                <div class="flex flex-wrap gap-2 mt-3">
                    ${tagsHtml}
                </div>
                <div class="mt-4">
                    ${linksHtml}
                </div>
            </div>
        `;
        projectsContainer.appendChild(projectElement);
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

    fetch(`_posts/${postFile}`)
        .then(response => response.text())
        .then(text => {
            const frontMatter = parseFrontMatter(text);
            const content = text.split('---').slice(2).join('---').trim();
            const converter = new showdown.Converter();
            const htmlContent = converter.makeHtml(content);

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
            console.error('Error loading post:', error);
            postContentEl.innerHTML = '<p class="text-red-500">Could not load post.</p>';
        });
}


async function fetchPosts() {
    try {
        const response = await fetch('_posts/');
        const files = await response.text();
        const fileNames = files.match(/href="([^"]+\.md)"/g).map(href => href.substring(6, href.length - 1));

        const posts = await Promise.all(fileNames.map(async (file) => {
            const postResponse = await fetch(`_posts/${file}`);
            const postContent = await postResponse.text();
            const frontMatter = parseFrontMatter(postContent);
            return { ...frontMatter, fileName: file };
        }));

        displayPosts(posts);
        populateCategories(posts);

        const searchBar = document.getElementById('search-bar');
        const categoryFilter = document.getElementById('category-filter');

        searchBar.addEventListener('input', () => filterPosts(posts));
        categoryFilter.addEventListener('change', () => filterPosts(posts));

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
        postElement.innerHTML = `
            <div class="p-6">
                <p class="text-sm text-gray-400">${post.date}</p>
                <h3 class="text-2xl font-semibold text-white mt-2">${post.title}</h3>
                <p class="text-gray-300 mt-2">${post.excerpt}</p>
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
    const searchTerm = searchBar.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm) || post.excerpt.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    displayPosts(filteredPosts);
}

async function loadProjectsPreview() {
    const projectsContainer = document.getElementById('projects-preview-container');
    if (!projectsContainer) return;

    const response = await fetch('projects.json');
    const projects = await response.json();

    projectsContainer.innerHTML = '';
    projects.slice(0, 3).forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'bg-card rounded-lg shadow-lg overflow-hidden card-glow';
        
        let tagsHtml = '';
        if (project.tags) {
            tagsHtml = project.tags.map(tag => `<span class="text-xs text-accent bg-red-900/50 px-2 py-1 rounded-full">${tag}</span>`).join('');
        }

        let linksHtml = '';
        if (project.url) {
            linksHtml += `<a href="${project.url}" target="_blank" class="text-accent hover:text-white transition duration-300 font-medium">View Code (GitHub) <i class="fas fa-external-link-alt ml-1"></i></a>`;
        }
        if (project.tutorialUrl) {
            linksHtml += `<a href="${project.tutorialUrl}" target="_blank" class="text-accent hover:text-white transition duration-300 font-medium ml-4">View Tutorial <i class="fas fa-external-link-alt ml-1"></i></a>`;
        }

        projectElement.innerHTML = `
            <div class="p-6">
                <h3 class="text-xl font-semibold text-white">${project.title}</h3>
                <p class="text-gray-300 mt-2 h-24 overflow-hidden">${project.description}</p>
                <div class="flex flex-wrap gap-2 mt-3">
                    ${tagsHtml}
                </div>
                <div class="mt-4">
                    ${linksHtml}
                </div>
            </div>
        `;
        projectsContainer.appendChild(projectElement);
    });
}

async function loadBlogPreview() {
    const blogContainer = document.getElementById('blog-preview-container');
    if (!blogContainer) return;

    try {
        const response = await fetch('_posts/');
        const files = await response.text();
        const fileNames = files.match(/href="([^"]+\.md)"/g).map(href => href.substring(6, href.length - 1));

        const posts = await Promise.all(fileNames.slice(0, 3).map(async (file) => {
            const postResponse = await fetch(`_posts/${file}`);
            const postContent = await postResponse.text();
            const frontMatter = parseFrontMatter(postContent);
            return { ...frontMatter, fileName: file };
        }));

        blogContainer.innerHTML = '';
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'bg-card rounded-lg shadow-lg overflow-hidden card-glow';
            postElement.innerHTML = `
                <div class="p-6">
                    <p class="text-sm text-gray-400">${post.date}</p>
                    <h3 class="text-xl font-semibold text-white mt-2">${post.title}</h3>
                    <p class="text-gray-300 mt-2 h-24 overflow-hidden">${post.excerpt}</p>
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

