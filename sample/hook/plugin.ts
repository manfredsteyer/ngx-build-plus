
export default {
    config(cfg) {
        console.debug('config');
        return cfg;
    },
    pre() {
        console.debug('pre');
    },
    post() {
        console.debug('post');
    }
}