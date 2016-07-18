import * as Boom from "boom";
import * as Hapi from "hapi";
import * as History from "history";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import * as ReactRouter from "react-router";
import { assign } from "lodash";
import { Promise } from "es6-promise";

import { HapiPlugin, Options } from "./interfaces";

class HapiReactSSR {
    options: Options;

    constructor(server: Hapi.Server, options: Options, next: Function) {

        this.options = options;

        server.route({
            path: "/{path*}",
            method: "GET",
            handler: this.handler
        });

        next();
    }

    handler = (request: Hapi.Request, reply: Hapi.IReply) => {

        const {
            routes,
            bootstrapAction,
            template,
            visionOptions,
            params,
            rootElement,
            getInitialContext,
            renderToStaticMarkup,
            contextAsParams
        } = this.options;

        ReactRouter.match({ routes, location: request.url }, (error: Error, redirectLocation: History.Location, renderProps: any) => {

            if (error) {
                return reply(Boom.badImplementation(error.message));
            }
            else if (redirectLocation) {
                return reply.redirect(redirectLocation.pathname + redirectLocation.search);
            }
            else if (!renderProps) {
                return reply(Boom.notFound("Invalid route", { route: request.url.pathname }));
            }

            const context = getInitialContext();

            Promise.all(
                renderProps.components.filter((component: any) => component[bootstrapAction])
                    .map((component: any) => component[bootstrapAction](context, renderProps))
            ).then(response => {

                const reactRootElement = React.createElement(
                    rootElement,
                    contextAsParams ? context : { context },
                    React.createElement(ReactRouter.RouterContext, renderProps)
                );

                const renderContext = assign(
                    params,
                    { context: JSON.stringify(context) },
                    {
                        componentRenderedToString: renderToStaticMarkup ?
                            ReactDOMServer.renderToStaticMarkup(reactRootElement) : ReactDOMServer.renderToString(reactRootElement)
                    }
                );

                return reply.view(template, renderContext, visionOptions);
            }).catch(err => {

                return reply(Boom.badImplementation(err.message));
            });
        });
    }

    static attributes = {
        pkg: require("../package.json"),
        dependencies: "vision"
    };
}

export const register: HapiPlugin = HapiReactSSR;
