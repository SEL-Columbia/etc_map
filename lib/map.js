var leaflet = require('leaflet');
var http = require('http');
var csv = require('csv-parser');
var util = require('util');
window.Chart = require('chart.js/Chart');

leaflet.Icon.Default.imagePath = document.URL + '/images';

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

var bind_data = function(data, map) {
    var point = get_lat_lng(data.the_geom);
    var id = data.UNIT_CODE;
    var beds_plan = data.BEDS_PLAN;
    var beds_open = data.BEDS_OPEN;
    var disp_name =data.UNIT_NAME;
    var html = util.format('<canvas id="%s" width="%s" height="%s"></canvas>',
                           id,
                           beds_plan/2,
                           beds_plan/2);
    return leaflet
                .marker(point, {
                    icon: leaflet.divIcon({
                        className: 'open-icon',
                        html: html,
                        iconSize: [40, 40]
                    })
                })
                .addTo(map)
                .bindPopup(util.format('%s (bed open/plan %s / %s)', 
                                       disp_name,
                                       beds_open,
                                       beds_plan));
};

var get_lat_lng = function(the_geom) {
//POINT (-9.46558200499993 8.51824)
    var regex = /^POINT\s\(([0-9\.\-]*)\s([0-9\.\-]*)\)$/;
    var res = the_geom.match(regex);
    return leaflet.latLng(res[2], res[1]);
};

var pie_chart = function(data) {
    var ctx = document.getElementById(data.UNIT_CODE).getContext("2d");
    var not_open = data.BEDS_PLAN - data.BEDS_OPEN;
    var pie_data = [{
        value: parseInt(data.BEDS_OPEN),
        color: "#46BFBD",
        highlight: "#5AD3D1",
        label: "beds open"
    },
    {
        value: not_open,
        color:"#F7464A",
        highlight: "#FF5A5E",
        label: "not yet open"
    }];
    var pie = new Chart(ctx).Pie(pie_data);
    //pie.resize(parseInt(data.BEDS_PLAN));
    return pie;
};

var get_data = function(loc, map) {
    http.get(loc, function(res) {
        res
            .pipe(csv())
            .on('data', function(data) {
                bind_data(data, map);
                pie_chart(data);
            });
    });
};
    
var file = document.URL + '/data/gin_heal_etu_pt_govt_etulocation.csv';
get_data(file, map);

module.exports = map;
