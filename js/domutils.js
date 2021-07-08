let trackedNodes = [];
export const create = (type, classes, style, track = true) => {
  const element = window.document.createElement(type);
  if(Array.isArray(classes)) {
    element.classList.add(...classes);
  }
  if(style) {
    Object.keys(style).forEach(k => element.style[k] = style[k]);
  }
  if (track)
    trackedNodes.push(element);
  return element;
};

export const clearNodes = () => {
  for(const node of trackedNodes) {
    node.remove();
  }
  trackedNodes = [];
};

export const createWithText = (type, value, classes, style) => {
  const e = create(type, classes, style);
  e.textContent = value;
  return e;
};
const types = ["boolean", "number", "string", "null", "object", "array"];
export const typeSelect = (value, onChange) => {
  const root = create("select", ["type-select"], null);
  types.forEach(type => {
    const e = createWithText("option", type, [], null);
    e.setAttribute("value", type);
    root.appendChild(e);
  });
  root.value = value;
  root.addEventListener('change', ev => {
    onChange(root.value);
  });
  return root;
};
export const button = (name, click, tracked = true) => {
  const wrapper = create("div", ["btn"], null, tracked);
  const text = create("span", [], null, tracked);
  text.textContent = name;
  wrapper.appendChild(text);
  wrapper.addEventListener("click", ev => click(ev));
  return wrapper;
};
export const input = (placeHolder, value, onChange, type="text") => {
  const field = create("input", [], null);
  if(placeHolder)
    field.setAttribute("placeholder", placeHolder);
  if (value) field.value = value;
  field.setAttribute("type", type);
  field.addEventListener('input', ev=> {
    onChange(field.value);
  });
  return field;
};
export const elemById = id => window.document.getElementById(id);
