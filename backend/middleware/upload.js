const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    let folderName = 'anonymous';
    if (req.user && req.user.email) {
      // Use email as folder name, replacing invalid characters if necessary
      folderName = req.user.email.replace(/[^a-zA-Z0-9@.-]/g, '_');
    }
    const finalDir = path.join(uploadDir, folderName);
    
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    cb(null, finalDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedPDF = /pdf/;
  const allowedImage = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  const pdfFields = ['aadharDoc', 'govtId'];
  const imageFields = ['machinePhoto', 'profilePic', 'tailorPhoto', 'shopPhoto'];

  if (pdfFields.includes(file.fieldname)) {
    if (allowedPDF.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`${file.fieldname} must be a PDF file`), false);
    }
  } else if (imageFields.includes(file.fieldname)) {
    if (allowedImage.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`${file.fieldname} must be an image (jpg, png, webp)`), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;
