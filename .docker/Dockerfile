FROM imbios/bun-node:1.2.10-22.14.0-alpine

RUN apk add --no-cache --update ffmpeg

WORKDIR /usr/src/app

# General
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_BRAND
ARG NEXT_PUBLIC_GIT_COMMIT_HASH

# Analytics (PostHog)
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST

# Auth (Clerk)
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# UploadThing
ARG NEXT_PUBLIC_UPLOADTHING_APP_ID

RUN mkdir -p ./public/_next/
COPY .next/standalone/ .
COPY .next/static/ ./public/_next/static/
COPY ./public/* ./public/

EXPOSE 3000

CMD ["/bin/sh", "-c", "bun run server.js"]
