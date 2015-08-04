import Promise from "core-js/es6/promise";

let db = {
    pages: {
        1: {
            title: "Help"
        },
        2: {
            title: "About"
        },
        3: {
            title: "News"
        }
    }
};

export default {
    pages() {
        return {
            GET: ({params: {id}}) => {
                if (!id) {
                    return Promise.reject("Bad request");
                } else if (!db.pages[id]) {
                    return Promise.reject("Not found");
                }
                return Promise.resolve(db.page[id]);
            }
        }

    }
}