Chirripo Walking Exercise
===========================

A webpage that will take a CSV with GPS coordinates (format is lat,lng) and it will draw them on a map.

- **One marker per each GPS coordinate.** The marker should contain the number of the coordinate.
- **Draw the route from the first marker to the last marker** using the map's route drawing capabilities and following the street.
- **When clicking a marker draw a 100-meters radious**
- **When clicking a second marker display the distance between the two markers.**

## References
- **Map Markers.** 
[Map Icons Collection](http://mapicons.nicolasmollet.com) is a set of more than 700 free icons to use as placemarks for your POI (Point of Interests) locations on your maps.
 
- **Parse the CSV File.** 
To handle the data retrievied from the file I used a library called [jquery-csv](https://code.google.com/p/jquery-csv/). This library parses CSV (Comma Separated Values) to Javascript arrays or dictionaries. It's a different creature, featuring a slim Chomsky - Type III parser implementation. Full (that means 100%) IETF RFC 4180 compliance. Including coverage for a few edge cases that even the spec fails to cover. 

- **Drawing roadmap with more than 8 waypoints.**
If you have used Google Maps API, you know that the Directions API has a limit of 8 waypoints. In this exercise we need to draw a route that could have more than 8 GPS points so I needed a way to avoid that limitation. For that I did a litle research and I found [this solution.](http://stackoverflow.com/a/19157951/1310835)