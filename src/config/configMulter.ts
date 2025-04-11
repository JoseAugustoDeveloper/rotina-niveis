import multer from "fastify-multer";
import path from "node:path";

const allowedExtname = ['.pngm', '.webp', '.png', '.jpeg']
const maxSize = 1024 * 1024 * 5

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if(!allowedExtname.includes(path.extname(file.originalname).toLocaleLowerCase())) return cb(Error("O arquivo deve ser do tipo: png, jpeg ou webp"), '')
      cb(null, "uploads/");
  },
  filename: function (requ, file, cb) {
    cb(null, 'produto' + Date.now() + path.extname(file.originalname));
  }
})

const upload = multer ({ storage, limits: {fileSize: maxSize, fieldSize: maxSize}});

export default upload;