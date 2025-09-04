const create_elem = (name, ...classes) => {
    const elem = document.createElement(name);
    elem.classList.add(...classes);
    return elem;
};

const article_parser = (data, chapter = 1) => {
    const elem_root = create_elem("article", "tx-article");
    if (data.tags["title"]) {
        const elem_header = create_elem("header", "tx-header");
        const elem = create_elem("h1", "tx-title");
        elem.textContent = data.tags["title"];
        elem_header.append(elem);
        elem_root.append(elem_header);
    }
    const elem_infobox = create_elem("div", "tx-infobox");
    let need_push = false;
    if (data.tags["date-create"]) {
        const elem = create_elem("div", "tx-date-create");
        elem.textContent = data.tags["date-create"];
        elem_infobox.append(elem);
        need_push = true;
    }
    if (data.tags["date-update"]) {
        const elem = create_elem("div", "tx-date-update");
        elem.textContent = data.tags["date-update"];
        elem_infobox.append(elem);
        need_push = true;
    }
    if (data.tags["tags"] && data.tags["tags"].length) {
        const elem_tagbox = create_elem("div", "tx-tagbox");
        for (const tag of data.tags["tags"]) {
            const elem = create_elem("div", "tx-tag");
            elem_tagbox.append(elem);
        }
        elem_infobox.append(elem_tagbox);
        need_push = true;
    }
    if (data.tags["describe"]) {
        const elem = create_elem("div", "tx-describe");
        elem.textContent = data.tags["describe"];
        elem_infobox.append(elem);
        need_push = true;
    }
    if (need_push) elem_root.append(elem_infobox);
    const data_chapter = data.data[chapter - 1] || data.data[0];
};

const unit_parsers = {
    "link": (vars, data, pos) => {
        const elem = create_elem("span", "tx-link");
        elem.data_target = data.target;
        elem.data_target_type = data.target_type;
        elem.addEventListener("click", unit_handles["link"]);   // @TODO
        elem.append(...inner_parser(vars, data.inner, pos));
        return elem;
    },
    "anchor": (vars, data, pos) => {
        //
    },
    "image": (vars, data, pos) => {
        const elem = new Image();
        elem.src = data.target;
        elem.classList.add("tx-image");
        return elem;
    },
    "b": (vars, data, pos) => {
        const elem = create_elem("b", "tx-b");
        elem.append(...inner_parser(vars, data.inner, pos));
    },
    "i": (vars, data, pos) => {
        const elem = create_elem("i", "tx-i");
        elem.append(...inner_parser(vars, data.inner, pos));
    },
    "u": (vars, data, pos) => {
        const elem = create_elem("u", "tx-u");
        elem.append(...inner_parser(vars, data.inner, pos));
    },
    "code": (vars, data, pos) => {
        //
    },
    "text": (vars, data, pos) => {
        //
    }
};

const inner_parser = (vars, inner, pos) => {
    //
};