// State
let categories = [
  { id: 'inbox', name: 'inbox', icon: 'inbox' },
  { id: 'work', name: 'work', icon: 'briefcase' },
  { id: 'personal', name: 'personal', icon: 'user' },
  { id: 'ideas', name: 'ideas', icon: 'lightbulb' }
];

let tasks = [
  { id: 1, text: 'Welcome to TaskCord!', completed: false, priority: 'medium', category: 'inbox', createdAt: new Date() },
  { id: 2, text: 'Add your first task below', completed: false, priority: 'low', category: 'inbox', createdAt: new Date() },
  { id: 3, text: 'Click the checkbox to complete', completed: true, priority: 'high', category: 'inbox', createdAt: new Date() }
];

let currentCategory = 'inbox';
let currentFilter = 'all';
let searchQuery = '';

// Load from localStorage
function loadData() {
  const savedCategories = localStorage.getItem('taskcord-categories');
  const savedTasks = localStorage.getItem('taskcord-tasks');
  
  if (savedCategories) {
    categories = JSON.parse(savedCategories);
  }
  if (savedTasks) {
    tasks = JSON.parse(savedTasks).map(t => ({
      ...t,
      createdAt: new Date(t.createdAt)
    }));
  }
}

// Save to localStorage
function saveData() {
  localStorage.setItem('taskcord-categories', JSON.stringify(categories));
  localStorage.setItem('taskcord-tasks', JSON.stringify(tasks));
}

// DOM Elements
const categoryList = document.getElementById('category-list');
const taskList = document.getElementById('task-list');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const addTaskBtn = document.getElementById('add-task-btn');
const searchInput = document.getElementById('search-input');
const currentCategoryEl = document.getElementById('current-category');
const progressCircle = document.getElementById('progress-circle');
const progressText = document.getElementById('progress-text');
const filterBtns = document.querySelectorAll('.filter-btn');
const addCategoryBtn = document.getElementById('add-category-btn');
const addCategoryModal = document.getElementById('add-category-modal');
const newCategoryInput = document.getElementById('new-category-input');
const cancelCategoryBtn = document.getElementById('cancel-category');
const confirmCategoryBtn = document.getElementById('confirm-category');
const mobileMenu = document.getElementById('mobile-menu');
const mobileClose = document.getElementById('mobile-close');
const categorySidebar = document.getElementById('category-sidebar');

// Icons
const icons = {
  inbox: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  briefcase: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  lightbulb: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.9V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.1A7 7 0 0 0 12 2z"/></svg>',
  hash: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>'
};

// Render categories
function renderCategories() {
  categoryList.innerHTML = categories.map(cat => {
    const taskCount = tasks.filter(t => t.category === cat.id && !t.completed).length;
    const icon = icons[cat.icon] || icons.hash;
    return `
      <li class="category-item ${cat.id === currentCategory ? 'active' : ''}" data-category="${cat.id}">
        ${icon}
        <span class="category-name">${cat.name}</span>
        ${taskCount > 0 ? `<span class="category-count">${taskCount}</span>` : ''}
      </li>
    `;
  }).join('');

  // Add click handlers
  document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
      currentCategory = item.dataset.category;
      currentCategoryEl.textContent = currentCategory;
      renderCategories();
      renderTasks();
      closeMobileSidebar();
    });
  });
}

// Filter and search tasks
function getFilteredTasks() {
  return tasks.filter(task => {
    const matchesCategory = task.category === currentCategory;
    const matchesFilter = 
      currentFilter === 'all' ? true :
      currentFilter === 'active' ? !task.completed :
      task.completed;
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesFilter && matchesSearch;
  });
}

// Render tasks
function renderTasks() {
  const filteredTasks = getFilteredTasks();
  
  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <h3>No tasks yet</h3>
        <p>Add a task to get started!</p>
      </div>
    `;
    return;
  }

  taskList.innerHTML = filteredTasks.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div class="task-content">
        <div class="task-text">${escapeHtml(task.text)}</div>
        <div class="task-meta">
          <span class="task-priority ${task.priority}">${task.priority}</span>
          <span class="task-date">${formatDate(task.createdAt)}</span>
        </div>
      </div>
      <button class="task-delete" data-id="${task.id}" title="Delete task">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  `).join('');

  // Add checkbox handlers
  document.querySelectorAll('.task-checkbox').forEach(checkbox => {
    checkbox.addEventListener('click', () => {
      const id = parseInt(checkbox.dataset.id);
      toggleTask(id);
    });
  });

  // Add delete handlers
  document.querySelectorAll('.task-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      deleteTask(id);
    });
  });
}

// Update progress ring
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const circumference = 2 * Math.PI * 16; // r=16
  const offset = circumference - (percentage / 100) * circumference;
  
  progressCircle.style.strokeDashoffset = offset;
  progressText.textContent = `${percentage}%`;
}

// Add task
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text,
    completed: false,
    priority: prioritySelect.value,
    category: currentCategory,
    createdAt: new Date()
  };

  tasks.unshift(newTask);
  taskInput.value = '';
  saveData();
  renderTasks();
  renderCategories();
  updateProgress();
}

// Toggle task completion
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveData();
    renderTasks();
    renderCategories();
    updateProgress();
  }
}

// Delete task
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveData();
  renderTasks();
  renderCategories();
  updateProgress();
}

// Add category
function addCategory() {
  const name = newCategoryInput.value.trim().toLowerCase();
  if (!name) return;
  if (categories.find(c => c.name === name)) return;

  categories.push({
    id: name.replace(/\s+/g, '-'),
    name,
    icon: 'hash'
  });

  newCategoryInput.value = '';
  addCategoryModal.classList.remove('active');
  saveData();
  renderCategories();
}

// Helper functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function closeMobileSidebar() {
  categorySidebar.classList.remove('open');
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderTasks();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

addCategoryBtn.addEventListener('click', () => {
  addCategoryModal.classList.add('active');
  newCategoryInput.focus();
});

cancelCategoryBtn.addEventListener('click', () => {
  addCategoryModal.classList.remove('active');
  newCategoryInput.value = '';
});

confirmCategoryBtn.addEventListener('click', addCategory);

newCategoryInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addCategory();
});

addCategoryModal.addEventListener('click', (e) => {
  if (e.target === addCategoryModal) {
    addCategoryModal.classList.remove('active');
    newCategoryInput.value = '';
  }
});

mobileMenu.addEventListener('click', () => {
  categorySidebar.classList.add('open');
});

mobileClose.addEventListener('click', closeMobileSidebar);

// Initialize
loadData();
renderCategories();
renderTasks();
updateProgress();
