// 配置 API
const API_KEY = 'sk-lkjfgesfkhbusgzurkxcwzsongvimjflwyexcdlfkgddxayu';
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

// 模拟游戏数据
const generateGameData = () => {
    const titles = ['Space Explorer', 'Dragon Quest', 'Puzzle World', 'Racing Stars'];
    const creators = ['Alex', 'Sarah', 'Mike', 'Emma'];
    
    return {
        title: titles[Math.floor(Math.random() * titles.length)],
        creator: creators[Math.floor(Math.random() * creators.length)],
        likes: Math.floor(Math.random() * 1000),
        references: Math.floor(Math.random() * 500),
        image: `https://picsum.photos/300/200?random=${Math.random()}`
    };
};

// 创建游戏卡片
const createGameCard = (gameData) => {
    return `
        <div class="game-card">
            <div class="game-preview">
                <img src="${gameData.image}" alt="${gameData.title}">
            </div>
            <div class="game-info">
                <h3 class="game-title">${gameData.title}</h3>
                <div class="game-meta">
                    <span class="creator">by ${gameData.creator}</span>
                    <div class="game-stats">
                        <span class="stat"><i class="fas fa-heart"></i> ${gameData.likes}</span>
                        <span class="stat"><i class="fas fa-bookmark"></i> ${gameData.references}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// 加载游戏案例
const loadGames = (count = 30) => {
    const gamesGrid = document.querySelector('.games-grid');
    for (let i = 0; i < count; i++) {
        const gameData = generateGameData();
        gamesGrid.innerHTML += createGameCard(gameData);
    }
};

// 提示词增强功能
const enhancePrompt = async (prompt) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-ai/DeepSeek-R1',
                messages: [
                    {
                        role: 'system',
                        content: '你是一个游戏开发专家，帮助用户优化他们的游戏创意描述。'
                    },
                    {
                        role: 'user',
                        content: `请帮我优化以下游戏创意描述，使其更加具体和结构化：${prompt}`
                    }
                ]
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error enhancing prompt:', error);
        return prompt;
    }
};

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 初始加载游戏
    loadGames();

    // 加载更多按钮
    const loadMoreBtn = document.getElementById('load-more-btn');
    loadMoreBtn.addEventListener('click', () => loadGames(6));

    // 图片上传
    const imageUpload = document.getElementById('image-upload');
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // 处理图片上传
            console.log('Image selected:', file.name);
        }
    });

    // 提示词增强
    const enhanceBtn = document.querySelector('.enhance-btn');
    const gameInput = document.querySelector('.game-input');

    enhanceBtn.addEventListener('click', async () => {
        const prompt = gameInput.value;
        if (prompt.trim()) {
            const enhancedPrompt = await enhancePrompt(prompt);
            gameInput.value = enhancedPrompt;
        }
    });

    // 创建游戏按钮
    const createBtn = document.querySelector('.create-btn');
    createBtn.addEventListener('click', () => {
        const prompt = gameInput.value;
        if (prompt.trim()) {
            window.location.href = `chat.html?prompt=${encodeURIComponent(prompt)}`;
        }
    });
}); 