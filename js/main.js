document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    if (document.getElementById('posts-container')) {
        fetchPosts();
    }

    if (document.getElementById('post-content')) {
        loadPost();
    }
});

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

function parseFrontMatter(content) {
    const frontMatterMatch = content.match(/---([\s\S]*?)---/);
    if (!frontMatterMatch) return {};

    const frontMatterString = frontMatterMatch[1];
    const lines = frontMatterString.split('\n');
    const frontMatter = {};

    lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            frontMatter[key.trim()] = valueParts.join(':').trim().replace(/"/g, '');
        }
    });

    return frontMatter;
}
    const frontMatterMatch = content.match(/---([\s\S]*?)---/);
    if (!frontMatterMatch) return {};

    const frontMatterString = frontMatterMatch[1];
    const lines = frontMatterString.split('\n');
    const frontMatter = {};

    lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            frontMatter[key.trim()] = valueParts.join(':').trim().replace(/"/g, '');
        }
    });

    return frontMatter;
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
