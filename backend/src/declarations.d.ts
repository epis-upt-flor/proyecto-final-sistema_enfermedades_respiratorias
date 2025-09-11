// Type declarations for packages without @types

declare module 'hpp' {
  import { RequestHandler } from 'express';
  function hpp(): RequestHandler;
  export = hpp;
}

declare module 'xss-clean' {
  import { RequestHandler } from 'express';
  function xss(): RequestHandler;
  export = xss;
}

declare module 'swagger-ui-express' {
  import { RequestHandler } from 'express';
  import { SwaggerDefinition } from 'swagger-jsdoc';
  
  interface SwaggerUiOptions {
    customCss?: string;
    customSiteTitle?: string;
    swaggerOptions?: any;
  }
  
  function serve(content: any): RequestHandler[];
  function setup(swaggerDoc: SwaggerDefinition, options?: SwaggerUiOptions): RequestHandler;
  
  export { serve, setup };
}
