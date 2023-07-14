##
# BUILDER - This thing bundles the JS
##
FROM node:lts-hydrogen as BUILDER

WORKDIR /usr/src/app
COPY . ./

RUN npm ci
RUN npm run package

##
# RUNNER - This thing runs the code (without dev dependencies)
##
FROM node:lts-hydrogen as RUNNER

WORKDIR /usr/src/app
COPY --from=BUILDER /usr/src/app/package*.json .

RUN npm ci --only=production

COPY --from=BUILDER /usr/src/app/lib .

CMD ["node", "index.js"]