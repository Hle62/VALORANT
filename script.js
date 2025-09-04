document.addEventListener('DOMContentLoaded', () => {
    const agentSelectionScreen = document.getElementById('agent-selection-screen');
    const mapSelectionScreen = document.getElementById('map-selection-screen');
    const lineupDisplayScreen = document.getElementById('lineup-display-screen');
    
    const backToAgentsButton = document.getElementById('back-to-agents-button');
    const backToMapsButton = document.getElementById('back-to-maps-button');
    
    const selectedAgentName = document.getElementById('selected-agent-name');
    const selectedMapName = document.getElementById('selected-map-name');
    
    const mapGrid = document.getElementById('map-grid');
    const mapImage = document.getElementById('map-image');
    const mapContainer = document.getElementById('map-container');
    const videoPlayer = document.getElementById('lineup-video');

    let lineupData = [];
    let currentAgent = null;

    fetch('data/lineups.yml')
        .then(response => response.text())
        .then(yamlText => {
            lineupData = jsyaml.load(yamlText);
            displayAgentSelection();
        })
        .catch(error => console.error('Error fetching YAML:', error));

    function displayAgentSelection() {
        agentSelectionScreen.style.display = 'block';
        mapSelectionScreen.style.display = 'none';
        lineupDisplayScreen.style.display = 'none';
        
        currentAgent = null;
        
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
                agentCard.innerHTML = `<img src="${agent.image}" alt="${agent.name}"><p>${agent.name}</p>`; // pタグを戻す
                
                agentCard.addEventListener('click', () => {
                    displayMapSelection(agent.name);
                });
                grid.appendChild(agentCard);
            });
        }
    }

    function displayMapSelection(agentName) {
        agentSelectionScreen.style.display = 'none';
        mapSelectionScreen.style.display = 'block';
        lineupDisplayScreen.style.display = 'none';

        currentAgent = agentName;
        selectedAgentName.textContent = agentName;
        mapGrid.innerHTML = '';

        const uniqueMaps = {};
        lineupData.forEach(item => {
            uniqueMaps[item.map_name] = item.map_image;
        });
        
        for (const mapName in uniqueMaps) {
            const mapCard = document.createElement('div');
            mapCard.classList.add('map-card');
            mapCard.innerHTML = `<img src="マップ/${uniqueMaps[mapName]}" alt="${mapName}">`; // pタグは追加しない
            
            mapCard.addEventListener('click', () => {
                displayLineupScreen(agentName, mapName);
            });
            mapGrid.appendChild(mapCard);
        }
    }

    function displayLineupScreen(agentName, mapName) {
        agentSelectionScreen.style.display = 'none';
        mapSelectionScreen.style.display = 'none';
        lineupDisplayScreen.style.display = 'block';
        
        selectedMapName.textContent = `${agentName} - ${mapName} 定点`;
        
        const filteredData = lineupData.find(item => item.agent === agentName && item.map_name === mapName);

        if (filteredData) {
            mapImage.src = `マップ/${filteredData.map_image}`;
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
    }

    backToAgentsButton.addEventListener('click', () => {
        displayAgentSelection();
    });

    backToMapsButton.addEventListener('click', () => {
        if (currentAgent) {
            displayMapSelection(currentAgent);
        } else {
            displayAgentSelection();
        }
    });
});