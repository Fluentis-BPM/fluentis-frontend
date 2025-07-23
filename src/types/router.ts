import type { IndexRouteObject, NonIndexRouteObject } from 'react-router-dom';

export type AppRouteObject = (IndexRouteObject | NonIndexRouteObject) & {
  children?: AppRouteObject[];
};