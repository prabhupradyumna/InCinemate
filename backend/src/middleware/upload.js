import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const movieUploadDir = path.join(uploadDir, 'movies');
const castUploadDir = path.join(uploadDir, 'cast');
const crewUploadDir = path.join(uploadDir, 'crew');

// Create directories if they don't exist
[uploadDir, movieUploadDir, castUploadDir, crewUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = movieUploadDir; // default
    
    // Determine upload path based on field name
    if (file.fieldname.includes('cast')) {
      uploadPath = castUploadDir;
    } else if (file.fieldname.includes('crew')) {
      uploadPath = crewUploadDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Middleware for different upload scenarios
const uploadMiddleware = {
  // Single movie poster/backdrop
  single: (fieldName) => upload.single(fieldName),
  
  // Multiple movie images
  movieImages: upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'backdrop', maxCount: 1 }
  ]),
  
  // Cast member image
  castImage: upload.single('cast_image'),
  
  // Crew member image
  crewImage: upload.single('crew_image'),
  
  // Multiple cast/crew images
  castCrewImages: upload.fields([
    { name: 'cast_images', maxCount: 20 },
    { name: 'crew_images', maxCount: 20 }
  ])
};

export default uploadMiddleware;