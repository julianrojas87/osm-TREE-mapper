const csv = require('@fast-csv/parse');

async function map() {
    const osmHeader = [
        'name', 'alternative_names', 'osm_type', 'osm_id',
        'class', 'type', 'lon', 'lat',
        'place_rank', 'importance', 'street',
        'city', 'county', 'state', 'country', 'country_code',
        'display_name', 'west', 'south', 'east', 'north',
        'wikidata', 'wikipedia', 'housenumbers'
    ];

    const dataStream = process.stdin.pipe(csv.parse({ headers: osmHeader, delimiter: '\t', quote: null }));
    let first = true;
    for await (const d of dataStream) {
        if (!first) {
            const osmClass = `osm:${d['class']}`;
            let obj = {
                "@id": `http://www.openstreetmap.org/${d['osm_type']}/${d['osm_id']}`,
                "name": d['name'],
                "@type": `https://w3id.org/openstreetmap/terms#${d['osm_type'].charAt(0).toUpperCase() + d['osm_type'].slice(1)}`,
                [osmClass]: `https://w3id.org/openstreetmap/terms#${d['type'].charAt(0).toUpperCase() + d['type'].slice(1)}`,
                "lat": parseFloat(d['lat']),
                "long": parseFloat(d['lon']),
                "asWKT": `POINT (${d['lon']} ${d['lat']})`,
                "osm:hasTag": getAddr(d)
            };
            if (d['wikidata'] !== '') obj['osm:wikidata'] = `http://www.wikidata.org/entity/${d['wikidata']}`;
            console.log(JSON.stringify(obj));
        }
        first = false;
    }
}

function getAddr(data) {
    let addr = [];
    if (data['housenumbers'] !== '') addr.push(`addr:housenumber=${data['housenumbers']}`);
    if (data['street'] !== '') addr.push(`addr:street=${data['street']}`);
    if (data['city'] !== '') addr.push(`addr:city=${data['city']}`);
    if (data['county'] !== '') addr.push(`addr:county=${data['county']}`);
    if (data['state'] !== '') addr.push(`addr:state=${data['state']}`);
    if (data['country'] !== '') addr.push(`addr:country=${data['country_code'].toUpperCase()}`);
    return addr;
}

map();