// API 配置
const API_KEY = 'sk-lkjfgesfkhbusgzurkxcwzsongvimjflwyexcdlfkgddxayu';
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

// 获取 URL 参数中的初始 prompt
const urlParams = new URLSearchParams(window.location.search);
const initialPrompt = urlParams.get('prompt');

// 聊天历史
let chatHistory = [];

// 工具函数：创建消息元素
const createMessageElement = (content, isUser = false) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = content;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    return messageDiv;
};

// 创建代码块元素
const createCodeBlock = (code, language = 'javascript') => {
    const codeBlock = document.createElement('div');
    codeBlock.className = 'code-block';
    
    const header = document.createElement('div');
    header.className = 'code-block-header';
    header.innerHTML = `
        <span>${language}</span>
        <div class="code-block-actions">
            <i class="fas fa-code"></i>
        </div>
    `;
    
    const content = document.createElement('div');
    content.className = 'code-block-content';
    content.innerHTML = `<pre><code class="language-${language}">${code}</code></pre>`;
    
    codeBlock.appendChild(header);
    codeBlock.appendChild(content);
    
    // 切换代码块展开/折叠
    header.addEventListener('click', () => {
        codeBlock.classList.toggle('expanded');
        if (codeBlock.classList.contains('expanded')) {
            // 切换到代码预览模式
            document.querySelector('[data-tab="code"]').click();
            // 更新代码预览
            document.querySelector('#codeTab pre code').textContent = code;
            hljs.highlightAll();
        }
    });
    
    return codeBlock;
};

// 流式输出文本
const streamText = async (element, text) => {
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
        element.textContent += words[i] + ' ';
        await new Promise(resolve => setTimeout(resolve, 50));
    }
};

// 发送消息到 API
const sendToAPI = async (messages) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-ai/DeepSeek-R1',
                messages: messages
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('API Error:', error);
        return 'Sorry, there was an error processing your request.';
    }
};

// 处理用户输入
const handleUserInput = async (input) => {
    // 添加用户消息
    const userMessage = createMessageElement(input, true);
    chatMessages.appendChild(userMessage);
    
    // 添加 AI 消息占位
    const aiMessage = createMessageElement('Thinking...');
    chatMessages.appendChild(aiMessage);
    
    // 更新聊天历史
    chatHistory.push({ role: 'user', content: input });
    
    // 发送到 API
    const response = await sendToAPI([
        { role: 'system', content: '你是一个游戏开发专家，帮助用户设计和开发游戏。' },
        ...chatHistory
    ]);
    
    // 解析响应
    const parts = response.split('```');
    let messageContent = '';
    
    // 处理文本和代码块
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            // 文本部分
            messageContent += parts[i];
        } else {
            // 代码块
            const codeBlock = createCodeBlock(parts[i]);
            messageContent += codeBlock.outerHTML;
        }
    }
    
    // 更新 AI 消息
    aiMessage.querySelector('.message-content').innerHTML = messageContent;
    
    // 更新聊天历史
    chatHistory.push({ role: 'assistant', content: response });
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
    // 拖动调整器功能
    const resizer = document.getElementById('dragMe');
    let isResizing = false;
    
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const chatSidebar = document.querySelector('.chat-sidebar');
        const container = document.querySelector('.chat-container');
        const minWidth = 300;
        const maxWidth = container.offsetWidth - 400;
        
        let newWidth = e.clientX - container.offsetLeft;
        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        
        chatSidebar.style.width = `${newWidth}px`;
    });
    
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = '';
    });
    
    // 标签切换功能
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabId = btn.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}Tab`).classList.add('active');
        });
    });
    
    // 发送消息
    const sendMessage = () => {
        const message = userInput.value.trim();
        if (message) {
            handleUserInput(message);
            userInput.value = '';
        }
    };
    
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 处理初始 prompt
    if (initialPrompt) {
        userInput.value = initialPrompt;
        sendMessage();
    }
}); 