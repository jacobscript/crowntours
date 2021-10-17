/* eslint-disable */
export const displayMap = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1IjoiamFjb2ItZGV2IiwiYSI6ImNrcHQ5azZ2NjBkeXUydXRnbjk4bmJyMmQifQ.CmRA8JKt9buCOASKwUTkjA'
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jacob-dev/ckuo5jub83dnj19mthc6gn4sh',
        scrollZoom: false,
        // center: [-118.12649, 34.104468],
        // zoom: 4,
    })

    const bounds = new mapboxgl.LngLatBounds()

    locations.forEach((loc) => {
        // create marker
        const el = document.createElement('div')
        el.className = 'marker'

        // add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
        })
            .setLngLat(loc.coordinates)
            .addTo(map)

        // add popup
        new mapboxgl.Popup({
            offset: 30,
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map)

        // extend map bounds to include current location
        bounds.extend(loc.coordinates)
    })

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100,
        },
    })
}
