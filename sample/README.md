# Sample for ngx-build-elements

```
npm install
npm run build
npm start
```

Details:

`npm run build`: This builds the script `custom-elements.bundle.js` and copies it to `deploy``

`npm start`: This starts a simple weberver on the `deploy` directory. In the deploy direcotry there is a static `ìndex.html` which references the script which provides the custom element and also uses the custom element in its html structure.

Now open `deploy/index.html` in a browser.  
The browser should load `custom-elements.bundle.js`, which regiters the custom element.  
Then the browser should render the custom element, since it is used in the `index.html`.

