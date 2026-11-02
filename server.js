const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/render', async (req, res) => {
    const { html } = req.body;
    if (!html) return res.status(400).send('No HTML provided');

    const timestamp = Date.now();
    const htmlPath = `/tmp/scene_${timestamp}.html`;
    const videoPath = `/tmp/scene_${timestamp}.mp4`;

    fs.writeFileSync(htmlPath, html);

    // Используем правильные флаги для Hyperframes
    exec(`hyperframes render ${htmlPath} -o ${videoPath} --fps 30 --resolution portrait`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send(`Render failed: ${stderr}`);
        }
        res.sendFile(videoPath, () => {
            fs.unlinkSync(htmlPath);
            fs.unlinkSync(videoPath);
        });
    });
});

app.listen(3000, () => {
    console.log('Hyperframes API running on port 3000');
});
