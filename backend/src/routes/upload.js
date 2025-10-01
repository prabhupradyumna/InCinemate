import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import uploadMiddleware from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Upload single image (poster, backdrop, cast, crew)
router.post('/single', uploadMiddleware.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct the URL path with correct subdirectory
    // Files are stored in movies/cast/crew subdirectories, need to include that in URL
    const relativePath = path.relative(path.join(path.dirname(path.dirname(__dirname)), 'uploads'), req.file.path);
    const fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload multiple movie images (poster + backdrop)
router.post('/movie-images', uploadMiddleware.movieImages, (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const result = {
      success: true,
      files: {}
    };

    // Process uploaded files
    if (req.files.poster && req.files.poster[0]) {
      result.files.poster = `/uploads/movies/${req.files.poster[0].filename}`;
    }
    
    if (req.files.backdrop && req.files.backdrop[0]) {
      result.files.backdrop = `/uploads/movies/${req.files.backdrop[0].filename}`;
    }

    res.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload cast image
router.post('/cast', uploadMiddleware.castImage, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/cast/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload crew image
router.post('/crew', uploadMiddleware.crewImage, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/crew/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Delete uploaded file
router.delete('/:category/:filename', (req, res) => {
  try {
    const { category, filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', category, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;