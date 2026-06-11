import { router } from "./_core/trpc";
import { templeRouter, compassRouter, cloudRouter, webRouter } from "./temple-routers";
import { interactionRouter, beliefRouter } from "./interaction-routers";
import { moralRouter } from "./moral-routers";

export const appRouter = router({
  temple: templeRouter,
  compass: compassRouter,
  cloud: cloudRouter,
  web: webRouter,
  interaction: interactionRouter,
  belief: beliefRouter,
  moral: moralRouter,
});

export type AppRouter = typeof appRouter;
