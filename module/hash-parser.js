import {slice_until} from "./string-utils";

const parser = (hash) => {
    const path = {
        article: "index",
        chapter: 1,
        sections: []
    };
    if (hash.trim() === "") return path;
    const str_hash = hash.slice(1);
    const [str_article, str_pos] = slice_until(str_hash, ":");
    if (str_pos) {
        const [str_chapter, ...str_sections] = str_pos.split(".");
    }
    path.article = str_article;
    path.chapter = parseInt(str_chapter);
    path.sections = str_sections.map(s => parseInt(s));
    return path;
};

export {parser};