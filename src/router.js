const routes = {};

export const registerRoutes = (routeMap) => {
  Object.assign(routes, routeMap);
};

export const navigate = (route) => {
  window.history.pushState({}, "", route);
  renderCurrentRoute();
};

let currentPage;
const renderCurrentRoute = () => {
  const route = window.location.pathname;
  if (currentPage?.onDisconnected) currentPage.onDisconnected();
  currentPage =
    route in routes
      ? routes[route]()
      : {
          content: document
            .createElement("h1")
            .appendChild(document.createTextNode("404 Not Found")),
        };
  document.getElementById("app").replaceChildren(currentPage.content);
  if (currentPage?.onConnected) currentPage.onConnected();
};

window.onpopstate = renderCurrentRoute;

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    navigate(event.target.getAttribute("href"));
  });
});

export const initRouter = () => renderCurrentRoute();
