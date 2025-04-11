import multer from "fastify-multer";
import path from "node:path";

const allowedExtname = ['.webp', '.png', '.jpeg', '.jpg']
const maxSize = 1024 * 1024 * 5

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if(!allowedExtname.includes(path.extname(file.originalname).toLocaleLowerCase())) return callback(Error("O arquivo deve ser do tipo: png, jpeg ou webp"), '')
      callback(null, "uploads/");
  },
  filename: function (req, file, callback) {
    callback(null, 'produto' + Date.now() + path.extname(file.originalname));
  }
})

const upload = multer ({ storage, limits: {fileSize: maxSize, fieldSize: maxSize}});

export default upload;