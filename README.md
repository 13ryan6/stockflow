This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Módulo SRI

Este proyecto incluye un módulo servidor para facturación electrónica del SRI de Ecuador. El flujo se controla por variables de entorno y puede desactivarse con `SRI_MODULE_ENABLED=false`.

Variables requeridas o recomendadas:

- `ENVIRONMENT=DEV` o `ENVIRONMENT=PROD`
- `SRI_MODULE_ENABLED=true|false`
- `SRI_DEV_RECEPCION`
- `SRI_DEV_AUTORIZACION`
- `SRI_PROD_RECEPCION`
- `SRI_PROD_AUTORIZACION`
- `SRI_CERTIFICATE_P12_PATH`
- `SRI_CERTIFICATE_PASSWORD`

La implementación vive en `src/modules/sri` y la route opcional para consumirla desde la app está en `src/app/api/sri/invoices/route.ts`.
