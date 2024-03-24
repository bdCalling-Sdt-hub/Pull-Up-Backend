const fs = require("fs");

async function unlinkImage(imagePath) {
    console.log('imagePath', imagePath);
    try {
        await fs.promises.unlink(imagePath);
        console.log(`File ${imagePath} deleted successfully`);
    } catch (err) {
        console.error(`Error deleting the file ${imagePath}:`, err);
    }
}

module.exports = unlinkImage