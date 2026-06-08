/* =====================================================
   LUXURY ARCHITECTURE DESIGNS - MAIN JAVASCRIPT
   Premium Architectural & Interior Design Services
   ===================================================== */

// =====================================================
// CONFIGURATION
// =====================================================
const CONFIG = {
    POSTS_PER_PAGE: 6,
    ADMIN_POSTS_PER_PAGE: 10,
    DEFAULT_IMAGE: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    STORAGE_KEYS: {
        POSTS: 'lad_posts',
        COMMENTS: 'lad_comments',
        SESSION: 'lad_session'
    }
};

const ADMIN_CREDENTIALS = {
    username: 'admin',
    passHash: '92668751'
};

// =====================================================
// STATE MANAGEMENT
// =====================================================
let state = {
    isLoggedIn: false,
    currentSection: 'dashboard',
    editingPostId: null,
    publicPage: 1,
    adminPage: 1,
    posts: [],
    comments: {},
    currentPostId: null
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        hash = ((hash << 5) - hash) + password.charCodeAt(i);
        hash = hash & hash;
    }
    return hash.toString();
}

function formatDate(dateString, format = 'short') {
    const date = new Date(dateString);
    if (format === 'short') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatNumber(num) {
    if (num >= 1000) {
        return Math.floor(num / 1000) + 'k';
    }
    return num.toLocaleString();
}

function getCategoryClass(category) {
    const map = {
        'Design Trends': 'design',
        'Interior Design': 'interior',
        'Smart Homes': 'smart',
        'Architecture': 'architecture',
        'Landscape': 'landscape'
    };
    return map[category] || 'design';
}

function generateSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// =====================================================
// TOAST NOTIFICATIONS
// =====================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    
    toast.innerHTML = `
        ${icons[type]}
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// =====================================================
// STORAGE FUNCTIONS
// =====================================================
function loadStorage() {
    try {
        const postsData = localStorage.getItem(CONFIG.STORAGE_KEYS.POSTS);
        const commentsData = localStorage.getItem(CONFIG.STORAGE_KEYS.COMMENTS);
        const sessionData = localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION);
        
        if (postsData) {
            state.posts = JSON.parse(postsData);
        } else {
            initSamplePosts();
        }
        
        if (commentsData) {
            state.comments = JSON.parse(commentsData);
        }
        
        if (sessionData) {
            const session = JSON.parse(sessionData);
            if (session.expiry > Date.now()) {
                state.isLoggedIn = true;
            } else {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.SESSION);
            }
        }
    } catch (e) {
        console.error('Error loading storage:', e);
        initSamplePosts();
    }
}

function saveStorage() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.POSTS, JSON.stringify(state.posts));
        localStorage.setItem(CONFIG.STORAGE_KEYS.COMMENTS, JSON.stringify(state.comments));
    } catch (e) {
        console.error('Error saving storage:', e);
    }
}

function initSamplePosts() {
    const images = [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ];
    
    state.posts = [
        {
            id: 1,
            title: 'The Future of Sustainable Luxury Architecture in UAE',
            slug: 'future-sustainable-luxury-architecture-uae',
            category: 'Design Trends',
            date: '2025-12-10',
            excerpt: 'Discover how eco-conscious design is reshaping luxury architecture in the Middle East, from solar integration to sustainable materials.',
            content: '<p>The UAE has long been at the forefront of architectural innovation, and now the region is leading the charge in sustainable luxury design. As global awareness of environmental issues grows, discerning homeowners are increasingly seeking residences that combine opulence with eco-consciousness.</p><h2>Key Sustainability Trends</h2><p>Modern luxury homes are incorporating cutting-edge technologies that reduce environmental impact without compromising on aesthetics or comfort. Solar panels are now seamlessly integrated into roof designs, while advanced glazing systems optimize natural light while minimizing heat gain.</p><blockquote>Sustainability is no longer a compromise—it\'s an enhancement to luxury living that adds both value and meaning to architectural design.</blockquote><p>Water conservation systems, including greywater recycling and rainwater harvesting, are becoming standard features in premium developments. These systems can reduce water consumption by up to 40% while maintaining lush landscapes through smart irrigation technology.</p><h2>Materials of the Future</h2><p>Innovative materials such as cross-laminated timber, recycled steel, and bio-based insulation are replacing traditional construction materials. These alternatives offer superior performance characteristics while significantly reducing the carbon footprint of construction projects.</p>',
            image: images[0],
            status: 'published',
            views: 1523,
            seoTitle: 'Sustainable Luxury Architecture UAE 2025',
            seoDesc: 'Explore how sustainable design practices are transforming luxury architecture in the UAE'
        },
        {
            id: 2,
            title: 'Mastering the Art of Minimalist Luxury Interiors',
            slug: 'mastering-minimalist-luxury-interiors',
            category: 'Interior Design',
            date: '2025-12-05',
            excerpt: 'Explore how the principle of less is more creates spaces of extraordinary refinement and sophisticated simplicity.',
            content: '<p>Minimalist luxury is not about deprivation—it\'s about intentionality. Every element in a minimalist luxury interior earns its place through careful consideration of form, function, and feeling. This design philosophy has gained tremendous traction among UAE homeowners seeking refuge from the visual noise of modern life.</p><h2>The Principles of Refined Simplicity</h2><ul><li>Focus on premium materials that speak for themselves</li><li>Embrace negative space as a design element</li><li>Choose timeless pieces over trendy accessories</li><li>Prioritize quality craftsmanship over quantity</li><li>Create visual hierarchy through subtle contrasts</li></ul><p>The key to successful minimalist design lies in the careful curation of every element. Each piece of furniture, each artwork, each light fixture must be chosen not just for its aesthetic appeal but for how it contributes to the overall harmony of the space.</p>',
            image: images[1],
            status: 'published',
            views: 987,
            seoTitle: 'Minimalist Luxury Interior Design Guide',
            seoDesc: 'Master the art of creating sophisticated minimalist luxury interiors'
        },
        {
            id: 3,
            title: 'Integrating Smart Technology in Luxury Residences',
            slug: 'smart-technology-luxury-residences',
            category: 'Smart Homes',
            date: '2025-11-28',
            excerpt: 'A comprehensive guide to seamlessly incorporating cutting-edge home automation into high-end architectural design.',
            content: '<p>The modern luxury home is as intelligent as it is beautiful. Smart home technology has evolved far beyond simple convenience features to become an integral part of sophisticated living environments that anticipate and respond to residents\' needs.</p><h2>Essential Smart Home Features</h2><p>From automated climate control systems that learn your preferences to integrated security systems that provide peace of mind, today\'s smart homes offer unprecedented levels of comfort and efficiency. Lighting systems can be programmed to adjust throughout the day, mimicking natural light patterns to support circadian rhythms and enhance wellbeing.</p><p>Voice-controlled interfaces and centralized home management systems allow seamless control of every aspect of your living environment. Whether you\'re adjusting the temperature, reviewing security camera footage, or setting the mood for dinner, everything is accessible through intuitive interfaces that blend seamlessly with your home\'s aesthetic.</p>',
            image: images[2],
            status: 'published',
            views: 756,
            seoTitle: 'Smart Home Technology for Luxury Residences',
            seoDesc: 'Guide to integrating smart technology in high-end homes'
        },
        {
            id: 4,
            title: 'Landscape Architecture: Creating Your Private Outdoor Paradise',
            slug: 'landscape-architecture-outdoor-paradise',
            category: 'Landscape',
            date: '2025-11-20',
            excerpt: 'Transform your outdoor spaces into breathtaking sanctuaries that seamlessly extend your living environment into nature.',
            content: '<p>In luxury living, outdoor spaces are not mere afterthoughts—they are essential extensions of the home that deserve equal attention and design consideration. Thoughtfully designed landscapes can double your usable living space while providing immeasurable benefits for mental health and wellbeing.</p><h2>Designing for the UAE Climate</h2><p>Creating lush outdoor environments in the UAE requires careful consideration of local climate conditions. Drought-resistant plants, strategic shading, and efficient irrigation systems are essential components of sustainable landscape design in this region.</p><p>Infinity pools, outdoor kitchens, fire features, and comfortable lounging areas can transform your garden into a resort-like retreat. The key is creating spaces that are both visually stunning and genuinely functional for relaxation and entertainment throughout the year.</p>',
            image: images[3],
            status: 'published',
            views: 623,
            seoTitle: 'Luxury Landscape Design UAE',
            seoDesc: 'Create stunning outdoor living spaces in the UAE'
        },
        {
            id: 5,
            title: 'The Rise of Biophilic Design in Modern Architecture',
            slug: 'biophilic-design-modern-architecture',
            category: 'Architecture',
            date: '2025-11-15',
            excerpt: 'Understanding how the integration of natural elements into built environments enhances wellbeing and creates stunning spaces.',
            content: '<p>Biophilic design recognizes humanity\'s innate connection to nature and seeks to maintain this bond within our built environments. This approach goes beyond simply adding plants to a space—it involves fundamentally rethinking how we design buildings to incorporate natural elements, patterns, and processes.</p><h2>Implementing Biophilic Elements</h2><p>From living walls that purify air to water features that provide soothing soundscapes, there are countless ways to bring nature indoors. Natural materials such as wood, stone, and organic textiles create tactile connections to the natural world, while careful attention to natural light patterns supports our biological rhythms.</p><p>Research consistently shows that biophilic environments reduce stress, enhance creativity, and improve cognitive function. For luxury homeowners, these benefits translate into spaces that not only look beautiful but actively contribute to health and happiness.</p>',
            image: images[4],
            status: 'published',
            views: 845,
            seoTitle: 'Biophilic Design in Modern Architecture',
            seoDesc: 'How biophilic design principles enhance modern homes'
        },
        {
            id: 6,
            title: 'Custom Home Design: The Complete Journey from Vision to Reality',
            slug: 'custom-home-design-journey',
            category: 'Design Trends',
            date: '2025-11-10',
            excerpt: 'A comprehensive guide to navigating the custom home design process, from initial inspiration to move-in day.',
            content: '<p>Building a custom home is one of life\'s most significant undertakings—a journey of discovery that transforms dreams into tangible reality. Understanding the process from start to finish empowers clients to make informed decisions and enjoy the experience of creating their perfect living environment.</p><p>The journey begins with discovery: understanding your lifestyle, aesthetic preferences, and functional requirements. This foundational phase sets the direction for all subsequent design decisions and ensures the final result truly reflects who you are and how you want to live.</p>',
            image: images[5],
            status: 'published',
            views: 534,
            seoTitle: 'Custom Home Design Process Guide',
            seoDesc: 'Complete guide to designing and building a custom luxury home'
        },
        {
            id: 7,
            title: 'Upcoming Trends in Luxury Kitchen Design for 2026',
            slug: 'luxury-kitchen-design-trends-2026',
            category: 'Interior Design',
            date: '2025-11-05',
            excerpt: 'Explore the latest innovations and design directions shaping luxury kitchen spaces in the coming year.',
            content: '<p>The kitchen remains the heart of the home, and luxury kitchen design continues to evolve with changing lifestyles and technological innovations. As we look toward 2026, several emerging trends are poised to reshape how we think about these essential spaces.</p>',
            image: images[0],
            status: 'draft',
            views: 0,
            seoTitle: 'Luxury Kitchen Design Trends 2026',
            seoDesc: 'Preview upcoming trends in luxury kitchen design'
        },
        {
            id: 8,
            title: 'Heritage Restoration: Preserving History While Embracing Modernity',
            slug: 'heritage-restoration-preserving-history',
            category: 'Architecture',
            date: '2025-10-28',
            excerpt: 'The delicate art of restoring historic properties while incorporating modern amenities and sustainable features.',
            content: '<p>Heritage restoration requires a careful balance between preservation and modernization. Historic properties possess irreplaceable character and craftsmanship that deserve protection, yet they must also meet contemporary standards of comfort, efficiency, and safety to remain viable as living spaces.</p>',
            image: images[1],
            status: 'published',
            views: 412,
            seoTitle: 'Heritage Property Restoration Guide',
            seoDesc: 'Expert guide to restoring historic properties'
        },
        {
            id: 9,
            title: 'Indoor-Outdoor Living: Creating Seamless Transitions',
            slug: 'indoor-outdoor-living-seamless-transitions',
            category: 'Landscape',
            date: '2025-10-20',
            excerpt: 'Design strategies for creating fluid connections between interior spaces and outdoor environments.',
            content: '<p>The boundary between indoor and outdoor living continues to blur in luxury design, with architects creating seamless transitions that effectively expand living space and strengthen our connection to the natural environment.</p>',
            image: images[2],
            status: 'published',
            views: 678,
            seoTitle: 'Indoor-Outdoor Living Design',
            seoDesc: 'Creating seamless indoor-outdoor transitions'
        },
        {
            id: 10,
            title: 'The Psychology of Luxury Spaces: Design That Elevates Mood',
            slug: 'psychology-luxury-spaces',
            category: 'Design Trends',
            date: '2025-10-15',
            excerpt: 'Understanding how architectural and interior design elements influence our emotions and daily experiences.',
            content: '<p>The spaces we inhabit profoundly affect our psychological state. Luxury design, at its best, goes beyond visual appeal to create environments that actively support emotional wellbeing, creativity, and quality of life.</p>',
            image: images[3],
            status: 'published',
            views: 923,
            seoTitle: 'Psychology of Luxury Design',
            seoDesc: 'How design influences mood and wellbeing'
        },
        {
            id: 11,
            title: 'Creating Bathroom Spa Retreats: Ultimate Home Relaxation',
            slug: 'bathroom-spa-retreats',
            category: 'Interior Design',
            date: '2025-10-10',
            excerpt: 'Transform your bathroom into a personal spa sanctuary with these design principles and luxury features.',
            content: '<p>The luxury bathroom has evolved from a purely functional space into a personal spa retreat—a sanctuary for relaxation, rejuvenation, and self-care. Modern bathroom design embraces this transformation with features and finishes that rival the finest resort spas.</p>',
            image: images[4],
            status: 'published',
            views: 567,
            seoTitle: 'Luxury Spa Bathroom Design',
            seoDesc: 'Design guide for creating spa-like bathrooms'
        },
        {
            id: 12,
            title: 'Art Integration in Architectural Design: Curating Spaces for Collections',
            slug: 'art-integration-architectural-design',
            category: 'Architecture',
            date: '2025-10-05',
            excerpt: 'How to thoughtfully incorporate art collections into architectural design for stunning visual impact.',
            content: '<p>Art and architecture have always been intertwined, each informing and enhancing the other. For collectors, thoughtful integration of artwork into architectural design creates spaces where art and environment exist in perfect harmony.</p>',
            image: images[5],
            status: 'published',
            views: 445,
            seoTitle: 'Art Integration in Home Design',
            seoDesc: 'Integrating art collections into architectural spaces'
        }
    ];
    
    state.comments = {
        1: [
            { id: 1, name: 'Ahmed Al-Mansour', text: 'Excellent article! Very informative perspective on sustainable architecture in the region.', date: '2025-12-11' },
            { id: 2, name: 'Sarah Mitchell', text: 'This is exactly what I\'ve been looking for. Planning to incorporate these ideas into our villa project.', date: '2025-12-12' }
        ],
        2: [
            { id: 1, name: 'Michael Chen', text: 'Great insights on minimalist design principles. Would love to see more examples.', date: '2025-12-06' }
        ]
    };
    
    saveStorage();
}

// =====================================================
// AUTHENTICATION
// =====================================================
function login(username, password) {
    if (username === ADMIN_CREDENTIALS.username && hashPassword(password) === ADMIN_CREDENTIALS.passHash) {
        state.isLoggedIn = true;
        localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION, JSON.stringify({
            loggedIn: true,
            expiry: Date.now() + 86400000 // 24 hours
        }));
        return true;
    }
    return false;
}

function logout() {
    state.isLoggedIn = false;
    localStorage.removeItem(CONFIG.STORAGE_KEYS.SESSION);
    closeAdminPanel();
    showToast('Logged out successfully', 'info');
}

// =====================================================
// ADMIN PANEL FUNCTIONS
// =====================================================
function openLoginModal() {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.classList.add('active');
}

function closeLoginModal() {
    const overlay = document.getElementById('loginOverlay');
    const error = document.getElementById('loginError');
    const form = document.getElementById('loginForm');
    
    if (overlay) overlay.classList.remove('active');
    if (error) error.classList.remove('show');
    if (form) form.reset();
}

function openAdminPanel() {
    if (state.isLoggedIn) {
        const panel = document.getElementById('adminPanel');
        if (panel) {
            panel.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateDashboard();
            renderAdminTable();
        }
    }
}

function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function switchSection(section) {
    state.currentSection = section;
    
    // Update nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    const sectionEl = document.getElementById(`${section}Section`);
    if (sectionEl) sectionEl.classList.add('active');
    
    // Update title
    const titles = {
        dashboard: 'Dashboard',
        posts: 'Blog Posts',
        users: 'Users',
        settings: 'Settings'
    };
    const titleEl = document.getElementById('adminPageTitle');
    if (titleEl) titleEl.textContent = titles[section] || 'Dashboard';
}

// =====================================================
// POSTS CRUD OPERATIONS
// =====================================================
function getFilteredPosts(filters = {}) {
    let filtered = [...state.posts];
    
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(searchLower) || 
            p.category.toLowerCase().includes(searchLower)
        );
    }
    
    if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters.status) {
        filtered = filtered.filter(p => p.status === filters.status);
    }
    
    if (filters.sort) {
        const [field, order] = filters.sort.split('-');
        filtered.sort((a, b) => {
            let comparison;
            if (field === 'date') {
                comparison = new Date(a.date) - new Date(b.date);
            } else {
                comparison = a.views - b.views;
            }
            return order === 'desc' ? -comparison : comparison;
        });
    } else {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    return filtered;
}

function savePost(data) {
    if (state.editingPostId) {
        const index = state.posts.findIndex(p => p.id === state.editingPostId);
        if (index !== -1) {
            state.posts[index] = { ...state.posts[index], ...data };
        }
    } else {
        const newId = Math.max(0, ...state.posts.map(p => p.id)) + 1;
        state.posts.unshift({
            id: newId,
            slug: generateSlug(data.title),
            ...data,
            views: 0
        });
    }
    
    saveStorage();
    updateDashboard();
    renderAdminTable();
    renderPublicBlog();
    window.dispatchEvent(new CustomEvent('blogUpdated'));
}

function deletePost(id) {
    if (confirm('Are you sure you want to delete this post?')) {
        state.posts = state.posts.filter(p => p.id !== id);
        delete state.comments[id];
        saveStorage();
        updateDashboard();
        renderAdminTable();
        renderPublicBlog();
        showToast('Post deleted successfully', 'success');
    }
}

function incrementViews(id) {
    const post = state.posts.find(p => p.id === id);
    if (post) {
        post.views++;
        saveStorage();
    }
}

// =====================================================
// RENDER FUNCTIONS
// =====================================================
function updateDashboard() {
    const published = state.posts.filter(p => p.status === 'published');
    const drafts = state.posts.filter(p => p.status === 'draft');
    const totalViews = state.posts.reduce((sum, p) => sum + p.views, 0);
    
    const totalPostsStat = document.getElementById('totalPostsStat');
    const publishedPostsStat = document.getElementById('publishedPostsStat');
    const draftPostsStat = document.getElementById('draftPostsStat');
    const totalViewsStat = document.getElementById('totalViewsStat');
    const dashboardTableBody = document.getElementById('dashboardTableBody');
    
    if (totalPostsStat) totalPostsStat.textContent = state.posts.length;
    if (publishedPostsStat) publishedPostsStat.textContent = published.length;
    if (draftPostsStat) draftPostsStat.textContent = drafts.length;
    if (totalViewsStat) totalViewsStat.textContent = formatNumber(totalViews);
    
    if (dashboardTableBody) {
        dashboardTableBody.innerHTML = state.posts.slice(0, 5).map(createTableRow).join('');
    }
}

function createTableRow(post) {
    const categoryClass = getCategoryClass(post.category);
    const date = formatDate(post.date);
    
    return `
        <tr>
            <td class="checkbox"><input type="checkbox" data-id="${post.id}"></td>
            <td>
                <div class="post-title-cell">
                    <img src="${post.image || CONFIG.DEFAULT_IMAGE}" alt="${post.title}" class="post-thumb">
                    <span class="post-title">${post.title}</span>
                </div>
            </td>
            <td><span class="category-badge ${categoryClass}">${post.category}</span></td>
            <td>${date}</td>
            <td>${post.views.toLocaleString()}</td>
            <td><span class="status-badge ${post.status}">${post.status}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" onclick="editPost(${post.id})" aria-label="Edit post">
                        <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn" onclick="openPostModal(${post.id})" aria-label="View post">
                        <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="action-btn delete" onclick="deletePost(${post.id})" aria-label="Delete post">
                        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function renderAdminTable() {
    const searchInput = document.getElementById('adminSearchInput');
    const categoryFilter = document.getElementById('adminCategoryFilter');
    const statusFilter = document.getElementById('adminStatusFilter');
    
    const filters = {
        search: searchInput?.value || '',
        category: categoryFilter?.value || '',
        status: statusFilter?.value || ''
    };
    
    const filtered = getFilteredPosts(filters);
    const start = (state.adminPage - 1) * CONFIG.ADMIN_POSTS_PER_PAGE;
    const end = start + CONFIG.ADMIN_POSTS_PER_PAGE;
    
    const postsTableBody = document.getElementById('postsTableBody');
    const tableInfo = document.getElementById('tableInfo');
    
    if (postsTableBody) {
        postsTableBody.innerHTML = filtered.slice(start, end).map(createTableRow).join('');
    }
    
    if (tableInfo) {
        tableInfo.textContent = `Showing ${Math.min(start + 1, filtered.length)}-${Math.min(end, filtered.length)} of ${filtered.length} posts`;
    }
    
    renderAdminPagination(filtered.length);
}

function renderAdminPagination(total) {
    const pages = Math.ceil(total / CONFIG.ADMIN_POSTS_PER_PAGE);
    const paginationEl = document.getElementById('adminPagination');
    
    if (!paginationEl || pages <= 1) {
        if (paginationEl) paginationEl.innerHTML = '';
        return;
    }
    
    let html = `<button class="page-btn" onclick="changeAdminPage(${state.adminPage - 1})" ${state.adminPage === 1 ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
    </button>`;
    
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || (i >= state.adminPage - 1 && i <= state.adminPage + 1)) {
            html += `<button class="page-btn ${i === state.adminPage ? 'active' : ''}" onclick="changeAdminPage(${i})">${i}</button>`;
        } else if (i === state.adminPage - 2 || i === state.adminPage + 2) {
            html += '<button class="page-btn" disabled>...</button>';
        }
    }
    
    html += `<button class="page-btn" onclick="changeAdminPage(${state.adminPage + 1})" ${state.adminPage === pages ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;
    
    paginationEl.innerHTML = html;
}

function changeAdminPage(page) {
    const filters = {
        search: document.getElementById('adminSearchInput')?.value || '',
        category: document.getElementById('adminCategoryFilter')?.value || '',
        status: document.getElementById('adminStatusFilter')?.value || ''
    };
    const pages = Math.ceil(getFilteredPosts(filters).length / CONFIG.ADMIN_POSTS_PER_PAGE);
    
    if (page < 1 || page > pages) return;
    state.adminPage = page;
    renderAdminTable();
}

function renderPublicBlog() {
    const searchInput = document.getElementById('publicSearchInput');
    const categoryFilter = document.getElementById('publicCategoryFilter');
    const sortFilter = document.getElementById('publicSortFilter');
    
    const filters = {
        search: searchInput?.value || '',
        category: categoryFilter?.value || '',
        sort: sortFilter?.value || 'date-desc'
    };
    
    let filtered = getFilteredPosts(filters).filter(p => p.status === 'published');
    
    const start = (state.publicPage - 1) * CONFIG.POSTS_PER_PAGE;
    const end = start + CONFIG.POSTS_PER_PAGE;
    
    const blogGrid = document.getElementById('publicBlogGrid');
    if (blogGrid) {
        blogGrid.innerHTML = filtered.slice(start, end).map(createBlogCard).join('');
        
        // Add reveal animation
        setTimeout(() => {
            document.querySelectorAll('#publicBlogGrid .blog-card').forEach(card => {
                card.classList.add('reveal', 'active');
            });
        }, 100);
    }
    
    renderPublicPagination(filtered.length);
}

function createBlogCard(post) {
    const date = formatDate(post.date);
    
    return `
        <article class="blog-card" onclick="openPostModal(${post.id})">
            <div class="blog-image">
                <img src="${post.image || CONFIG.DEFAULT_IMAGE}" alt="${post.title}" loading="lazy">
                <span class="blog-date">${date}</span>
                <span class="blog-views">
                    <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ${post.views.toLocaleString()}
                </span>
            </div>
            <div class="blog-content">
                <p class="blog-category">${post.category}</p>
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-excerpt">${post.excerpt}</p>
                <a href="blog-detail.html?id=${post.id}" class="blog-link" onclick="event.stopPropagation();">
                    Read More
                    <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
            </div>
        </article>
    `;
}

function renderPublicPagination(total) {
    const pages = Math.ceil(total / CONFIG.POSTS_PER_PAGE);
    const paginationEl = document.getElementById('publicPagination');
    
    if (!paginationEl || pages <= 1) {
        if (paginationEl) paginationEl.innerHTML = '';
        return;
    }
    
    let html = `<button class="blog-page-btn" onclick="changePublicPage(${state.publicPage - 1})" ${state.publicPage === 1 ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
    </button>`;
    
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || (i >= state.publicPage - 1 && i <= state.publicPage + 1)) {
            html += `<button class="blog-page-btn ${i === state.publicPage ? 'active' : ''}" onclick="changePublicPage(${i})">${i}</button>`;
        } else if (i === state.publicPage - 2 || i === state.publicPage + 2) {
            html += '<button class="blog-page-btn" disabled>...</button>';
        }
    }
    
    html += `<button class="blog-page-btn" onclick="changePublicPage(${state.publicPage + 1})" ${state.publicPage === pages ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;
    
    paginationEl.innerHTML = html;
}

function changePublicPage(page) {
    const filtered = getFilteredPosts({}).filter(p => p.status === 'published');
    const pages = Math.ceil(filtered.length / CONFIG.POSTS_PER_PAGE);
    
    if (page < 1 || page > pages) return;
    state.publicPage = page;
    renderPublicBlog();
    
    const blogSection = document.getElementById('blog');
    if (blogSection) {
        blogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function loadAllPosts() {
    state.publicPage = 1;
    const searchInput = document.getElementById('publicSearchInput');
    const categoryFilter = document.getElementById('publicCategoryFilter');
    const sortFilter = document.getElementById('publicSortFilter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (sortFilter) sortFilter.value = 'date-desc';
    
    renderPublicBlog();
}

// =====================================================
// EDITOR FUNCTIONS
// =====================================================
function openEditor(id = null) {
    state.editingPostId = id;
    
    const editorTitle = document.getElementById('editorTitle');
    const postTitle = document.getElementById('postTitle');
    const postCategory = document.getElementById('postCategory');
    const postDate = document.getElementById('postDate');
    const postExcerpt = document.getElementById('postExcerpt');
    const postContent = document.getElementById('postContent');
    const postSeoTitle = document.getElementById('postSeoTitle');
    const postSeoDesc = document.getElementById('postSeoDesc');
    const publishToggle = document.getElementById('publishToggle');
    const previewImg = document.getElementById('previewImg');
    const imagePreview = document.getElementById('imagePreview');
    
    if (id) {
        const post = state.posts.find(p => p.id === id);
        if (post) {
            if (editorTitle) editorTitle.textContent = 'Edit Post';
            if (postTitle) postTitle.value = post.title;
            if (postCategory) postCategory.value = post.category;
            if (postDate) postDate.value = post.date;
            if (postExcerpt) postExcerpt.value = post.excerpt;
            if (postContent) postContent.innerHTML = post.content;
            if (postSeoTitle) postSeoTitle.value = post.seoTitle || '';
            if (postSeoDesc) postSeoDesc.value = post.seoDesc || '';
            if (publishToggle) publishToggle.checked = post.status === 'published';
            if (post.image && previewImg && imagePreview) {
                previewImg.src = post.image;
                imagePreview.classList.add('show');
            }
        }
    } else {
        if (editorTitle) editorTitle.textContent = 'Create New Post';
        if (postTitle) postTitle.value = '';
        if (postCategory) postCategory.value = 'Design Trends';
        if (postDate) postDate.value = new Date().toISOString().split('T')[0];
        if (postExcerpt) postExcerpt.value = '';
        if (postContent) postContent.innerHTML = '';
        if (postSeoTitle) postSeoTitle.value = '';
        if (postSeoDesc) postSeoDesc.value = '';
        if (publishToggle) publishToggle.checked = true;
        if (imagePreview) imagePreview.classList.remove('show');
    }
    
    const overlay = document.getElementById('editorOverlay');
    if (overlay) overlay.classList.add('active');
}

function closeEditor() {
    const overlay = document.getElementById('editorOverlay');
    if (overlay) overlay.classList.remove('active');
    state.editingPostId = null;
}

function editPost(id) {
    openEditor(id);
}

// =====================================================
// POST MODAL FUNCTIONS
// =====================================================
function openPostModal(id) {
    const post = state.posts.find(p => p.id === id);
    if (!post) return;
    
    incrementViews(id);
    state.currentPostId = id;
    
    const modalImage = document.getElementById('postModalImage');
    const modalTitle = document.getElementById('postModalTitle');
    const modalDate = document.getElementById('postModalDate');
    const modalViews = document.getElementById('postModalViews');
    const modalCategory = document.getElementById('postModalCategory');
    const modalContent = document.getElementById('postModalContent');
    const modalOverlay = document.getElementById('postModalOverlay');
    
    if (modalImage) {
        modalImage.src = post.image || CONFIG.DEFAULT_IMAGE;
        modalImage.alt = post.title;
    }
    if (modalTitle) modalTitle.textContent = post.title;
    if (modalDate) modalDate.textContent = formatDate(post.date, 'long');
    if (modalViews) modalViews.textContent = post.views.toLocaleString();
    if (modalCategory) modalCategory.textContent = post.category;
    if (modalContent) modalContent.innerHTML = post.content;
    
    renderComments(id);
    
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        modalOverlay.dataset.postId = id;
        document.body.style.overflow = 'hidden';
    }
}

function closePostModal() {
    const overlay = document.getElementById('postModalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    state.currentPostId = null;
}

// =====================================================
// COMMENTS FUNCTIONS
// =====================================================
function renderComments(postId) {
    const comments = state.comments[postId] || [];
    const commentList = document.getElementById('commentList');
    const commentsCount = document.getElementById('commentsCount');
    
    if (commentsCount) {
        commentsCount.textContent = `${comments.length} comment${comments.length !== 1 ? 's' : ''}`;
    }
    
    if (commentList) {
        if (comments.length === 0) {
            commentList.innerHTML = '<p style="color:var(--light-gray);text-align:center;padding:2rem">No comments yet. Be the first to share your thoughts!</p>';
        } else {
            commentList.innerHTML = comments.map(comment => `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${comment.name}</span>
                        <span class="comment-date">${formatDate(comment.date)}</span>
                    </div>
                    <p class="comment-text">${comment.text}</p>
                </div>
            `).join('');
        }
    }
}

function submitComment() {
    const postId = state.currentPostId;
    if (!postId) return;
    
    const textEl = document.getElementById('commentText');
    const nameEl = document.getElementById('commentName');
    const emailEl = document.getElementById('commentEmail');
    
    const text = textEl?.value.trim();
    const name = nameEl?.value.trim();
    const email = emailEl?.value.trim();
    
    if (!text || !name || !email) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (!state.comments[postId]) {
        state.comments[postId] = [];
    }
    
    state.comments[postId].push({
        id: state.comments[postId].length + 1,
        name,
        text,
        date: new Date().toISOString().split('T')[0]
    });
    
    saveStorage();
    
    if (textEl) textEl.value = '';
    if (nameEl) nameEl.value = '';
    if (emailEl) emailEl.value = '';
    
    renderComments(postId);
    showToast('Comment posted successfully!', 'success');
}

// =====================================================
// SHARE FUNCTIONS
// =====================================================
function sharePost(platform) {
    const title = document.getElementById('postModalTitle')?.textContent || '';
    const url = window.location.href;
    
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
    
    if (platform === 'copy') {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copied to clipboard!', 'success');
        });
    } else if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

// =====================================================
// EXPORT FUNCTIONS
// =====================================================
function exportCSV() {
    const headers = ['ID', 'Title', 'Category', 'Date', 'Status', 'Views', 'SEO Title', 'SEO Description'];
    const rows = state.posts.map(post => [
        post.id,
        `"${post.title.replace(/"/g, '""')}"`,
        post.category,
        post.date,
        post.status,
        post.views,
        `"${(post.seoTitle || '').replace(/"/g, '""')}"`,
        `"${(post.seoDesc || '').replace(/"/g, '""')}"`
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-posts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully!', 'success');
}

// =====================================================
// IMAGE UPLOAD
// =====================================================
function handleImageUpload(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('previewImg');
        const imagePreview = document.getElementById('imagePreview');
        
        if (previewImg) previewImg.src = e.target.result;
        if (imagePreview) imagePreview.classList.add('show');
    };
    reader.readAsDataURL(file);
}

// =====================================================
// WYSIWYG EDITOR
// =====================================================
function execCommand(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('postContent')?.focus();
}

// Store selection for link/image insertion
let savedSelection = null;

function saveSelection() {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
        savedSelection = sel.getRangeAt(0);
    }
}

function restoreSelection() {
    if (savedSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelection);
    }
}

// Font family handler
function handleFontFamily(fontName) {
    if (fontName) {
        document.execCommand('fontName', false, fontName);
        document.getElementById('postContent')?.focus();
    }
}

// Font size handler
function handleFontSize(size) {
    if (size) {
        document.execCommand('fontSize', false, size);
        document.getElementById('postContent')?.focus();
    }
}

// Text color handler
function handleTextColor(color) {
    document.execCommand('foreColor', false, color);
    const indicator = document.getElementById('textColorIndicator');
    if (indicator) indicator.style.fill = color;
    document.getElementById('postContent')?.focus();
}

// Background color handler
function handleBgColor(color) {
    document.execCommand('hiliteColor', false, color);
    document.getElementById('postContent')?.focus();
}

// Insert link
function insertLinkAtSelection(url, text) {
    restoreSelection();
    const editor = document.getElementById('postContent');
    if (!editor) return;
    
    editor.focus();
    
    if (text && savedSelection.collapsed) {
        // No text selected, insert link with text
        const link = document.createElement('a');
        link.href = url;
        link.textContent = text;
        link.target = '_blank';
        savedSelection.insertNode(link);
    } else {
        // Text is selected, wrap it in a link
        document.execCommand('createLink', false, url);
        // Set target blank for the newly created link
        const sel = window.getSelection();
        if (sel.anchorNode) {
            let parent = sel.anchorNode.parentElement;
            if (parent.tagName === 'A') {
                parent.target = '_blank';
            }
        }
    }
}

// Insert image at cursor
function insertImageAtCursor(imageUrl) {
    restoreSelection();
    const editor = document.getElementById('postContent');
    if (!editor) return;
    
    editor.focus();
    document.execCommand('insertImage', false, imageUrl);
}

// Handle content image upload
function handleContentImageUpload(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        insertImageAtCursor(e.target.result);
    };
    reader.readAsDataURL(file);
}

// =====================================================
// CONTACT FORM
// =====================================================
function handleContactForm(e) {
    e.preventDefault();
    const name = document.getElementById('contactName')?.value;
    showToast(`Thank you ${name}! We'll be in touch soon.`, 'success');
    e.target.reset();
}

// =====================================================
// INITIALIZATION
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    // Load stored data
    loadStorage();
    
    // Render blog if on blog page
    if (document.getElementById('publicBlogGrid')) {
        renderPublicBlog();
    }
    
    // Hide loader
    setTimeout(() => {
        const loader = document.querySelector('.loader');
        if (loader) loader.classList.add('hidden');
    }, 1000);
    
    // Scroll handler for nav
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 100);
    });
    
    // Reveal animations
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        reveals.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight - 50) {
                el.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    setTimeout(revealOnScroll, 100);
    revealOnScroll();
    
    // Mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mobileMenu?.classList.add('active');
            mobileMenuOverlay?.classList.add('active');
        });
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu?.classList.remove('active');
            mobileMenuOverlay?.classList.remove('active');
        });
    }
    
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', () => {
            mobileMenu?.classList.remove('active');
            mobileMenuOverlay?.classList.remove('active');
        });
    }
    
    // Admin trigger
    const adminTrigger = document.getElementById('adminTrigger');
    if (adminTrigger) {
        adminTrigger.addEventListener('click', () => {
            if (state.isLoggedIn) {
                openAdminPanel();
            } else {
                openLoginModal();
            }
        });
    }
    
    // Login modal
    const loginClose = document.getElementById('loginClose');
    const loginOverlay = document.getElementById('loginOverlay');
    const loginForm = document.getElementById('loginForm');
    
    if (loginClose) loginClose.addEventListener('click', closeLoginModal);
    if (loginOverlay) {
        loginOverlay.addEventListener('click', (e) => {
            if (e.target === loginOverlay) closeLoginModal();
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername')?.value;
            const password = document.getElementById('loginPassword')?.value;
            
            if (login(username, password)) {
                closeLoginModal();
                openAdminPanel();
                showToast('Welcome back, Administrator!', 'success');
            } else {
                document.getElementById('loginError')?.classList.add('show');
            }
        });
    }
    
    // Admin logout
    const adminLogout = document.getElementById('adminLogout');
    if (adminLogout) adminLogout.addEventListener('click', logout);
    
    // Admin nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(item.dataset.section);
        });
    });
    
    // Add new post buttons
    const addNewPostBtn = document.getElementById('addNewPostBtn');
    const addNewPostBtn2 = document.getElementById('addNewPostBtn2');
    if (addNewPostBtn) addNewPostBtn.addEventListener('click', () => openEditor());
    if (addNewPostBtn2) addNewPostBtn2.addEventListener('click', () => openEditor());
    
    // Editor controls
    const editorClose = document.getElementById('editorClose');
    const cancelPost = document.getElementById('cancelPost');
    const savePostBtn = document.getElementById('savePost');
    const featuredImage = document.getElementById('featuredImage');
    
    if (editorClose) editorClose.addEventListener('click', closeEditor);
    if (cancelPost) cancelPost.addEventListener('click', closeEditor);
    
    if (savePostBtn) {
        savePostBtn.addEventListener('click', () => {
            const title = document.getElementById('postTitle')?.value.trim();
            if (!title) {
                showToast('Please enter a title', 'error');
                return;
            }
            
            savePost({
                title,
                category: document.getElementById('postCategory')?.value,
                date: document.getElementById('postDate')?.value,
                excerpt: document.getElementById('postExcerpt')?.value.trim(),
                content: document.getElementById('postContent')?.innerHTML,
                seoTitle: document.getElementById('postSeoTitle')?.value.trim(),
                seoDesc: document.getElementById('postSeoDesc')?.value.trim(),
                status: document.getElementById('publishToggle')?.checked ? 'published' : 'draft',
                image: document.getElementById('previewImg')?.src || CONFIG.DEFAULT_IMAGE
            });
            
            closeEditor();
            showToast(state.editingPostId ? 'Post updated successfully!' : 'Post created successfully!', 'success');
        });
    }
    
    if (featuredImage) {
        featuredImage.addEventListener('change', (e) => handleImageUpload(e.target.files[0]));
    }
    
    // Load image from URL
    const loadImageUrl = document.getElementById('loadImageUrl');
    if (loadImageUrl) {
        loadImageUrl.addEventListener('click', () => {
            const urlInput = document.getElementById('featuredImageUrl');
            const url = urlInput?.value.trim();
            if (url) {
                const previewImg = document.getElementById('previewImg');
                const imagePreview = document.getElementById('imagePreview');
                
                // Test if image URL is valid
                const testImg = new Image();
                testImg.onload = function() {
                    previewImg.src = url;
                    imagePreview?.classList.add('show');
                    showToast('Image loaded successfully!', 'success');
                };
                testImg.onerror = function() {
                    showToast('Failed to load image. Please check the URL.', 'error');
                };
                testImg.src = url;
            } else {
                showToast('Please enter an image URL', 'error');
            }
        });
    }
    
    // Remove featured image
    const removeImage = document.getElementById('removeImage');
    if (removeImage) {
        removeImage.addEventListener('click', () => {
            const previewImg = document.getElementById('previewImg');
            const imagePreview = document.getElementById('imagePreview');
            const featuredImageInput = document.getElementById('featuredImage');
            const featuredImageUrl = document.getElementById('featuredImageUrl');
            
            if (previewImg) previewImg.src = '';
            if (imagePreview) imagePreview.classList.remove('show');
            if (featuredImageInput) featuredImageInput.value = '';
            if (featuredImageUrl) featuredImageUrl.value = '';
        });
    }
    
    // WYSIWYG buttons
    document.querySelectorAll('.wysiwyg-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (btn.dataset.command) {
                execCommand(btn.dataset.command, btn.dataset.value || null);
            }
        });
    });
    
    // Font Family selector
    const fontFamily = document.getElementById('fontFamily');
    if (fontFamily) {
        fontFamily.addEventListener('change', (e) => {
            handleFontFamily(e.target.value);
        });
    }
    
    // Font Size selector
    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        fontSize.addEventListener('change', (e) => {
            handleFontSize(e.target.value);
        });
    }
    
    // Format Block selector (Paragraph, Heading 1, etc.)
    const formatBlockSelect = document.getElementById('formatBlock');
    if (formatBlockSelect) {
        formatBlockSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                execCommand('formatBlock', e.target.value);
            }
        });
    }
    
    // Code Block insertion
    const insertCodeBtn = document.getElementById('insertCodeBtn');
    if (insertCodeBtn) {
        insertCodeBtn.addEventListener('click', () => {
            execCommand('formatBlock', 'pre');
        });
    }
    
    // Table insertion
    const insertTableBtn = document.getElementById('insertTableBtn');
    if (insertTableBtn) {
        insertTableBtn.addEventListener('click', () => {
            const rows = prompt('Number of rows:', '3');
            const cols = prompt('Number of columns:', '3');
            if (rows && cols) {
                let table = '<table style="width:100%; border-collapse:collapse; margin:1rem 0;">';
                for (let i = 0; i < parseInt(rows); i++) {
                    table += '<tr>';
                    for (let j = 0; j < parseInt(cols); j++) {
                        const cellTag = i === 0 ? 'th' : 'td';
                        table += `<${cellTag} style="border:1px solid var(--medium-gray); padding:0.5rem;">${i === 0 ? 'Header ' + (j + 1) : ''}</${cellTag}>`;
                    }
                    table += '</tr>';
                }
                table += '</table>';
                execCommand('insertHTML', table);
            }
        });
    }
    
    // Text Color
    const textColorPicker = document.getElementById('textColorPicker');
    const textColorBtn = document.getElementById('textColorBtn');
    if (textColorPicker && textColorBtn) {
        textColorBtn.addEventListener('click', () => textColorPicker.click());
        textColorPicker.addEventListener('input', (e) => {
            handleTextColor(e.target.value);
            // Update color indicator
            const indicator = document.getElementById('textColorIndicator');
            if (indicator) {
                indicator.style.background = e.target.value;
            }
        });
    }
    
    // Background Color
    const bgColorPicker = document.getElementById('bgColorPicker');
    const bgColorBtn = document.getElementById('bgColorBtn');
    if (bgColorPicker && bgColorBtn) {
        bgColorBtn.addEventListener('click', () => bgColorPicker.click());
        bgColorPicker.addEventListener('input', (e) => handleBgColor(e.target.value));
    }
    
    // Link insertion
    const insertLinkBtn = document.getElementById('insertLinkBtn');
    const linkModalOverlay = document.getElementById('linkModalOverlay');
    const cancelLink = document.getElementById('cancelLink');
    const insertLink = document.getElementById('insertLink');
    
    if (insertLinkBtn) {
        insertLinkBtn.addEventListener('click', () => {
            saveSelection();
            const sel = window.getSelection();
            if (sel.toString()) {
                document.getElementById('linkText').value = sel.toString();
            }
            linkModalOverlay?.classList.add('active');
        });
    }
    
    if (cancelLink) {
        cancelLink.addEventListener('click', () => {
            linkModalOverlay?.classList.remove('active');
            document.getElementById('linkText').value = '';
            document.getElementById('linkUrl').value = '';
        });
    }
    
    if (insertLink) {
        insertLink.addEventListener('click', () => {
            const url = document.getElementById('linkUrl')?.value;
            const text = document.getElementById('linkText')?.value;
            
            if (url) {
                insertLinkAtSelection(url, text);
                linkModalOverlay?.classList.remove('active');
                document.getElementById('linkText').value = '';
                document.getElementById('linkUrl').value = '';
            } else {
                showToast('Please enter a URL', 'error');
            }
        });
    }
    
    // Image insertion
    const insertImageBtn = document.getElementById('insertImageBtn');
    const contentImageUpload = document.getElementById('contentImageUpload');
    
    if (insertImageBtn && contentImageUpload) {
        insertImageBtn.addEventListener('click', () => {
            saveSelection();
            contentImageUpload.click();
        });
        
        contentImageUpload.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                handleContentImageUpload(e.target.files[0]);
                e.target.value = '';
            }
        });
    }
    
    // Save selection when editor loses focus
    const postContent = document.getElementById('postContent');
    if (postContent) {
        postContent.addEventListener('blur', saveSelection);
    }
    
    // Post modal
    const postModalClose = document.getElementById('postModalClose');
    const postModalOverlay = document.getElementById('postModalOverlay');
    
    if (postModalClose) postModalClose.addEventListener('click', closePostModal);
    if (postModalOverlay) {
        postModalOverlay.addEventListener('click', (e) => {
            if (e.target === postModalOverlay) closePostModal();
        });
    }
    
    // Search and filters
    let searchTimeout;
    const adminSearchInput = document.getElementById('adminSearchInput');
    const adminCategoryFilter = document.getElementById('adminCategoryFilter');
    const adminStatusFilter = document.getElementById('adminStatusFilter');
    const publicSearchInput = document.getElementById('publicSearchInput');
    const publicCategoryFilter = document.getElementById('publicCategoryFilter');
    const publicSortFilter = document.getElementById('publicSortFilter');
    
    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                state.adminPage = 1;
                renderAdminTable();
            }, 300);
        });
    }
    
    if (adminCategoryFilter) {
        adminCategoryFilter.addEventListener('change', () => {
            state.adminPage = 1;
            renderAdminTable();
        });
    }
    
    if (adminStatusFilter) {
        adminStatusFilter.addEventListener('change', () => {
            state.adminPage = 1;
            renderAdminTable();
        });
    }
    
    if (publicSearchInput) {
        publicSearchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                state.publicPage = 1;
                renderPublicBlog();
            }, 300);
        });
    }
    
    if (publicCategoryFilter) {
        publicCategoryFilter.addEventListener('change', () => {
            state.publicPage = 1;
            renderPublicBlog();
        });
    }
    
    if (publicSortFilter) {
        publicSortFilter.addEventListener('change', () => {
            state.publicPage = 1;
            renderPublicBlog();
        });
    }
    
    // Export CSV
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportCSV);
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', handleContactForm);
    
    // Blog updated event
    window.addEventListener('blogUpdated', () => renderPublicBlog());
    
    // Listen for localStorage changes from other tabs (admin dashboard)
    window.addEventListener('storage', (e) => {
        if (e.key === CONFIG.STORAGE_KEYS.POSTS) {
            // Reload posts from localStorage
            try {
                const postsData = localStorage.getItem(CONFIG.STORAGE_KEYS.POSTS);
                if (postsData) {
                    state.posts = JSON.parse(postsData);
                    // Re-render blog if on blog page
                    if (document.getElementById('publicBlogGrid')) {
                        renderPublicBlog();
                        showToast('Blog updated with new content!', 'info');
                    }
                }
            } catch (e) {
                console.error('Error syncing posts:', e);
            }
        }
    });
    
    // Also refresh posts when page becomes visible (user switches back to tab)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Reload posts from localStorage
            try {
                const postsData = localStorage.getItem(CONFIG.STORAGE_KEYS.POSTS);
                if (postsData) {
                    const newPosts = JSON.parse(postsData);
                    // Check if posts have changed
                    if (JSON.stringify(newPosts) !== JSON.stringify(state.posts)) {
                        state.posts = newPosts;
                        if (document.getElementById('publicBlogGrid')) {
                            renderPublicBlog();
                        }
                    }
                }
            } catch (e) {
                console.error('Error refreshing posts:', e);
            }
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLoginModal();
            closeEditor();
            closePostModal();
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    mobileMenu?.classList.remove('active');
                    mobileMenuOverlay?.classList.remove('active');
                }
            }
        });
    });
});

