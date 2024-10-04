SELECT * FROM pg_timezone_names; -- show all available timezones

SET timezone = 'Asia/Manila'; -- set current timezone

-- use this query for setting the user zoneinfo
SELECT name FROM pg_timezone_names;