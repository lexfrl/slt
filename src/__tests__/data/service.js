import Promise from "bluebird";

export default {
    page(id) {
        return {
            1: {
                title: "Help"
            },
            2: {
                title: "About"
            },
            3: {
                title: "News"
            }
        }[id];
    },

    pagePromise(id) {
        return Promise.resolve(this.page(id));
    }
}