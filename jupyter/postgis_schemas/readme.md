# PostGIS and GeoServer

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

The default postgres database will have PostGIS enabled already.

If you create a new database you will need to enable PostGIS by executing the following statement:

`CREATE EXTENSION postgis;`

This is the only extension that Geoserver requires for connectivity, though many other PostGIS extensions exist.
