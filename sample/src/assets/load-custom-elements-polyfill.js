if (!window['customElements']) {
    const script = document.createElement('script');
    script.src = 'assets/custom-elements.min.js';
    document.writeln(script.outerHTML);
}