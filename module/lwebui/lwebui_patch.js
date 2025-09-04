{"use strict";

const {
    sign_listeners
} = LWUI_core;

let style_sheet = null;
const style_name_list = [];
const style_buffer = [];
const style_elem = document.createElement("style");

const init_style_elem = () => {
    document.body.append(style_elem);
    style_sheet = style_elem.sheet;
    for (const rule of style_buffer) {
        style_sheet.insertRule(rule, style_sheet.cssRules.length);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init_style_elem);
} else {
    init_style_elem();
}

const set_class = (name, rule) => {
    const index = style_name_list.indexOf(name);
    const text = `.${name} {${rule}}
`;
    if (index >= 0) {
        if (style_sheet) {
            style_sheet.deleteRule(index);
            style_sheet.insertRule(text, index);
        } else {
            style_buffer[index] = text;
        }
    } else {
        if (style_sheet) {
            style_sheet.insertRule(text, style_name_list.length);
        } else {
            style_buffer.push(text);
        }
        style_name_list.push(name);
    }
};

sign_listeners([
    "sign_element_start",
    "sign_feature_start",
], (model) => {
    const type = model.type;
    for (const key in model.style) {
        const name = type + "-" + key;
        const rule = model.style[key];
        set_class(name, rule);
    }
});

}