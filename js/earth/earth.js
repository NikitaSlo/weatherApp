import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { handleSearch, setHighlight } from "../api/weatherInfo.js";

document.addEventListener('DOMContentLoaded', () => {
    const earthContainer = document.getElementById("earth-container");
    const svgWidth = 300; 
    const svgHeight = 300; 
    const svg = d3.select("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`) 
        .attr("preserveAspectRatio", "xMidYMid meet");

    const projection = d3.geoOrthographic()
        .scale(148) 
        .translate([svgWidth / 2, svgHeight / 2]) 
        .clipAngle(90);

    const pathGenerator = d3.geoPath().projection(projection);
    let selectedCountry = null;

    async function loadGeoJSON() {
        const response = await fetch('../resources/custom.geo.json');
        const geoJsonData = await response.json();
        createCountryBorders(geoJsonData);
    }

    function createCountryBorders(geoJsonData) {
        svg.selectAll("path")
            .data(geoJsonData.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("data-name", d => d.properties.name) // Set country name in data attribute
            .attr("d", pathGenerator)
            .attr("fill", "lightgray")
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .on("click", function (event, d) {
                const countryName = d.properties.name;
                handleSearch(countryName); // Trigger search for weather info
                highlightCountry(this, countryName); // Highlight on the map
            })
            .on("mouseover", function () {
                if (this !== selectedCountry) {
                    d3.select(this).attr("fill", "orange");
                }
            })
            .on("mouseout", function () {
                if (this !== selectedCountry) {
                    d3.select(this).attr("fill", "lightgray");
                }
            });
    }

    // Function to highlight the selected country
    function highlightCountry(countryPath, countryName) {
        if (selectedCountry) {
            d3.select(selectedCountry).attr("fill", "lightgray"); // Reset previous selection
        }
        selectedCountry = countryPath; // Set the new selected country
        d3.select(countryPath).attr("fill", "orange"); // Highlight the new selection
    }

    // Dragging functionality
    let rotation = [0, 0];
    const updatePaths = () => {
        svg.selectAll("path").attr("d", pathGenerator); 
    };

    svg.call(d3.drag()
        .on("drag", (event) => {
            rotation[0] += event.dx * 0.5;
            rotation[1] -= event.dy * 0.5;
            projection.rotate(rotation); 
            updatePaths(); 
        }));

    loadGeoJSON();

    function animate() {
        requestAnimationFrame(animate);
    }
    animate();
});