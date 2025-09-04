{"use strict";

const {
    sign_feature,
    sign_element,
    get_model
} = LWUI_core;

/****************************

sign_feature({
    type: "",
    features: [],
    property: {},
    scope: {},
    method: {},
    setter: {},
    style: {}
});

sign_element({
    type: "",
    extend: null,
    features: [],
    property: {},
    struct: null,
    scope: {},
    method: {},
    setter: {},
    style: {}
});

****************************/

sign_element({
    type: "html_element",
    extend: null,
    features: [],
    property: {
        visible: true,
        flex_grow: false,
        flex_shrink: false,
        margin: [0,0,0,0]
    },
    proxy: {},
    struct: null,
    scope: {
        class_list: () => new Set()
    },
    method: {
        set_class: (self, ...styles) => {
            self.set_property(self, {class_list: new Set(styles)});
        },
        remove_class: (self, ...styles) => {
            if (self.class_list) {
                const class_list = self.class_list;
                for (const style of styles) {
                    class_list.delete(style);
                }
                self.set_property(self, {class_list});
            }
        },
        add_class: (self, ...styles) => {
            if (self.class_list) {
                const class_list = self.class_list;
                for (const style of styles) {
                    class_list.add(style);
                }
                self.set_property(self, {class_list});
            }
        },
        get_struct_anchor: (self) => {
            return self.elem;
        },
        get_item_anchor: (self) => {
            return self.elem;
        }
    },
    setter: {
        visible: (self, value) => {
            if (value) {
                self.remove_class(self, "html_element-hide");
            } else {
                self.add_class(self, "html_element-hide");
            }
        },
        class_list: (self, value) => {
            if (value) {
                if (self.elem) {
                    self.elem.classList.forEach(c => self.elem.classList.remove(c));
                    self.elem.classList.add(...value);
                }
            }
        },
        flex_grow: (self, value) => {
            if (value) {
                self.add_class(self, "html_element-flex_grow");
            } else {
                self.remove_class(self, "html_element-flex_grow");
            }
        },
        flex_shrink: (self, value) => {
            if (value) {
                self.remove_class(self, "html_element-flex_noshrink");
            } else {
                self.add_class(self, "html_element-flex_noshrink");
            }
        },
        margin: (self, [top, right, bottom, left]) => {
            if (self.elem) {
                self.elem.style.marginTop = top + "px";
                self.elem.style.marginRight = right + "px";
                self.elem.style.marginBottom = bottom + "px";
                self.elem.style.marginLeft = left + "px";
            }
        }
    },
    style: {
        hide: `
            display: none !important;
        `,
        flex_grow: `
            flex-grow: 1;
        `,
        flex_noshrink: `
            flex-shrink: 0;
        `
    }
});

sign_element({
    type: "div",
    extend: "html_element",
    features: [],
    property: {},
    proxy: {},
    struct: null,
    scope: {
        elem: () => document.createElement("div")
    },
    method: {},
    setter: {},
    style: {}
});

sign_element({
    type: "lui_element",
    extend: null,
    features: [],
    property: {},
    proxy: {
        root: [
            ["flex_grow", "flex_grow", false],
            ["flex_shrink", "flex_shrink", false],
            ["margin", "margin", [0,0,0,0]],
            ["visible", "visible", true]
        ]
    },
    struct: {
        id: ["root"],
        type: "div"
    },
    scope: {},
    method: {
        get_struct_anchor: (self) => {
            const elem = self.id(self, "root");
            return elem.get_struct_anchor(elem);
        },
        get_item_anchor: (self) => {
            const anchor = self.id(self, "item_anchor");
            return anchor.get_item_anchor(anchor);
        },
        get_named_item_anchor: (self, name) => {
            const anchor = self.id(self, name + "_anchor");
            return anchor.get_item_anchor(anchor);
        }
    },
    setter: {
        item: (self, index, elem) => {
            if (elem) {
                const anchor = self.get_item_anchor(self);
                anchor.insertBefore(elem.get_struct_anchor(elem), anchor.children[index]);
            }
        },
        named_item: (self, name, elem) => {
            if (elem) {
                const anchor = self.get_named_item_anchor(self, name);
                anchor.append(elem.get_struct_anchor(elem));
            }
        }
    },
    style: {}
});

sign_element({
    type: "div_root",
    extend: "div",
    features: [],
    property: {},
    proxy: {},
    struct: null,
    scope: {},
    method: {},
    setter: {
        elem: (self, value) => {
            if (value) {
                self.set_property(self, {
                    visible: self.visible === undefined ? self._model.property.visible : self.visible,
                    flex_grow: self.flex_grow === undefined ? self._model.property.flex_grow : self.flex_grow,
                    flex_shrink: self.flex_shrink === undefined ? self._model.property.flex_shrink : self.flex_shrink,
                    margin: self.margin === undefined ? self._model.property.margin : self.margin,
                    class_list: self.class_list === undefined ? self._model.scope.class_list() : self.class_list
                });
            }
        }
    },
    style: {}
});

sign_element({
    type: "lui_root",
    extend: "lui_element",
    features: [],
    property: {},
    proxy: {},
    struct: {
        id: ["root", "item_anchor"],
        give: {add_class: ["lui_root-main"]},
        type: "div_root"
    },
    scope: {},
    method: {
        set_root_elem: (self, value) => {
            const elem = self.id(self, "root");
            elem.set_property(elem, {elem: value});
        }
    },
    setter: {},
    style: {
        main: `
            padding: 0;
            overflow: hidden;
            width: 100%;
            height: 100%;
            background: #eeeeee;
            font-size: 14px;
            font-family: system-ui;
            user-select: none;
        `
    }
});

sign_element({
    type: "lui_full_window",
    extend: "lui_element",
    features: [],
    property: {},
    proxy: {},
    struct: {
        id: ["root", "item_anchor", "body_anchor"],
        give: {add_class: ["lui_full_window-main"]},
        type: "div"
    },
    scope: {},
    method: {},
    setter: {},
    style: {
        main: `
            display: flex;
            background: #ffffff;
            width: 100%;
            height: 100%;
            padding: 0;
            overflow: hidden;
        `
    }
});

sign_element({
    type: "lui_list_box",
    extend: "lui_element",
    features: [],
    property: {
        direction: "x",
        align: "start"
    },
    proxy: {},
    struct: {
        id: ["root", "item_anchor"],
        give: {add_class: ["lui_list_box-main"]},
        type: "div"
    },
    scope: {},
    method: {},
    setter: {
        direction: (self, value) => {
            const elem = self.id(self, "item_anchor");
            switch (value) {
                case "x":
                    elem.remove_class(elem, "lui_list_box-dir_y");
                    elem.add_class(elem, "lui_list_box-dir_x");
                    break;
                case "y":
                    elem.remove_class(elem, "lui_list_box-dir_x");
                    elem.add_class(elem, "lui_list_box-dir_y");
                    break;
                default:
                    elem.remove_class(elem, "lui_list_box-dir_x", "lui_list_box-dir_y");
                    break;
            }
        },
        align: (self, value) => {
            const elem = self.id(self, "item_anchor");
            switch (value) {
                case "center":
                    elem.remove_class(elem, "lui_list_box-ali_start", "lui_list_box-ali_end");
                    elem.add_class(elem, "lui_list_box-ali_center");
                    break;
                case "start":
                    elem.remove_class(elem, "lui_list_box-ali_end", "lui_list_box-ali_center");
                    elem.add_class(elem, "lui_list_box-ali_start");
                    break;
                case "end":
                    elem.remove_class(elem, "lui_list_box-ali_start", "lui_list_box-ali_center");
                    elem.add_class(elem, "lui_list_box-ali_end");
                    break;
                default:
                    elem.remove_class(elem,
                        "lui_list_box-ali_start",
                        "lui_list_box-ali_center",
                        "lui_list_box-ali_end"
                    );
                    break;
            }
        }
    },
    style: {
        main: `
            display: flex;
            padding: 0;
        `,
        dir_y: `
            flex-flow: column;
        `,
        dir_x: `
            flex-flow: row;
        `,
        ali_start: `
            justify-content: start;
        `,
        ali_center: `
            justify-content: center;
        `,
        ali_end: `
            justify-content: end;
        `
    }
});

sign_element({
    type: "lui_button",
    extend: "lui_element",
    features: [],
    property: {},
    proxy: {
        root: [
            ["flex_grow", "flex_grow", false],
            ["flex_shrink", "flex_shrink", false],
            ["margin", "margin", [2,2,2,2]],
            ["visible", "visible", true]
        ]
    },
    struct: {
        id: ["root", "item_anchor"],
        give: {add_class: ["lui_button-main"]},
        type: "div"
    },
    scope: {},
    method: {},
    setter: {},
    style: {
        main: `
            border-top: #888888 1px solid;
            border-left: #888888 2px solid;
            padding: 2px 4px;
            color: #666666;
        `,
        "main:hover": `
            border-top: #000000 1px solid;
            border-left: #000000 2px solid;
            color: #000000;
        `
    }
});

sign_element({
    type: "lui_text",
    extend: "lui_element",
    features: [],
    property: {
        text: ""
    },
    proxy: {},
    struct: {
        id: ["root", "item_anchor"],
        give: {add_class: ["lui_text-main"]},
        type: "div"
    },
    scope: {},
    method: {},
    setter: {
        text: (self, text) => {
            const anchor = self.id(self, "item_anchor");
            anchor.get_item_anchor(anchor).innerText = text;
        },
        id_item: (self, id, elem) => {
            switch (id) {
                case "item_anchor":
                    elem.get_item_anchor(elem).innerText = self.text;
                    break;
                default: break;
            }
        }
    },
    style: {}
});

sign_element({
    type: "text_div",
    extend: "html_element",
    features: [],
    property: {
        allow_select: true,
        allow_edit: true
    },
    proxy: {},
    struct: null,
    scope: {
        elem: () => document.createElement("div")
    },
    method: {},
    setter: {
        allow_select: (self, bool) => {
            if (bool) {
                self.elem.style.userSelect = "text";
            } else {
                self.elem.style.userSelect = "none";
            }
        },
        allow_edit: (self, bool) => {
            if (bool) {
                self.elem.contentEditable = true;
            } else {
                self.elem.contentEditable = false;
            }
        }
    },
    style: {}
});

sign_element({
    type: "lui_text_view",
    extend: "lui_element",
    features: [],
    property: {
        text: ""
    },
    proxy: {},
    struct: {
        id: ["root", "item_anchor"],
        give: {add_class: ["lui_text_view-main"]},
        type: "text_div"
    },
    scope: {},
    method: {},
    setter: {
        text: (self, text = "") => {
            const anchor = self.id(self, "item_anchor");
            anchor.get_item_anchor(anchor).innerText = text;
        },
        id_item: (self, id, elem) => {
            switch (id) {
                case "item_anchor":
                    elem.get_item_anchor(elem).innerText = self.text;
                    break;
                default: break;
            }
        }
    },
    style: {
        main: `
            outline: none;
        `
    }
});

sign_element({
    type: "lui_frame",
    extend: "lui_element",
    features: [],
    property: {},
    proxy: {
        root: [
            ["flex_grow", "flex_grow", false],
            ["flex_shrink", "flex_shrink", false],
            ["margin", "margin", [2,2,2,2]],
            ["visible", "visible", true]
        ]
    },
    struct: {
        id: ["root", "item_anchor"],
        give: {add_class: ["lui_frame-main"]},
        type: "div"
    },
    scope: {},
    method: {},
    setter: {},
    style: {
        main: `
            display: flex;
            border-top: #dddddd 1px solid;
            border-left: #888888 2px solid;
            padding: 2px;
            color: #666666;
        `
    }
});

}
