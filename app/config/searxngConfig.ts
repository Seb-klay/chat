'use server'

import { SearxngService, type SearxngServiceConfig } from 'searxng';

export const searxConfig: SearxngServiceConfig = {
  baseURL: 'https://search.inetol.net/',
  defaultSearchParams: {
    format: 'json',
    lang: 'auto',
  },
  defaultRequestHeaders: {
    'Content-Type': 'application/json',
  },
};