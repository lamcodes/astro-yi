/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'astro:content' {
    interface Render {
      '.astro': Promise<{
        default: import('astro').AstroComponent;
      }>;
    }
  }
  
  declare module '*.astro' {
    const component: any;
    export default component;
  }