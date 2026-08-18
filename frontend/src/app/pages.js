export function mountPageNavigation() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page-target]");
    if (!button) return;
    event.preventDefault();
    showPage(button.dataset.pageTarget);
  });
}

export function showPage(pageId) {
  if (window.AtlasIQPages?.show) {
    window.AtlasIQPages.show(pageId);
    return;
  }
  if (!document.getElementById(pageId)) return;
  document.querySelectorAll(".app-page").forEach((page) => {
    page.classList.toggle("hidden", page.id !== pageId);
  });
  document.querySelectorAll("[data-page-target]").forEach((button) => {
    button.classList.toggle("active", button.dataset.pageTarget === pageId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}
