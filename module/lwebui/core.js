{"use strict";

const PropertyProxy = class {
    constructor(owner, target, property, default_value) {
        this.owner = owner;
        this.target = target;
        this.property = property;
        this.value = default_value;
    }
    set(value, dir) {//dir: true[next] false[pre] null[next/pre]
        const caller = this.owner;
        const property = this.property;
        if (this.target === null) {
            caller[property] = value;
            this.value = value;
            if (caller._model.setter[property]) caller._model.setter[property](caller, caller[property]);
        } else {
            if (dir !== true) {
                const pre_proxy = caller._self_proxys[property];
                if (pre_proxy) {
                    pre_proxy.set(value, false);
                }
            }
            if (dir !== false) {
                const item = caller.id(caller, this.target);
                if (item === undefined) {
                    this.value = value;
                } else {
                    const next_proxy = item._item_proxys[property];
                    if (next_proxy) {
                        next_proxy.set(value, true);
                    } else {
                        item[property] = value;
                        this.value = value;
                        if (item._model.setter[property]) item._model.setter[property](item, item[property]);
                    }
                }
            }
        }
    }
    reset() {
        this.set(this.value);
    }
};
const constructor_factory = (model) => {
    return function(patch) {
        let mod = model;
        if (patch) {
            mod = {};
            mod.property = patch.property ? Object.assign({}, model.property, patch.property) : model.property;
            mod.struct = patch.struct ? patch.struct : model.struct;
            mod.give = patch.give || {};
            mod.scope = model.scope;
        }
        this._init(this, mod);
    };
};
const parse_node = (outer, parent, obj) => {
    const elem =
    (
        obj.property ||
        obj.struct ||
        obj.give
    ) ?
        moudle.create_element(obj.type, obj)
    :
        moudle.create_element(obj.type, null);
    if (obj.id) {
        for (const id of obj.id) {
            outer.set_id_item(outer, id, elem);
        }
    }
    if (obj.items) {
        for (const item_obj of obj.items) {
            const item = parse_node(outer, elem, item_obj);
            elem.insert_item(elem, item);
        }
    }
    if (obj.named_items) {
        for (const item_name in obj.named_items) {
            const item_obj = obj.named_items[item_name];
            const item = parse_node(outer, elem, item_obj);
            elem.set_named_item(elem, item_name, item);
        }
    }
    return elem;
};
const element_proto = {
    _init: (self, obj) => {
        self._self_proxys = {};
        self._item_proxys = {};
        self._targeted_proxys = {};
        if (obj.struct) parse_node(self, null, obj.struct);
        for (const target in self._model.proxy) {
            const item = self.id(self, target);
            self._targeted_proxys[target] = [];
            for (const [dis_proty, raw_proty, def_value] of self._model.proxy[target]) {
                const proxy = new PropertyProxy(self, target, raw_proty, def_value);
                self._item_proxys[dis_proty] = proxy;
                self._targeted_proxys[target].push(proxy);
                if (item) item._self_proxys[raw_proty] = proxy;
            }
        }
        for (const key in obj.scope) {
            self._self_proxys[key] = new PropertyProxy(self, null, key, obj.scope[key](self))
        }
        for (const key in obj.property) {
            if (self._item_proxys[key]) {
                self._item_proxys[key].value = obj.property[key];
            } else {
                self._self_proxys[key] = new PropertyProxy(self, null, key, obj.property[key]);
            }
        }
        for (const key in obj.scope) {
            self._self_proxys[key].reset();
        }
        for (const key in obj.property) {
            if (self._self_proxys[key]) self._self_proxys[key].reset();
        }
        for (const key in self._item_proxys) {
            self._item_proxys[key].reset();
        }
        if (obj.give) self.do_method(self, obj.give);
    },
    set_property: (self, obj) => {
        for (const key in obj) {
            const proxy = self._self_proxys[key];
            if (proxy) {
                proxy.set(obj[key]);
            } else {
                self._item_proxys[key].set(obj[key]);
            }
        }
    },
    do_method: (self, obj) => {
        for (const key in obj) {
            self[key](self, ...obj[key]);
        }
    },
    id: (self, id) => {
        if (self.id_items) return self.id_items.get(id);
        return undefined;
    },
    set_id_item: (self, id, elem) => {
        if (!self.id_items) {
            self.id_items = new Map();
        }
        if (self.id_items.has(id)) {
            self.remove_id_item(self, id);
        }
        self.id_items.set(id, elem);
        const proxys = self._targeted_proxys[id];
        if (proxys) {
            for (const proxy of proxys) {
                elem._self_proxys[proxy.property] = proxy;
            }
            for (const proxy of proxys) {
                elem._self_proxys[proxy.property].reset();
            }
        }
        elem.set_id_outer(elem, id, self);
        if (self._model.setter.id_item) self._model.setter.id_item(self, id, elem);
    },
    remove_id_item: (self, id) => {
        if (self.id_items && self.id_items.has(id)) {
            if (self._model.setter.id_item) self._model.setter.id_item(self, id, null);
            const elem = self.id_items.get(id);
            elem.remove_id_outer(elem);
            self.id_items.remove(id);
            const proxys = self._targeted_proxys[id];
            if (proxys) {
                for (const proxy of proxys) {
                    if (elem._self_proxys[proxy.property] === proxy) {
                        elem._self_proxys[proxy.property] = null;
                    }
                }
            }
        }
    },
    set_id_outer: (self, id, outer) => {
        self.outer = outer;
        self._id = id;
    },
    remove_id_outer: (self) => {
        self.outer = null;
        self._id = null;
    },
    insert_item: (self, elem, index) => {
        if (!self.items) {
            self.items = [];
        }
        if (index === null || index > self.items.length) {
            index = self.items.length;
        }
        self.items.splice(index, 0, elem);
        elem.set_parent(elem, self);
        if (self._model.setter.item) self._model.setter.item(self, index, elem);
    },
    find_item: (self, elem) => {
        if (self.items) {
            return self.items.indexOf(elem);
        }
        return -1;
    },
    remove_item: (self, elem) => {
        const index = self.find_item(self, elem);
        if (index >= 0) {
            if (self._model.setter.item) self._model.setter.item(self, index, null);
            const elem = self.items[index];
            elem.remove_parent(elem);
            self.items.splice(index, 1);
        }
    },
    set_parent: (self, parent) => {
        self.parent = parent;
        self.named = false;
    },
    remove_parent: (self) => {
        self.parent = null;
        self.named = null;
    },
    set_named_item: (self, name, elem) => {
        if (!self.named_items) {
            self.named_items = new Map();
        }
        if (self.named_items.has(name)) {
            self.remove_named_item(self, name);
        }
        self.named_items.set(name, elem);
        elem.set_named_parent(elem, name, self);
        if (self._model.setter.named_item) self._model.setter.named_item(self, name, elem);
    },
    remove_named_item: (self, name) => {
        if (self.named_items && self.named_items.has(id)) {
            if (self._model.setter.named_item) self._model.setter.named_item(self, name, null);
            const elem = self.named_items.get(id);
            elem.remove_named_parent(elem);
            self.named_items.remove(id);
        }
    },
    set_named_parent: (self, name, parent) => {
        self.parent = parent;
        self.named = true;
        self.name = name;
    },
    remove_named_parent: (self) => {
        self.parent = null;
        self.named = null;
        self.name = null;
    },
};

const moudle = {};

moudle.models = new Map();
moudle.element_classes = new Map();
moudle.events = new Map();

moudle.get_model = (type) => {
    return moudle.models.get(type);
};

moudle.create_element = (type, obj) => {
    moudle.trigger("create_element_start", type, obj);
    const elem_class = moudle.element_classes.get(type);
    const elem = new elem_class(obj);
    moudle.trigger("create_element_end", type, obj, elem);
    return elem;
};

moudle.sign_element = (model) => {
    moudle.trigger("sign_element_start", model);
    const type = model.type;
    if (model.extend) {
        const par_model = moudle.models.get(model.extend);
        model.property = Object.assign({}, par_model.property, model.property);
        model.proxy = Object.assign({}, par_model.proxy, model.proxy);
        model.scope = Object.assign({}, par_model.scope, model.scope);
        model.method = Object.assign({}, par_model.method, model.method);
        model.setter = Object.assign({}, par_model.setter, model.setter);
    }
    for (const i of model.features) {
        const fea_model = moudle.models.get(i);
        model.property = Object.assign({}, fea_model.property, model.property);
        model.proxy = Object.assign({}, fea_model.proxy, model.proxy);
        model.scope = Object.assign({}, fea_model.scope, model.scope);
        model.method = Object.assign({}, fea_model.method, model.method);
        model.setter = Object.assign({}, fea_model.setter, model.setter);
    }
    const klass = constructor_factory(model);
    klass.prototype = Object.assign({}, element_proto, model.method, {_model: model});
    klass.name = type;
    moudle.models.set(type, model);
    moudle.element_classes.set(type, klass);
    moudle.trigger("sign_element_end", model, klass);
};

moudle.sign_feature = (model) => {
    moudle.trigger("sign_feature_start", model);
    const type = model.type;
    for (const i of model.features) {
        const fea_model = moudle.models.get(i);
        model.property = Object.assign({}, fea_model.property, model.property);
        model.scope = Object.assign({}, fea_model.scope, model.scope);
        model.method = Object.assign({}, fea_model.method, model.method);
        model.setter = Object.assign({}, fea_model.setter, model.setter);
    }
    moudle.models.set(type, model);
    moudle.trigger("sign_feature_end", model);
};

moudle.sign_listener = (event, handle) => {
    if (moudle.events.has(event)) {
        moudle.events.get(event).push(handle);
    } else {
        moudle.events.set(event, [handle]);
    }
};

moudle.sign_listeners = (events, handle) => {
    for (const event of events) {
        moudle.sign_listener(event, handle);
    }
};

moudle.trigger = (event, ...args) => {
    if (moudle.events.has(event)) {
        for (const handle of moudle.events.get(event)) {
            handle(...args);
        }
    }
};

globalThis.LWUI_core = moudle;
}
