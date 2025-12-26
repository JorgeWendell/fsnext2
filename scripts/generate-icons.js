const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const logoPath = path.join(__dirname, "../public/logo.png");
const iconsDir = path.join(__dirname, "../public/icons");

if (!fs.existsSync(logoPath)) {
  console.error("❌ Arquivo logo.png não encontrado em public/");
  console.log("📝 Por favor, coloque o arquivo logo.png na pasta public/");
  console.log("📝 Ou gere os ícones manualmente usando uma ferramenta online:");
  console.log("   - https://realfavicongenerator.net/");
  console.log("   - https://www.pwabuilder.com/imageGenerator");
  process.exit(1);
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log("✅ Estrutura de diretórios criada!");
console.log("📝 Para gerar os ícones, você pode:");
console.log("");
console.log("1. Usar uma ferramenta online:");
console.log("   - https://realfavicongenerator.net/");
console.log("   - https://www.pwabuilder.com/imageGenerator");
console.log("   - https://github.com/onderceylan/pwa-asset-generator");
console.log("");
console.log("2. Usar ImageMagick (se instalado):");
console.log("   convert public/logo.png -resize 192x192 public/icons/icon-192x192.png");
console.log("   convert public/logo.png -resize 512x512 public/icons/icon-512x512.png");
console.log("");
console.log("3. Usar um editor de imagens para redimensionar o logo.png");
console.log("");
console.log("📋 Tamanhos necessários:");
sizes.forEach((size) => {
  console.log(`   - icon-${size}x${size}.png (${size}x${size}px)`);
});

