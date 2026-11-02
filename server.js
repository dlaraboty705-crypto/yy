const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/render', async (req, res) => {
    const { html } = req.body;
    if (!html) return res.status(400).send('No HTML provided');

    const timestamp = Date.now();
    const projectDir = `/tmp/project_${timestamp}`;
    
    // Создаем временную папку для проекта
    fs.mkdirSync(projectDir, { recursive: true });

    const htmlPath = path.join(projectDir, 'index.html');
    const videoPath = path.join(projectDir, 'output.mp4');

    fs.writeFileSync(htmlPath, html);

    // Запускаем рендеринг внутри папки проекта
    exec(`cd ${projectDir} && hyperframes render -c index.html -o output.mp4 --fps 30`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            // Возвращаем текст ошибки, чтобы было видно в n8n
            return res.status(500).send(`Render failed: ${stderr || stdout || error.message}`);
        }
        
        // Отправляем готовый файл
        res.sendFile(videoPath, () => {
            // Очищаем временную папку после отправки
            try {
                fs.rmSync(projectDir, { recursive: true, force: true });
            } catch (e) {}
        });
    });
});

// ВАЖНО: Railway передает порт через переменную окружения PORT
const port = process.env.PORT || 3000;

// Слушаем на 0.0.0.0, чтобы Railway мог подключиться
app.listen(port, "0.0.0.0", () => {
    console.log(`Hyperframes API running on port ${port}`);
});
