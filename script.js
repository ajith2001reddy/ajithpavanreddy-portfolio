const GITHUB_USERNAME = "ajith2001reddy";
const PORTFOLIO_REPOSITORY = "ajithpavanreddy-portfolio";
const MAX_PROJECTS = 6;

const projectsGrid = document.querySelector("#projects-grid");
const projectsStatus = document.querySelector("#projects-status");
const githubSkills = document.querySelector("#github-skills");
const languageTags = document.querySelector("#language-tags");

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(dateString));
}

function addTag(container, label) {
  const tag = document.createElement("span");
  tag.textContent = label;
  container.append(tag);
}

async function loadReadmeSummary(repository) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${encodeURIComponent(repository.name)}/readme`,
    { headers: { Accept: "application/vnd.github+json" } },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub README request returned ${response.status}`);

  const readme = await response.json();
  if (typeof readme.content !== "string" || readme.encoding !== "base64") {
    throw new Error("GitHub returned an unexpected README format");
  }

  const bytes = Uint8Array.from(atob(readme.content.replace(/\s/g, "")), (character) => character.charCodeAt(0));
  const markdown = new TextDecoder().decode(bytes);
  const paragraphs = markdown.split(/\r?\n\s*\r?\n/);
  for (const paragraph of paragraphs) {
    if (/^\s*(?:\[!\[|!\[|<img|```|<!--)/i.test(paragraph)) continue;
    const summary = paragraph
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]*>/g, " ")
      .replace(/^\s{0,3}#{1,6}\s*/gm, "")
      .replace(/[*_`~]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (summary.length >= 60) {
      return summary.length > 220 ? `${summary.slice(0, 217).trimEnd()}…` : summary;
    }
  }
  return null;
}

function renderRepositories(repositories) {
  const selected = repositories
    .filter((repository) => !repository.fork && !repository.archived && repository.name !== PORTFOLIO_REPOSITORY)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, MAX_PROJECTS);

  if (selected.length === 0) {
    projectsStatus.textContent = "No recent public repositories are available to feature yet. Visit GitHub to explore the full profile.";
    projectsStatus.classList.add("error");
    return;
  }

  projectsGrid.replaceChildren();
  selected.forEach((repository, index) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const top = document.createElement("div");
    top.className = "project-top";
    const icon = document.createElement("span");
    icon.className = "project-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = String(index + 1).padStart(2, "0");
    const counts = document.createElement("span");
    counts.className = "project-counts";
    counts.textContent = `★ ${repository.stargazers_count} ⑂ ${repository.forks_count}`;
    top.append(icon, counts);

    const title = document.createElement("h3");
    title.textContent = repository.name.replace(/[-_]/g, " ");
    const description = document.createElement("p");
    description.textContent = repository.description || "Loading project summary…";
    const tags = document.createElement("div");
    tags.className = "tag-list";
    if (repository.language) addTag(tags, repository.language);
    (repository.topics || []).slice(0, 2).forEach((topic) => addTag(tags, topic));

    const footer = document.createElement("div");
    footer.className = "project-footer";
    const updated = document.createElement("span");
    updated.textContent = `UPDATED ${formatDate(repository.pushed_at)}`;
    const link = document.createElement("a");
    link.href = repository.html_url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Open project ↗";
    link.setAttribute("aria-label", `Open ${repository.name} on GitHub`);
    footer.append(updated, link);
    card.append(top, title, description, tags, footer);
    projectsGrid.append(card);

    if (!repository.description) {
      loadReadmeSummary(repository)
        .then((summary) => {
          description.textContent = summary || "No project summary has been added yet. Open the repository on GitHub for details.";
        })
        .catch((error) => {
          console.error(`Unable to load the README for ${repository.name}:`, error);
          description.textContent = "Project summary could not be loaded. Open the repository on GitHub for details.";
        });
    }
  });

  projectsStatus.hidden = true;

  const languages = [...new Set(selected.map((repository) => repository.language).filter(Boolean))].sort();
  if (languages.length > 0) {
    languageTags.replaceChildren();
    languages.forEach((language) => addTag(languageTags, language));
    githubSkills.hidden = false;
  }
}

async function loadRepositories() {
  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }

    const repositories = await response.json();
    if (!Array.isArray(repositories)) {
      throw new Error("GitHub returned an unexpected repository list");
    }
    renderRepositories(repositories);
  } catch (error) {
    console.error("Unable to load GitHub repositories:", error);
    projectsStatus.classList.add("error");
    projectsStatus.textContent = "GitHub projects could not be loaded right now. Please try again later or visit the GitHub profile.";
  }
}

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  navLinks.classList.toggle("is-open", !isOpen);
});

navLinks.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navLinks.classList.remove("is-open");
  }
});

loadRepositories();
