import * as domUtils from "./domutils.js";

let closeCurrentEdit = null;
let updateArea = null;
let reevaluate = null;
const createElementComplex = (containerNode, containerElem, indexOrKey, isArray, level, isRoot = false, parentArray) => {
  const wrapper = domUtils.create("div", ["container-wr"], null);
  const keyWrapper = domUtils.create("div", [], null);
  keyWrapper.appendChild(domUtils.createWithText("span", isRoot ? "root: " : `${indexOrKey}: `, [], null));
  keyWrapper.appendChild(domUtils.createWithText("span", isArray ? 'array' : 'object', [], {opacity: 0.6}));

  let createKey = '';
  let createValue = '';
  let createType = "string";


  const createWrapper = domUtils.create("div", ["create-row"], null);
  const valueInput = domUtils.input("Value", '', newVal => {
    createValue = newVal;
  });

  const createTypes = domUtils.typeSelect(createType, val => {
    createType = val;
    if(val === "object" || val === "array" || val === "null")
      valueInput.style.display = "none";
    else
      valueInput.style.display = "inline";
  });

  const createButton = domUtils.button("Create", () => {
     const add = val => {
      if(isRoot) {
      if(isArray)
        containerElem.push(val);
      else
        containerElem[createKey] = val;

      } else {
      if(isArray)
        containerElem[indexOrKey].push(val);
      else
        containerElem[indexOrKey][createKey] = val;


      }
    };
    if(createType === "string") {
      add(createValue);
    } else if(createType === "number") {
      add(createValue.includes(".") ? Number.parseFloat(createValue) : Number.parseInt(createValue));
    } else if (createType === "boolean") {
      add(createValue.toLowerCase() === "true");
    } else if (createType === "null") {
      add(null);
    } else if (createType === "array") {
      add([]);
    } else if (createType === "object") {
      add({});
    }
    reevaluate();
  });
  createButton.style.display = "inline";
  createWrapper.appendChild(createTypes);
  if(!isArray) {
    const keyInput = domUtils.input("Key", '', newVal => {
      createKey = newVal;
    });
    createWrapper.appendChild(keyInput);
  }
  createWrapper.appendChild(valueInput);
  createWrapper.appendChild(createButton);
  const deleteBtn = domUtils.button("Delete", () => {
     if(parentArray)
       containerElem.splice(indexOrKey, 1);
     else
      delete containerElem[indexOrKey];
    reevaluate();

  });
  deleteBtn.style.display = "inline";
  createWrapper.appendChild(deleteBtn);
  if(!isRoot) {
  const alterBtn = domUtils.button("Alter Type", () => {
     const add = val => {
       containerElem[indexOrKey] = val;
    };
    if(createType === "string") {
      add(createValue);
    } else if(createType === "number") {
      add(createValue.includes(".") ? Number.parseFloat(createValue) : Number.parseInt(createValue));
    } else if (createType === "boolean") {
      add(createValue.toLowerCase() === "true");
    } else if (createType === "null") {
      add(null);
    } else if (createType === "array") {
      add([]);
    } else if (createType === "object") {
      add({});
    }
    reevaluate();
  });
    alterBtn.style.display = "inline";
    createWrapper.appendChild(alterBtn);
}
  keyWrapper.appendChild(createWrapper);
  const valueWrapper = domUtils.create("div", [isRoot ? "root-wr" : null],  {marginLeft: `${level}rem`});
  wrapper.appendChild(keyWrapper);
  wrapper.appendChild(valueWrapper);
  return {wrapper, keyWrapper, valueWrapper};
};