// Make functions globally available
window.openPostModal = openPostModal;
window.closePostModal = closePostModal;
window.editPost = editPost;
window.deletePost = deletePost;
window.changeAdminPage = changeAdminPage;
window.changePublicPage = changePublicPage;
window.loadAllPosts = loadAllPosts;
window.sharePost = sharePost;
window.submitComment = submitComment;

// =====================================================
// AWARD SECTION CELEBRATION CONFETTI
// =====================================================
(function() {
    let confettiTriggered = false;
    let hasScrolled = false;
    const section = document.getElementById('awardSection');
    if (!section) return;

    function onScroll() {
        hasScrolled = true;
        if (confettiTriggered) return;
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50 && rect.bottom > 0) {
            confettiTriggered = true;
            startAwardConfetti();
            window.removeEventListener('scroll', onScroll);
        }
    }

    window.addEventListener('scroll', onScroll);
    // Don't auto-trigger on load — wait for user to scroll
})();

function startAwardConfetti() {
    const canvas = document.getElementById('awardConfetti');
    const section = document.getElementById('awardSection');
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    canvas.width = section.offsetWidth;
    canvas.height = section.offsetHeight;

    const colors = ['#C9A962', '#E8D5A3', '#F5F3EF', '#A88B4A', '#FFD700', '#FFF8DC', '#FFFFFF', '#D4AF37'];
    const particles = [];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -Math.random() * canvas.height * 1.5,
            w: Math.random() * 10 + 4,
            h: Math.random() * 5 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 1.5,
            rot: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10,
            opacity: Math.random() * 0.5 + 0.5
        });
    }

    let frame = 0;
    const maxFrames = 300;

    function animate() {
        if (frame > maxFrames) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.rotSpeed;
            p.vy += 0.02;
            if (frame > maxFrames - 80) p.opacity -= 0.006;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });

        frame++;
        requestAnimationFrame(animate);
    }

    animate();
}
