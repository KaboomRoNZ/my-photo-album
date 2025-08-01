export function createPageUrl(pageName) {
  // If the page name is 'Dashboard', link to the root. Otherwise, link to /PageName.
  if (pageName === "Dashboard") {
    return "/";
  }
  return `/${pageName}`;
}