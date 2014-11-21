var leaflet = require('leaflet');
var http = require('http');
var csv = require('csv-parser');
var util = require('util');

leaflet.Icon.Default.imagePath = '/dist/images/';

var map_div = 'map';
var map = new leaflet.Map(map_div);

var osm_server = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
var osm_layer = leaflet.tileLayer(osm_server, {
    attribution: "Open Street Map"
});

osm_layer.addTo(map);
var guinea_bounds = leaflet.latLngBounds(
        leaflet.latLng('6.937332868878455', '-15.743408203124998'),
        leaflet.latLng('12.91890657418042', '-6.954345703125'));
map.fitBounds(guinea_bounds);

var get_data = function(loc, map) {
    http.get(loc, function(res) {
        res
            .pipe(csv())
            .on('data', function(data) {
                var point = get_lat_lng(data.the_geom);
                var beds_plan = data.BEDS_PLAN;
                var beds_open = data.BEDS_OPEN;
                leaflet
                    .marker(point)
                    .addTo(map)
                    .bindPopup(util.format('Beds open/plan %s / %s', 
                                           beds_open,
                                           beds_plan));
            });
    });
};

var get_lat_lng = function(the_geom) {
//POINT (-9.46558200499993 8.51824)
    var regex = /^POINT\s\(([0-9\.\-]*)\s([0-9\.\-]*)\)$/;
    var res = the_geom.match(regex);
    return leaflet.latLng(res[2], res[1]);
};
    
var file = '/data/gin_heal_etu_pt_govt_etulocation.csv';
get_data(file, map);

module.exports = map;
