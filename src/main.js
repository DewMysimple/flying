import './style.css';

const modules = import.meta.glob('../projects/*/project.js', { eager: true });
const projects = Object.values(modules)
  .map((module) => module.manifest ?? module.default)
  .filter((project) => project && typeof project.slug === 'string' && typeof project.mount === 'function')
  .sort((a, b) => (a.title ?? a.slug).localeCompare(b.title ?? b.slug, 'zh-CN'));

const DEFAULT_THEME = {
  surface: '#e9e4d8',
  ink: '#26352d',
  accent: '#9f6479',
};
const PROJECT_ICONS = {
  bird: {
    paths: [
      'M3.5 14.5c2.5-4.2 5.8-6.3 9.8-6.3 2.7 0 4.9 1.2 7.2 3.5-2.6-.3-4.8.3-6.5 1.8-1.7 1.5-3.9 2.2-6.5 2.2-1.7 0-3-.4-4-.9Z',
      'M11.1 8.5c.8-1.7 1.9-2.7 3.3-3.2M17.2 12.2l3-1.7',
    ],
  },
  lotus: {
    paths: [
      'M12 19.5c-4.4 0-7.8-1.2-9.5-3.5 2.8-.6 5.1-.1 7 1.3-1.7-2.2-2.2-4.6-1.5-7.2 2 1.1 3.3 2.9 4 5.4.7-2.5 2-4.3 4-5.4.7 2.6.2 5-1.5 7.2 1.9-1.4 4.2-1.9 7-1.3-1.7 2.3-5.1 3.5-9.5 3.5Z',
      'M12 15.5V6.2M8.5 19.2h7',
    ],
  },
};
const SIDEBAR_STORAGE_KEY = 'flying-lab.sidebar-collapsed';
const SIDEBAR_WIDTHS = {
  expanded: '248px',
  collapsed: '76px',
};

const host = document.querySelector('#project-host');
const sidebar = document.querySelector('#workspace-sidebar');
const sidebarToggle = document.querySelector('#sidebar-toggle');
const sidebarToggleIcon = document.querySelector('[data-role="sidebar-toggle-icon"]');
const directoryList = document.querySelector('#project-directory-list');
const status = document.querySelector('#workspace-status');
const loading = document.querySelector('#workspace-loading');
const error = document.querySelector('#workspace-error');
const errorMessage = document.querySelector('#workspace-error-message');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

let currentDestroy = null;

function projectTitle(project) {
  return typeof project?.title === 'string' && project.title.trim() ? project.title : project.slug;
}

function projectTheme(project) {
  return { ...DEFAULT_THEME, ...(project?.theme ?? {}) };
}

function readSidebarCollapsed() {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function setSidebarCollapsed(collapsed, { persist = true } = {}) {
  const isCollapsed = Boolean(collapsed);
  sidebar.classList.toggle('is-collapsed', isCollapsed);
  sidebar.dataset.collapsed = String(isCollapsed);
  document.documentElement.style.setProperty('--workspace-sidebar-width', isCollapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded);
  sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
  sidebarToggle.setAttribute('aria-label', isCollapsed ? '展开工程目录' : '收起工程目录');
  sidebarToggleIcon.textContent = isCollapsed ? '›' : '‹';

  if (persist) {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
    } catch {
      // Private browsing and blocked storage should not prevent navigation.
    }
  }
}

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
  const theme = projectTheme(project);
  const rootStyle = document.documentElement.style;

  ['surface', 'ink', 'accent'].forEach((key) => {
    if (typeof theme[key] === 'string' && theme[key].trim()) {
      rootStyle.setProperty(`--workspace-${key}`, theme[key]);
    }
  });

  themeColorMeta?.setAttribute('content', theme.surface);
}

function updateCurrentProject(project) {
  directoryList.querySelectorAll('[data-project-option]').forEach((option) => {
    const isCurrent = option.dataset.projectOption === project.slug;
    option.classList.toggle('is-current', isCurrent);
    option.toggleAttribute('aria-current', isCurrent);
    option.setAttribute('aria-label', `${isCurrent ? '当前工程' : '打开工程'}：${option.dataset.projectTitle}`);
  });
}

function setProjectOptionsDisabled(disabled) {
  directoryList.querySelectorAll('[data-project-option]').forEach((option) => {
    option.disabled = disabled;
  });
}

function setLoading(isLoading) {
  loading.hidden = !isLoading;
  setProjectOptionsDisabled(isLoading || projects.length === 0);
  sidebarToggle.disabled = projects.length === 0;

  if (isLoading) {
    setStatus('载入中');
  }
}

function createProjectIcon(project, title) {
  const icon = document.createElement('span');
  const definition = PROJECT_ICONS[project.icon];

  icon.className = 'project-option-icon';
  icon.setAttribute('aria-hidden', 'true');

  if (!definition) {
    icon.classList.add('project-option-initial');
    icon.textContent = title.trim().charAt(0) || '?';
    return icon;
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.7');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  definition.paths.forEach((pathData) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.append(path);
  });
  icon.append(svg);
  return icon;
}

function showError(message) {
  errorMessage.textContent = message;
  error.hidden = false;
  setStatus('载入失败');
}

function hideError() {
  error.hidden = true;
}

async function loadProject(slug, { updateUrl = true } = {}) {
  const project = projects.find((candidate) => candidate.slug === slug) ?? projects[0];
  if (!project) {
    showError('没有找到可用的 p5.js 工程。');
    sidebarToggle.disabled = true;
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
  setStatus(`载入 ${projectTitle(project)}`);

  try {
    const destroy = await project.mount(host);
    currentDestroy = typeof destroy === 'function' ? destroy : () => {};
    document.title = `${projectTitle(project)} | 飞鸟实验室`;
    setStatus('');
  } catch (loadError) {
    host.replaceChildren();
    showError(loadError instanceof Error ? loadError.message : '未知错误');
  } finally {
    setLoading(false);
  }
}

function createProjectOption(project) {
  const title = projectTitle(project);
  const option = document.createElement('button');
  const mark = document.createElement('span');
  const copy = document.createElement('span');
  const titleNode = document.createElement('span');

  option.type = 'button';
  option.className = 'project-option';
  option.dataset.projectOption = project.slug;
  option.dataset.projectTitle = title;
  option.title = title;
  option.setAttribute('aria-label', `打开工程：${title}`);
  option.style.setProperty('--project-accent', projectTheme(project).accent);

  mark.className = 'project-option-mark';
  mark.append(createProjectIcon(project, title));

  copy.className = 'project-option-copy';
  titleNode.className = 'project-option-title';
  titleNode.textContent = title;
  copy.append(titleNode);

  option.append(mark, copy);
  option.addEventListener('click', () => loadProject(project.slug));
  option.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!option.disabled) loadProject(project.slug);
  });
  directoryList.append(option);
}

projects.forEach(createProjectOption);
setSidebarCollapsed(readSidebarCollapsed(), { persist: false });
sidebarToggle.addEventListener('click', () => {
  setSidebarCollapsed(!sidebar.classList.contains('is-collapsed'));
});

window.addEventListener('popstate', () => {
  const slug = new URL(window.location.href).searchParams.get('project');
  loadProject(slug, { updateUrl: false });
});

const requestedProject = new URL(window.location.href).searchParams.get('project');
loadProject(requestedProject);
