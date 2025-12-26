# Ícones do PWA

Este diretório deve conter os seguintes ícones para o PWA funcionar corretamente:

## Tamanhos necessários:

- icon-72x72.png (72x72 pixels)
- icon-96x96.png (96x96 pixels)
- icon-128x128.png (128x128 pixels)
- icon-144x144.png (144x144 pixels)
- icon-152x152.png (152x152 pixels)
- icon-192x192.png (192x192 pixels) - **Obrigatório**
- icon-384x384.png (384x384 pixels)
- icon-512x512.png (512x512 pixels) - **Obrigatório**

## Como gerar os ícones:

1. Use o arquivo `logo.png` da pasta `public` como base
2. Gere os ícones em todos os tamanhos acima
3. Salve-os neste diretório com os nomes especificados
4. Os ícones devem ser quadrados e preferencialmente com fundo transparente ou sólido

## Ferramentas recomendadas:

- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/imageGenerator)

## Comando rápido (se tiver ImageMagick instalado):

```bash
# A partir do logo.png na pasta public
convert public/logo.png -resize 72x72 public/icons/icon-72x72.png
convert public/logo.png -resize 96x96 public/icons/icon-96x96.png
convert public/logo.png -resize 128x128 public/icons/icon-128x128.png
convert public/logo.png -resize 144x144 public/icons/icon-144x144.png
convert public/logo.png -resize 152x152 public/icons/icon-152x152.png
convert public/logo.png -resize 192x192 public/icons/icon-192x192.png
convert public/logo.png -resize 384x384 public/icons/icon-384x384.png
convert public/logo.png -resize 512x512 public/icons/icon-512x512.png
```

