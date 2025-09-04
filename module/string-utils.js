const slice_until = (str, c) => {
    const i = str.indexOf(c);
    if (i >= 0) {
        return [
            str.slice(0, i),
            str.slice(i + 1)
        ];
    } else {
        return [
            str,
            ""
        ]
    }
};

export {slice_until};