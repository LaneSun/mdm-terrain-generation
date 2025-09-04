{"use strict";

const moudle = {};

moudle.root = null;

moudle.init = (elem) => {
    moudle.root = LWUI_core.create_element("lui_root", {
        give: {set_root_elem: [elem]}
    });
};

moudle.create = (obj) => {
    return LWUI_core.create_element("lui_element", {
        struct: obj
    });
};

moudle.create_window = (obj) => {
    const win = moudle.create(obj);
    moudle.root.insert_item(moudle.root, win);
    return win;
};

globalThis.LWUI_utils = moudle;
}
