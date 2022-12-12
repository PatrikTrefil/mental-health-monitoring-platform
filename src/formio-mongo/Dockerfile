FROM mongo:4.1

ARG MONGO_INITDB_ROOT_USERNAME
ARG MONGO_INITDB_ROOT_PASSWORD
ARG FORMIO_MONGO_USER
ARG FORMIO_MONGO_PASSWORD

# create a initializer script to create user for formio based on args
# creating the file with echo, because the script is generated based on args of the build
RUN echo "mongo admin \
    --host localhost \
    -u '${MONGO_INITDB_ROOT_USERNAME}' \
    -p '${MONGO_INITDB_ROOT_PASSWORD}' \
    --eval \"db.createUser({user: '${FORMIO_MONGO_USER}', pwd: '${FORMIO_MONGO_PASSWORD}', roles: ['readWriteAnyDatabase', 'dbAdminAnyDatabase']});\"" > /docker-entrypoint-initdb.d/create_formio_user.sh
