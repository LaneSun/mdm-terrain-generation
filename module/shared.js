"use strict";

class Eventer {
    constructor() {
        this.binders = new Map();
    }
    trigger(name, ...args) {
        if (this.binders.has(name)) {
            const handles = this.binders.get(name);
            for (const handle of handles) {
                handle.call(this, ...args);
            }
        }
    }
    listen(name, handle) {
        if (this.binders.has(name)) {
            const handles = this.binders.get(name);
            handles.add(handle);
        } else {
            this.binders.set(name, new Set([handle]));
        }
    }
    unlisten(name, handle) {
        if (this.binders.has(name)) {
            const handles = this.binders.get(name);
            handles.delete(handle);
        }
    }
    clear_handles(name) {
        this.binders.delete(name);
    }
}