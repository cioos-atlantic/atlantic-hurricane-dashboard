CREATE TABLE IF NOT EXISTS public."erddap_cache" (
	"storm" VARCHAR(50) NOT NULL, 
    "station" VARCHAR(100) NOT NULL,
    "min_time" TIMESTAMP NOT NULL,
    "max_time" TIMESTAMP NOT NULL,
    "min_lon" DECIMAL(7,4) NOT NULL,
    "max_lon" DECIMAL(7,4) NOT NULL,
    "min_lat" DECIMAL(7,4) NOT NULL,
    "max_lat" DECIMAL(7,4) NOT NULL,
    "station_data" TEXT NOT NULL,
    PRIMARY KEY(station, min_time));