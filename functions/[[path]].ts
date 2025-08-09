import type { ServerBuild } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

export const onRequest: PagesFunction = async (context) => {
  // Compute the module path to avoid TypeScript static resolution errors during typecheck
  const modulePath = '../build/' + 'server';
  const serverBuild = (await (import(modulePath) as unknown as Promise<ServerBuild>)) as unknown as ServerBuild;

  const handler = createPagesFunctionHandler({
    build: serverBuild,
  });

  return handler(context);
};
