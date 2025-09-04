document.addEventListener('DOMContentLoaded', () => {
    const agentSelectionScreen = document.getElementById('agent-selection-screen');
    const lineupDisplayScreen = document.getElementById('lineup-display-screen');
    const backButton = document.getElementById('back-button');
    const currentAgentName = document.getElementById('current-agent-name');
    const mapSelect = document.getElementById('map-select');
    const mapImage = document.getElementById('map-image');
    const mapContainer = document.getElementById('map-container');
    const videoPlayer = document.getElementById('lineup-video');

    let lineupData = [];

    fetch('data/lineups.yml')
        .then(response => response.text())
        .then(yamlText => {
            lineupData = jsyaml.load(yamlText);
            displayAgentSelection();
        })
        .catch(error => console.error('Error fetching YAML:', error));

    function displayAgentSelection() {
        agentSelectionScreen.style.display = 'block';
        lineupDisplayScreen.style.display = 'none';

        const agentsByRole = lineupData.reduce((acc, item) => {
            if (!acc[item.role]) {
                acc[item.role] = [];
            }
            if (!acc[item.role].some(agent => agent.name === item.agent)) {
                acc[item.role].push({
                    name: item.agent,
                    image: `${item.role}/${item.agent}.png`
                });
            }
            return acc;
        }, {});
        
        document.querySelectorAll('.agent-grid').forEach(grid => grid.innerHTML = '');

        for (const role in agentsByRole) {
            const grid = document.getElementById(`${role}-section`).querySelector('.agent-grid');
            if (!grid) continue;

            agentsByRole[role].forEach(agent => {
                const agentCard = document.createElement('div');
                agentCard.classList.add('agent-card');
                agentCard.innerHTML = `<img src="${agent.image}" alt="${agent.name}"><p>${agent.name}</p>`;
                
                agentCard.addEventListener('click', () => {
                    displayLineupScreen(agent.name);
                });
                grid.appendChild(agentCard);
            });
        }
    }

    function displayLineupScreen(agentName) {
        agentSelectionScreen.style.display = 'none';
        lineupDisplayScreen.style.display = 'block';

        currentAgentName.textContent = agentName;
        mapSelect.innerHTML = '<option value="">マップを選択</option>';
        videoPlayer.src = '';
        mapImage.style.display = 'none';
        mapContainer.querySelectorAll('.lineup-dot').forEach(dot => dot.remove());

        const mapsForAgent = [...new Set(lineupData
            .filter(item => item.agent === agentName)
            .map(item => item.map)
        )];
        
        mapsForAgent.forEach(map => {
            const option = document.createElement('option');
            option.value = map;
            option.textContent = map;
            mapSelect.appendChild(option);
        });
    }

    backButton.addEventListener('click', () => {
        displayAgentSelection();
    });

    mapSelect.addEventListener('change', () => {
        const selectedAgent = currentAgentName.textContent;
        const selectedMap = mapSelect.value;
        
        if (!selectedAgent || !selectedMap) return;

        const filteredData = lineupData.find(item => item.agent === selectedAgent && item.map === selectedMap);

        if (filteredData) {
            mapImage.src = filteredData.image;
            mapImage.style.display = 'block';

            mapContainer.querySelectorAll('.lineup-dot').forEach(dot => dot.remove());

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
    });
});