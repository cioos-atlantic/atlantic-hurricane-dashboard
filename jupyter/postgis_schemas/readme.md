# PostGIS and GeoServer

## Modify Geoserver docker-compose.yml

By default, the docker compose file will have a flag **FORCE_SSL=TRUE** for the PostgreSQL (db) container.

Unless you create the appropriate certificates this will prevent you from connecting to PostgreSQL/PostGIS without an encrypted connection.

We will be using Apache to reverse proxy the containers to the outside world and PostgreSQL will not have access so we can disable these settings, at least in a development environment.

Setting this value to **FALSE** will allow Geoserver to connect without setting up SSL/TLS certificates.

## Modify Geoserver .env values

The default **.env.template** file will also need modifications

Set SSL to false and HTTP_SCHEME to "http" rather than the default "https"

```
SSL=false
HTTP_SCHEME=http
```

This will prevent geoserver from explicitly setting links to use the https protocol.

## Ports and Containers

The docker-compose will create a group of containers, one will be Geoserver and the other will be PostgreSQL/PostGIS

The port for Geoserver inside the container is the default 8080, outside the container the port is 8600.

For example, accessing Geoserver through your browser once launching the docker-compose: [http://localhost:8600/geoserver/](http://localhost:8600/geoserver/)

The port for PostgreSQL inside the container is the default 5432, outside the container is 32767

Geoserver can recognize the name of the PostgreSQL container inside docker as a host name.  It would use the default 5432 port to connect to the database server.

If you use an application like pgAdmin4 to administer the database server you would need to use the external (32767) port.

These values are customizable in the .env file and/or the docker-compose.yml file.

## Databases and Schemas

A database in PostgreSQL can contain many different things and can each have their own extensions.

Schemas are a way of partitioning tables inside of a database.  By deafult all databases have a schema named public and is the most often used.  If desired, other schemas can be created to group tables.

`SELECT * FROM public.table_name;`

## Extensions

PostGIS is an extension to an existing PostgreSQL database.  Geoserver requires PostGIS enabled in order to read from a PostgreSQL database.

### Option 1: Command Line, psql

Log in to the PostgreSQL docker container with psql and enable the postgis extension on the target database. (default: **postgres**)

```
docker exec -it <container_name> psql -h localhost -p 5432 -d <database_name> -U <username>
```

> You will be prompted for the PostgreSQL account password after entering the above command

### Option 2: GUI, PgAdmin4

Connecting to the PosgreSQL database via [PgAdmin4](https://www.pgadmin.org/) is also possible and can be achieved by two routes.

#### Route 1: Using a locally installed PgAdmin4 client

Using a locally installed client (one that is installed directly to your opererating system) requires you to use the external port specified in the .env file for you Geoserver/PostgreSQL containers (default: **32767**)

If you are running docker locally then the host will be **localhost**, otherwise specify the hostname or IP address of the machine running the docker containers.

#### Route 2: Using the PgAdmin Docker container

If you are using a [docker container](https://hub.docker.com/r/dpage/pgadmin4/) to run PgAdmin then you'll need to connect the container to the virutal network GeoServer and PostgreSQL.

List docker networks using the following command

`docker network ls`

The name of the network for Geoserver and PostgreSQL is determined by the COMPOSE_PROJECT_NAME value in the .env file for Geoserver (default: **cioos-geoserver_default**)

When creating your PgAdmin4 docker container be sure to add the --network argument to your command.

> **NOTE:** PgAdmin4 is capable of managing multiple PostgreSQL database server instances and as a result the PGADMIN_DEFAULT_EMAIL and PGADMIN_DEFAULT_PASSWORD values are for defining your login credentials to the PgAdmin4 client, *NOT* PostgreSQL itself.
>
> Once inside PgAdmin you will need to create a connection to the PosgreSQL database server in order to interact with it.

**Create PgAdmin Docker Container Example:**

```
docker run -p 3650:80 -e 'PGADMIN_DEFAULT_EMAIL=pg_admin_user@example.com' -e 'PGADMIN_DEFAULT_PASSWORD=pg_admin_password' --network=cioos-geoserver_default --name=pgAdmin -d dpage/pgadmin4
```

Because you are attaching the PgAdmin container to the same network as Geoserver and PosgreSQL you can use the name of the PostgreSQL container and default port (5432) to connect to PostgreSQL.

### Create Extension

Once logged in to the appropriate database, enable PostGIS by executing the following statement:

`CREATE EXTENSION postgis;`

This is the only extension that Geoserver requires for connectivity, though many other PostGIS extensions exist if additional functionality is required.
