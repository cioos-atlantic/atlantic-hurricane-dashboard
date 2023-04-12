for f in $1/*.shp
do
    echo ./$f
    shp2pgsql -s 4326 $f public.`basename $f .shp` > `basename $f .shp`.sql
done
