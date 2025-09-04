document.addEventListener('DOMContentLoaded', () => {
    const agentSelectionScreen = document.getElementById('agent-selection-screen');
    const mapSelectionScreen = document.getElementById('map-selection-screen');
    const lineupDisplayScreen = document.getElementById('lineup-display-screen');
    
    const backToAgentsButton = document.getElementById('back-to-agents-button');
    const backToMapsButton = document.getElementById('back-to-maps-button');
    
    const selectedAgentInfo = document.getElementById('selected-agent-info');
    const selectedAgentImage = document.getElementById('selected-agent-image');
    const selectedAgentName = document.getElementById('selected-agent-name');
    const selectedMapName = document.getElementById('selected-map-name');
    
    const mapGrid = document.getElementById('map-grid');
    const mapImage = document.getElementById('map-image');
    const mapContainer = document.getElementById('map-container');
    const videoPlayer = document.getElementById('lineup-video');

    const attackButton = document.getElementById('attack-button');
    const defenseButton = document.getElementById('defense-button');

    let lineupData = { maps: [], agents: [] };
    let currentAgentName = null;
    let currentMapName = null;

    fetch('data/lineups.yml')
        .then(response => response.text())
        .then(yamlText => {
            const data = jsyaml.load(yamlText);
            lineupData.maps = data.maps;
            lineupData.agents = data.agents;
            displayAgentSelection();
        })
        .catch(error => console.error('Error fetching YAML:', error));

    function displayAgentSelection() {
        agentSelectionScreen.style.display = 'block';
        mapSelectionScreen.style.display = 'none';
        lineupDisplayScreen.style.display = 'none';
        
        currentAgentName = null;
        
        const agentsByRole = lineupData.agents.reduce((acc, item) => {
            if (!acc[item.role]) {
                acc[item.role] = [];
            }
            acc[item.role].push(item);
            return acc;
        }, {});
        
        document.querySelectorAll('.agent-grid').forEach(grid => grid.innerHTML = '');

        for (const role in agentsByRole) {
            const grid = document.getElementById(`${role}-section`).querySelector('.agent-grid');
            if (!grid) continue;

            agentsByRole[role].forEach(agent => {
                const agentCard = document.createElement('div');
                agentCard.classList.add('agent-card');
                agentCard.innerHTML = `<img src="${agent.role}/${agent.agent_name}.png" alt="${agent.agent_name}"><p>${agent.agent_name}</p>`;
                
                agentCard.addEventListener('click', () => {
                    displayMapSelection(agent.agent_name);
                });
                grid.appendChild(agentCard);
            });
        }
    }

    function displayMapSelection(agentName) {
        agentSelectionScreen.style.display = 'none';
        mapSelectionScreen.style.display = 'block';
        lineupDisplayScreen.style.display = 'none';

        currentAgentName = agentName;
        
        const selectedAgentData = lineupData.agents.find(item => item.agent_name === agentName);
        if (selectedAgentData) {
            selectedAgentImage.src = `${selectedAgentData.role}/${selectedAgentData.agent_name}.png`;
        }
        selectedAgentName.textContent = agentName;

        mapGrid.innerHTML = '';
        
        const allMaps = lineupData.maps;

        allMaps.forEach(map => {
            const mapCard = document.createElement('div');
            mapCard.classList.add('map-card');
            mapCard.innerHTML = `<img src="マップ/${map.map_image}" alt="${map.map_name}">`;
            
            mapCard.addEventListener('click', () => {
                displayLineupScreen(agentName, map.map_name);
            });
            mapGrid.appendChild(mapCard);
        });
    }

    function displayLineupScreen(agentName, mapName) {
        agentSelectionScreen.style.display = 'none';
        mapSelectionScreen.style.display = 'none';
        lineupDisplayScreen.style.display = 'block';
        
        currentAgentName = agentName;
        currentMapName = mapName;
        
        selectedMapName.textContent = `${currentAgentName} - ${currentMapName} 定点`;

        const mapInfo = lineupData.maps.find(map => map.map_name === currentMapName);
        if (mapInfo && mapInfo.detail_map_image) {
            mapImage.src = `詳細マップ/${mapInfo.detail_map_image}`;
            mapImage.style.display = 'block';
        } else {
            mapImage.style.display = 'none';
        }

        // 最初の表示は攻め（attack）に設定
        attackButton.classList.add('active');
        defenseButton.classList.remove('active');
        updateLineupDots('attack');

        // サイドボタンのイベントリスナーを設定
        attackButton.onclick = () => {
            attackButton.classList.add('active');
            defenseButton.classList.remove('active');
            updateLineupDots('attack');
        };
        defenseButton.onclick = () => {
            defenseButton.classList.add('active');
            attackButton.classList.remove('active');
            updateLineupDots('defense');
        };
    }

    function updateLineupDots(side) {
        const agentData = lineupData.agents.find(item => item.agent_name === currentAgentName);
        if (!agentData) return;

        mapContainer.querySelectorAll('.lineup-dot').forEach(dot => dot.remove());

        const lineupsForMap = agentData.lineups_by_map[currentMapName];
        
        if (lineupsForMap) {
            lineupsForMap
                .filter(lineup => lineup.side === side)
                .forEach(lineup => {
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
        if (currentAgentName) {
            displayMapSelection(currentAgentName);
        } else {
            displayAgentSelection();
        }
    });
});