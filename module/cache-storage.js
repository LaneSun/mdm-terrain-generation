const get = async (id) => {
    const data = localStorage.getItem(id);
    if (data) {
        try {
            const obj = JSON.parse(data);
            return obj;
        } catch () {
            return null;
        }
    }
    return null;
};

const set = async (id, data) => {
    const raw = JSON.stringify(data);
    try {
        localStorage.setItem(id, raw);
    } catch () {
        localStorage.clear();
        localStorage.setItem(id, raw);
    }
};

const has = async (id) => {
    const data = localStorage.getItem(id);
    if (data) {
        return true;
    }
    return false;
};

export const cache = {get, set, has};