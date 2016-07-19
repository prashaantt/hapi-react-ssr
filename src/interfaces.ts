import * as Hapi from "hapi";
import * as React from "react";

export interface PackageAttributes {
    pkg: Object;
}

export interface ExplicitAttributes {
    name: string;
    version: string;
    multiple?: boolean;
    dependencies?: string | Array<string>;
    connections?: boolean;
    once?: boolean;
}

export interface HapiPlugin {
    new (server: Hapi.Server, options: Options, next: Function): any;
    attributes: PackageAttributes | ExplicitAttributes;
};

export interface Options {
    routes: Array<any>;
    getInitialContext(): Object;
    bootstrapAction: string;
    rootElement: React.ComponentClass<{}> | React.StatelessComponent<{}>;
    template: string;
    visionOptions?: any;
    params?: any;
    renderToStaticMarkup?: boolean;
    contextAsProps?: boolean;
}
