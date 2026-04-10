export function html(strings, ...values) {
  const template = document.createElement("template");
  template.innerHTML = String.raw(strings, ...values);
  return template.content;
}
