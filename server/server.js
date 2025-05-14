const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ytdl = require('ytdl-core');
const cors = require('cors');
const axios = require('axios');
const instagramGetUrl = require('instagram-url-direct');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const upload = multer({ dest: 'uploads/' });

// Create necessary folders
['uploads', 'converted', 'youtube', 'facebook', 'instagram'].forEach(folder => {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
});

// File Upload Conversion
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, '../converted', `${req.file.filename}.mp3`);

    exec(`ffmpeg -i ${inputPath} -q:a 0 -map a ${outputPath}`, (error) => {
        if (error) return res.status(500).json({ error: 'Conversion failed' });

        res.json({ 
            fileUrl: `/download/${req.file.filename}.mp3`
        });

        // Cleanup after 5 minutes
        setTimeout(() => {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        }, 300000);
    });
});

// YouTube Conversion
app.post('/convert-youtube', async (req, res) => {
    try {
        const { url } = req.body;
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const videoId = ytdl.getURLVideoID(url);
        const outputPath = path.join(__dirname, '../youtube', `${videoId}.mp3`);

        const audioStream = ytdl(url, { quality: 'highestaudio' });
        const writeStream = fs.createWriteStream(outputPath);

        audioStream.pipe(writeStream);

        writeStream.on('finish', () => {
            res.json({
                fileUrl: `/download-youtube/${videoId}.mp3`
            });

            setTimeout(() => fs.unlinkSync(outputPath), 300000);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Facebook Conversion (Simplified - requires proper implementation)
app.post('/convert-facebook', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url.includes('facebook.com')) {
            return res.status(400).json({ error: 'Invalid Facebook URL' });
        }

        const videoId = url.split('v=')[1].split('&')[0] || Date.now();
        const outputPath = path.join(__dirname, '../facebook', `${videoId}.mp3`);

        // Simulate conversion for demo purposes
        setTimeout(() => {
            res.json({
                fileUrl: `/download-facebook/${videoId}.mp3`
            });
        }, 2000);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Instagram Conversion
app.post('/convert-instagram', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url.includes('instagram.com')) {
            return res.status(400).json({ error: 'Invalid Instagram URL' });
        }

        const postId = url.split('/p/')[1].split('/')[0] || Date.now();
        const tempVideoPath = path.join(__dirname, '../instagram', `${postId}.mp4`);
        const outputPath = path.join(__dirname, '../instagram', `${postId}.mp3`);

        // Using instagram-url-direct package to get video URL
        const links = await instagramGetUrl(url);
        const videoUrl = links.url_list[0];

        const response = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream'
        });

        const writeStream = fs.createWriteStream(tempVideoPath);
        response.data.pipe(writeStream);

        writeStream.on('finish', () => {
            // Convert to MP3
            exec(`ffmpeg -i ${tempVideoPath} -q:a 0 -map a ${outputPath}`, (error) => {
                if (error) throw error;
                
                fs.unlinkSync(tempVideoPath); // Delete original video
                
                res.json({
                    fileUrl: `/download-instagram/${postId}.mp3`
                });

                setTimeout(() => fs.unlinkSync(outputPath), 300000);
            });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download Endpoints
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../converted', req.params.filename);
    res.download(filePath);
});

app.get('/download-youtube/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../youtube', req.params.filename);
    res.download(filePath);
});

app.get('/download-facebook/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../facebook', req.params.filename);
    res.download(filePath);
});

app.get('/download-instagram/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../instagram', req.params.filename);
    res.download(filePath);
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
