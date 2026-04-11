export function html(strings, ...values) {
  // to be used as a "tagged template literal":
  // html`<h1>Hello, world!</h1>`
  const template = document.createElement("template");
  template.innerHTML = String.raw(strings, ...values);
  return template.content;
}