const createElementSimple = (containerNode, containerElem, indexOrKey, isArray) => {
  let val = containerElem[indexOrKey];
  let type = typeof val;
  let editMode = false;
  const wrapper = domUtils.create("div", ["elem-wrapper"], null);
  const deleteBtn = domUtils.button("Delete", ev => {
    if(isArray)
      containerElem.splice(indexOrKey, 1);
    else
      delete containerElem[indexOrKey];
    reevaluate();
  });


  const restoreDefault = () => {
    wrapper.textContent = `${indexOrKey}: `;
    const valElem = domUtils.createWithText("span", val, ['elem-value', `valtype-${val === null ? 'null' : type}`], null);
    valElem.addEventListener("click", ev => edit(ev));
    wrapper.appendChild(valElem);
    wrapper.appendChild(domUtils.createWithText("span", ` ${type}`, ['elem-type'], {opacity: 0.6}));

    wrapper.appendChild(editBtn);
    wrapper.appendChild(deleteBtn);

  };
  const edit = ev => {
    editMode = !editMode;
    if(!editMode) {
      if(closeCurrentEdit)
      closeCurrentEdit();
      return;
    }
    if(closeCurrentEdit)
      closeCurrentEdit();
    closeCurrentEdit = () => {
      editMode = false;
      restoreDefault();
      updateArea();
   };
    wrapper.innerHTML = '';
    let key = indexOrKey;
    let tempVal = val;
    let tempType = type;
    const editWrapper = domUtils.create("div", ["flex-basic", "pad"], null);
    const valueInput = domUtils.input("Value", tempVal, newValue => {
      tempVal = newValue;
    });
    const typeSelect = domUtils.typeSelect(tempType, newType => {
      tempType = newType;
    });
    const cancelBtn = domUtils.button("Cancel", (ev) => {
      ev.stopPropagation();
      closeCurrentEdit();
      closeCurrentEdit = null;
    });
    const saveBtn = domUtils.button("Save", () => {
      ev.stopPropagation();
      if (key !== indexOrKey && !isArray) {
        if(containerElem[key]) return;
        delete containerElem[indexOrKey];
        indexOrKey = key;
      }
      if (tempType === "string") {
        val = `${tempVal}`;
      } else if (tempType === "number") {
        if(tempVal.includes(".")) {
          val = Number.parseFloat(tempVal);
        } else {
          val = Number.parseInt(tempVal);
        }
      } else if (tempType === "boolean") {
        val = tempVal === "true";
      } else if (tempType === "null") {
        val = null;
      } else if (tempType === "array") {
        val = [];
      } else if (tempType === "object") {
        val = {};
      }
      type = tempType;
      containerElem[indexOrKey] = val;
      closeCurrentEdit();
      closeCurrentEdit = null;
      if(tempType === "object" || tempType === "array")
        reevaluate();
    });

    if(!isArray) {
      const keyInput = domUtils.input("Key", key, newValue => {
        key = newValue;
      });
      editWrapper.appendChild(keyInput);
    } else {
      editWrapper.appendChild(domUtils.createWithText("span", `${key}: `, [], null));
    }
    editWrapper.appendChild(valueInput);
    editWrapper.appendChild(typeSelect);
    editWrapper.appendChild(cancelBtn);
    editWrapper.appendChild(saveBtn);
    wrapper.appendChild(editWrapper);
    valueInput.focus();

  };
  const editBtn = domUtils.button("Edit", ev => {
    edit(ev);
  });
  editBtn.classList.add("edit-btn");
  deleteBtn.classList.add("edit-btn");

  restoreDefault();
  return wrapper;
};

const advance = (node, elem, level, isRoot = false) => {
  const isArray = Array.isArray(elem);
  if (isRoot) {
    node.innerHTML = '';
     const {wrapper, valueWrapper: rootNode } = createElementComplex(node, elem, null, Array.isArray(elem), 0, true);

    node.appendChild(wrapper);
    node = rootNode;
  }
  if(isArray) {
    elem.forEach((entry, index) => {
      if(typeof entry === "object" && entry !== null) {
        const {wrapper, valueWrapper } = createElementComplex(node, elem, index, Array.isArray(entry), level + 1, false, true);
        const result = advance(valueWrapper, entry, level + 1, false);
        node.appendChild(wrapper);
      } else {
        node.appendChild(createElementSimple(node, elem, index, true));

      }
    });
  } else {
    Object.keys(elem).forEach(key => {
      const entry = elem[key];
      if(typeof entry === "object" && entry !== null) {
        const {wrapper, valueWrapper } = createElementComplex(node, elem, key, Array.isArray(entry), level+1, false, false);
        const result = advance(valueWrapper, entry, level + 1, false);
        node.appendChild(wrapper);
      } else {
        node.appendChild(createElementSimple(node, elem, key, false));
      }

    });

  }
};


const createEditor = (onParse) => {
  const editorRoot = domUtils.create("div", [], {padding: "10px 15px"}, false);
  const area = domUtils.create("textarea", [], {width: "100%", height: "25vh"}, false);
  const button = domUtils.button("parse", ev => {
    onParse(area);
  }, false);
  editorRoot.appendChild(area);
  editorRoot.appendChild(button);
  return editorRoot;
}
window.addEventListener("DOMContentLoaded", ev => {
  const root = domUtils.elemById("root");
  const browserRoot = domUtils.create("div", ["browser-root"], null, false);

  root.appendChild(createEditor(area => {
    domUtils.clearNodes();
    const parsed = JSON.parse(area.value);
    updateArea = () => {
      area.value = JSON.stringify(parsed, undefined, 2);
    }
    reevaluate = () => {
      domUtils.clearNodes();
      advance(browserRoot, parsed, 0, true);
      updateArea();
    };
    advance(browserRoot, parsed, 0, true);
  }));
  root.appendChild(browserRoot);
});
