document.addEventListener('DOMContentLoaded', () => {
    const agentSelect = document.getElementById('agent-select');
    const mapSelect = document.getElementById('map-select');
    const mapImage = document.getElementById('map-image');
    const mapContainer = document.getElementById('map-container');
    const videoPlayer = document.getElementById('lineup-video');

    let lineupData = [];

    // YAMLファイルを読み込む
    fetch('data/lineups.yml')
        .then(response => response.text())
        .then(yamlText => {
            lineupData = jsyaml.load(yamlText);
            populateControls();
        })
        .catch(error => console.error('Error fetching YAML:', error));

    function populateControls() {
        const agents = [...new Set(lineupData.map(item => item.agent))];
        agents.forEach(agent => {
            const option = document.createElement('option');
            option.value = agent;
            option.textContent = agent;
            agentSelect.appendChild(option);
        });

        const maps = [...new Set(lineupData.map(item => item.map))];
        maps.forEach(map => {
            const option = document.createElement('option');
            option.value = map;
            option.textContent = map;
            mapSelect.appendChild(option);
        });
    }

    agentSelect.addEventListener('change', updateMapOptions);
    mapSelect.addEventListener('change', displayMapAndLineups);

    function updateMapOptions() {
        const selectedAgent = agentSelect.value;
        const mapsForAgent = lineupData
            .filter(item => item.agent === selectedAgent)
            .map(item => item.map);

        mapSelect.innerHTML = '<option value="">マップを選択</option>';
        [...new Set(mapsForAgent)].forEach(map => {
            const option = document.createElement('option');
            option.value = map;
            option.textContent = map;
            mapSelect.appendChild(option);
        });
        mapImage.style.display = 'none';
        mapContainer.querySelectorAll('.lineup-dot').forEach(dot => dot.remove());
        videoPlayer.src = '';
    }

    function displayMapAndLineups() {
        const selectedAgent = agentSelect.value;
        const selectedMap = mapSelect.value;
        
        if (!selectedAgent || !selectedMap) return;

        const filteredData = lineupData.find(item => item.agent === selectedAgent && item.map === selectedMap);

        if (filteredData) {
            mapImage.src = filteredData.image;
            mapImage.style.display = 'block';

            // 既存の定点を削除
            mapContainer.querySelectorAll('.lineup-dot').forEach(dot => dot.remove());

            // 新しい定点を追加
            filteredData.lineups.forEach(lineup => {
                const dot = document.createElement('div');
                dot.classList.add('lineup-dot');
                dot.style.left = `${lineup.x}%`;
                dot.style.top = `${lineup.y}%`;
                dot.onclick = () => {
                    videoPlayer.src = lineup.video;
                };
                mapContainer.appendChild(dot);
            });
        }
    }
});