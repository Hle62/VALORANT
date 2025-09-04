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

    let lineupData = [];
    let currentAgent = null;
    let currentMap = null;

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
                const agentInfo = {
                    name: item.agent,
                    role: item.role,
                    image: `${item.role}/${item.agent}.png`
                };
                acc[item.role].push(agentInfo);
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
        
        const selectedAgentData = lineupData.find(item => item.agent === agentName);
        if (selectedAgentData) {
            selectedAgentImage.src = `${selectedAgentData.role}/${selectedAgentData.agent}.png`;
        }
        selectedAgentName.textContent = agentName;

        mapGrid.innerHTML = '';

        const allMaps = lineupData.flatMap(item => item.maps);
        const uniqueMaps = new Map(allMaps.map(map => [map.map_name, map.map_image]));

        uniqueMaps.forEach((mapImageFile, mapName) => {
            const mapCard = document.createElement('div');
            mapCard.classList.add('map-card');
            mapCard.innerHTML = `<img src="マップ/${mapImageFile}" alt="${mapName}">`;
            
            mapCard.addEventListener('click', () => {
                displayLineupScreen(agentName, mapName);
            });
            mapGrid.appendChild(mapCard);
        });
    }

    function displayLineupScreen(agentName, mapName) {
        agentSelectionScreen.style.display = 'none';
        mapSelectionScreen.style.display = 'none';
        lineupDisplayScreen.style.display = 'block';
        
        selectedMapName.textContent = `${agentName} - ${mapName} 定点`;
        
        currentAgent = agentName;
        currentMap = mapName;
        
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
        const agentData = lineupData.find(item => item.agent === currentAgent);
        if (!agentData) return;

        const mapData = agentData.maps.find(map => map.map_name === currentMap);
        if (!mapData) return;

        if (mapData.detail_map_image) {
            mapImage.src = `詳細マップ/${mapData.detail_map_image}`;
            mapImage.style.display = 'block';
        } else {
            mapImage.style.display = 'none';
        }

        mapContainer.querySelectorAll('.lineup-dot').forEach(dot => dot.remove());

        if (mapData.lineups) {
            mapData.lineups
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
        if (currentAgent) {
            displayMapSelection(currentAgent);
        } else {
            displayAgentSelection();
        }
    });
});