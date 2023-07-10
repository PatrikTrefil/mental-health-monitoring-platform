# we need to encode the provided urls first
FROM node:18 as arg_preprocess

ARG FORMIO_APP_URL
ARG FORMIO_API_URL

RUN node -p "'export FORMIO_APP_URL=' + encodeURIComponent('$FORMIO_APP_URL')" >> /tmp/env
RUN node -p "'export FORMIO_API_URL=' + encodeURIComponent('$FORMIO_API_URL')" >> /tmp/env

FROM nginx:1 as server

COPY --from=arg_preprocess /tmp/env /tmp/env
COPY ./nginx.conf /tmp/nginx.conf.template

# Manually subsitue the variables eventhough the image can do it automatically
# The problem is that we can not set the environment variables from a RUN command
# for the resulting container. We can only set them within the shell that is created
# for the RUN command (that's also why we need to use the &&)
RUN . /tmp/env && envsubst '${FORMIO_APP_URL},${FORMIO_API_URL}' < /tmp/nginx.conf.template > /etc/nginx/nginx.conf
RUN cat /etc/nginx/nginx.conf


