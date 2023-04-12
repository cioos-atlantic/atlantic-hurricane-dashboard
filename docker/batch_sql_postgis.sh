
for f in *.sql
do
    PGPASSWORD=hurricane psql -h localhost -d geoserver -U postgres -w -f $f > /dev/null
done
