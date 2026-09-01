import './style.css';

const modules = import.meta.glob('../projects/*/project.js', { eager: true });
const projects = Object.values(modules)
  .map((module) => module.manifest ?? module.default)
  .filter((project) => project && typeof project.slug === 'string' && typeof project.mount === 'function')
  .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));

const DEFAULT_THEME = {
  surface: '#e9e4d8',
  ink: '#26352d',
  accent: '#9f6479',
};

const host = document.querySelector('#project-host');
const switcher = document.querySelector('.project-switcher');
const trigger = document.querySelector('#project-trigger');
const triggerLabel = document.querySelector('#project-trigger-label');
const menu = document.querySelector('#project-menu-list');
const workspaceTitle = document.querySelector('[data-role="workspace-title"]');
const status = document.querySelector('#workspace-status');
const loading = document.querySelector('#workspace-loading');
const error = document.querySelector('#workspace-error');
const errorMessage = document.querySelector('#workspace-error-message');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

let currentDestroy = null;
let currentProject = null;
let menuOpen = false;
let focusedIndex = 0;

function setUrlProject(slug) {
  const url = new URL(window.location.href);
  url.searchParams.set('project', slug);
  window.history.replaceState({}, '', `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
}

function setStatus(message = '') {
  status.textContent = message;
  status.hidden = !message;
}

function applyTheme(project) {
  const theme = { ...DEFAULT_THEME, ...(project?.theme ?? {}) };
  const rootStyle = document.documentElement.style;

  ['surface', 'ink', 'accent'].forEach((key) => {
    if (typeof theme[key] === 'string' && theme[key].trim()) {
      rootStyle.setProperty(`--workspace-${key}`, theme[key]);
    }
  });

  themeColorMeta?.setAttribute('content', theme.surface);
}

function updateCurrentProject(project) {
  currentProject = project;
  workspaceTitle.textContent = project.title;
  triggerLabel.textContent = project.title;
  trigger.setAttribute('aria-label', `切换工程，当前为${project.title}`);

  menu.querySelectorAll('[data-project-option]').forEach((option) => {
    const isSelected = option.dataset.projectOption === project.slug;
    option.setAttribute('aria-selected', String(isSelected));
    option.tabIndex = isSelected ? 0 : -1;
  });
}

function setLoading(isLoading) {
  loading.hidden = !isLoading;
  trigger.disabled = isLoading || projects.length === 0;
  trigger.setAttribute('aria-busy', String(isLoading));

  if (isLoading) {
    setStatus('载入中');
    closeMenu();
  }
}

function showError(message) {
  errorMessage.textContent = message;
  error.hidden = false;
  setStatus('载入失败');
}

function hideError() {
  error.hidden = true;
}

function getOptions() {
  return [...menu.querySelectorAll('[data-project-option]')];
}

function updateFocusedOption(index) {
  const options = getOptions();
  if (!options.length) return;

  focusedIndex = (index + options.length) % options.length;
  options.forEach((option, optionIndex) => {
    option.classList.toggle('is-focused', optionIndex === focusedIndex);
  });
  options[focusedIndex].focus();
}

function openMenu({ focus = true } = {}) {
  if (trigger.disabled || !projects.length) return;

  menuOpen = true;
  menu.hidden = false;
  switcher.classList.add('is-open');
  trigger.setAttribute('aria-expanded', 'true');

  const selectedIndex = projects.findIndex((project) => project.slug === currentProject?.slug);
  focusedIndex = selectedIndex >= 0 ? selectedIndex : 0;
  if (focus) updateFocusedOption(focusedIndex);
}

function closeMenu({ restoreFocus = false } = {}) {
  if (!menuOpen && menu.hidden) return;

  menuOpen = false;
  menu.hidden = true;
  switcher.classList.remove('is-open');
  trigger.setAttribute('aria-expanded', 'false');
  menu.querySelectorAll('.is-focused').forEach((option) => option.classList.remove('is-focused'));

  if (restoreFocus && !trigger.disabled) trigger.focus();
}

function toggleMenu() {
  if (menuOpen) closeMenu();
  else openMenu();
}

async function loadProject(slug, { updateUrl = true } = {}) {
  const project = projects.find((candidate) => candidate.slug === slug) ?? projects[0];
  if (!project) {
    showError('没有找到可用的 p5.js 工程。');
    trigger.disabled = true;
    return;
  }

  if (updateUrl) setUrlProject(project.slug);
  setLoading(true);
  hideError();
  applyTheme(project);

  try {
    currentDestroy?.();
  } catch (destroyError) {
    console.error('销毁当前工程时发生错误：', destroyError);
  }
  currentDestroy = null;
  host.replaceChildren();
  updateCurrentProject(project);
  setStatus(`载入 ${project.title}`);

  try {
    const destroy = await project.mount(host);
    currentDestroy = typeof destroy === 'function' ? destroy : () => {};
    document.title = `${project.title} | 飞鸟实验室`;
    setStatus('');
  } catch (loadError) {
    host.replaceChildren();
    showError(loadError instanceof Error ? loadError.message : '未知错误');
  } finally {
    setLoading(false);
  }
}

projects.forEach((project) => {
  const option = document.createElement('button');
  option.type = 'button';
  option.className = 'project-option';
  option.setAttribute('role', 'option');
  option.setAttribute('aria-selected', 'false');
  option.tabIndex = -1;
  option.dataset.projectOption = project.slug;
  option.textContent = project.title;
  option.addEventListener('click', () => {
    closeMenu();
    loadProject(project.slug);
  });
  menu.append(option);
});

trigger.addEventListener('click', toggleMenu);
trigger.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openMenu();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    openMenu();
    updateFocusedOption(focusedIndex - 1);
  } else if (event.key === 'Escape') {
    closeMenu();
  }
});

menu.addEventListener('keydown', (event) => {
  const options = getOptions();
  if (!options.length) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    updateFocusedOption(focusedIndex + 1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    updateFocusedOption(focusedIndex - 1);
  } else if (event.key === 'Home') {
    event.preventDefault();
    updateFocusedOption(0);
  } else if (event.key === 'End') {
    event.preventDefault();
    updateFocusedOption(options.length - 1);
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    const project = projects[focusedIndex];
    closeMenu();
    loadProject(project.slug);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeMenu({ restoreFocus: true });
  } else if (event.key === 'Tab') {
    closeMenu();
  }
});

document.addEventListener('pointerdown', (event) => {
  if (menuOpen && !switcher.contains(event.target)) closeMenu();
});

window.addEventListener('popstate', () => {
  const slug = new URL(window.location.href).searchParams.get('project');
  loadProject(slug, { updateUrl: false });
});

const requestedProject = new URL(window.location.href).searchParams.get('project');
loadProject(requestedProject);
