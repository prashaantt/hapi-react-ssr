# hapi-react-ssr

> Render [React](https://facebook.github.io/react/) isomorphically using [react-router](https://github.com/reactjs/react-router) in [hapi](http://hapijs.com) using a data store of your choice (e.g. [MobX](https://mobxjs.github.io/mobx/)).

[![Dependency Status](https://david-dm.org/prashaantt/hapi-react-ssr.svg)](https://david-dm.org/prashaantt/hapi-react-ssr)
[![devDependency Status](https://david-dm.org/prashaantt/hapi-react-ssr/dev-status.svg?theme=shields.io)](https://david-dm.org/prashaantt/hapi-react-ssr#info=devDependencies)


## Installation

```bash
npm install hapi-react-ssr vision --save
```


## Options

The plugin accepts the following [`options`](https://github.com/prashaantt/hapi-react-ssr/blob/master/src/interfaces.ts):

- `routes`: The routes defined by `react-router` as a manifest.
- `getInitialContext`: A function to initialise your store(s) and eventually pass on to the client as initial state.
- `bootstrapAction`: The static function to call for server-side rendering from all React components that define it.
- `rootElement`: The root React element.
- `template`: The template file `/path/name` to use for rendering the view. Internally uses `reply.view` provided by `vision`. The templating engine to use is up to you. See [vision](https://github.com/hapijs/vision) docs.
- `visionOptions`: The [options](https://github.com/hapijs/vision/blob/master/API.md#reply-interface) to pass on to `vision`.
- `params`: Additional params to pass to the template context object. `componentRenderedToString` and `context` are reserved for internal use (see below).
- `renderToStaticMarkup`: Choose whether to `renderToStaticMarkup` (value `true`) instead of `renderToString` (value `false`, default).
- `contextAsParams`: Choose whether to spread out the context object as various params on the root element (value `true`) or to keep the context inside a single `context` param (value `false`, default).


## Example usage

Define your routes as a [PlainRoute](https://github.com/reactjs/react-router/blob/master/docs/API.md#plainroute):

```js
// routes.js

import App from './components/App';
import Homepage from './components/Homepage';

const routes = [
    {
        path: '/',
        component: App,
        indexRoute: { component: Homepage },
        childRoutes: [...]
    }
];

export default routes;
```


```js
// server.js

import HapiReactSSR from "hapi-react-ssr";
import Vision from "vision";
import { Provider } from "mobx-react"; // or use any other Provider to pass context down to all children

...

const plugins = [
    Vision,
    {
        register: HapiReactSSR,
        options: {
            routes,
            getInitialContext: () => {
                return {
                    state: new AppState(),
                    store: new AppStore()
                }
            },
            bootstrapAction: 'fetchData',
            rootElement: Provider,
            template: './src/server/index',
            params: {
                env: process.env.NODE_ENV
            }
        }
    },
    // other plugins
];

server.register(plugins, (err) => {});
```

## Notes

- This plugin uses `componentRenderedToString` prop to store the server-side rendered root React component, and `context` to store the computed initial state from your data store. Include them appropriately in your template.

```hbs
{{! handlebars example }}

<html>
<body>
    <div id="react-root">{{{ componentRenderedToString }}}</div>
    <script type="application/javascript">
        window.__INITIAL_STATE__ = {{{ context }}};
    </script>
</body>
</html>
```

- This plugin uses a catch-all hapi route to pass all incoming requests to the react-router. You will generally need to override this behaviour with other more specific routes in your app — to serve static files, for example.  

## License

MIT
