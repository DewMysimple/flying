import './style.css';

const modules = import.meta.glob('../projects/*/project.js', { eager: true });
const projects = Object.values(modules)
  .map((module) => module.manifest ?? module.default)
  .filter((project) => project && typeof project.slug === 'string' && typeof project.mount === 'function')
  .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));

const host = document.querySelector('#project-host');
const select = document.querySelector('#project-select');
const status = document.querySelector('#workspace-status');
const loading = document.querySelector('#workspace-loading');
const error = document.querySelector('#workspace-error');
const errorMessage = document.querySelector('#workspace-error-message');

let currentDestroy = null;
let currentProject = null;

function setUrlProject(slug) {
  const url = new URL(window.location.href);
  url.searchParams.set('project', slug);
  window.history.replaceState({}, '', `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
}

function setLoading(isLoading) {
  loading.hidden = !isLoading;
  select.disabled = isLoading;
}

function showError(message) {
  errorMessage.textContent = message;
  error.hidden = false;
  status.textContent = '载入失败';
}

function hideError() {
  error.hidden = true;
}

async function loadProject(slug, { updateUrl = true } = {}) {
  const project = projects.find((candidate) => candidate.slug === slug) ?? projects[0];
  if (!project) {
    showError('没有找到可用的 p5.js 工程。');
    return;
  }

  if (updateUrl) setUrlProject(project.slug);
  setLoading(true);
  hideError();
  currentDestroy?.();
  currentDestroy = null;
  host.replaceChildren();
  currentProject = project;
  select.value = project.slug;
  status.textContent = `载入 ${project.title}`;

  try {
    const destroy = await project.mount(host);
    currentDestroy = typeof destroy === 'function' ? destroy : () => {};
    document.title = `${project.title} | 飞鸟实验室`;
    status.textContent = project.title;
  } catch (loadError) {
    host.replaceChildren();
    showError(loadError instanceof Error ? loadError.message : '未知错误');
  } finally {
    setLoading(false);
  }
}

projects.forEach((project) => {
  const option = document.createElement('option');
  option.value = project.slug;
  option.textContent = project.title;
  select.append(option);
});

select.addEventListener('change', () => loadProject(select.value));
window.addEventListener('popstate', () => {
  const slug = new URL(window.location.href).searchParams.get('project');
  loadProject(slug, { updateUrl: false });
});

const requestedProject = new URL(window.location.href).searchParams.get('project');
loadProject(requestedProject);
