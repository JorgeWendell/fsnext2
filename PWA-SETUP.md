# Configuração PWA - FS Eventos

## ✅ Implementação Concluída

O PWA foi configurado com sucesso! Agora o sistema pode ser instalado como um aplicativo.

## 📋 O que foi implementado:

1. **Manifest.json** - Configuração do app instalável
2. **Service Worker** - Cache e funcionalidade offline
3. **Componente de Instalação** - Prompt para instalar o app
4. **Indicador Offline** - Aviso quando estiver sem internet
5. **Meta Tags** - Configuração para iOS e Android

## 🚀 Próximos Passos:

### 1. Gerar os Ícones

Você precisa criar os ícones em diferentes tamanhos. Execute:

```bash
npm run generate-icons
```

Isso mostrará instruções. Ou use uma das ferramentas online:

- **Recomendado**: https://realfavicongenerator.net/
- Alternativa: https://www.pwabuilder.com/imageGenerator

**Tamanhos necessários:**
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512 pixels

Coloque todos os ícones na pasta `public/icons/` com os nomes:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png` ⚠️ **Obrigatório**
- `icon-384x384.png`
- `icon-512x512.png` ⚠️ **Obrigatório**

### 2. Testar o PWA

#### Em Desenvolvimento:
```bash
npm run build
npm run start
```

O PWA está **desabilitado em desenvolvimento** por padrão. Para testar, você precisa fazer build e rodar em produção.

#### Para testar em dev (opcional):
Edite `next.config.ts` e mude:
```typescript
disable: process.env.NODE_ENV === "development", // para false
```

### 3. Verificar Instalação

1. Acesse o site em **HTTPS** (ou localhost)
2. No Chrome/Edge: procure o ícone de instalação na barra de endereço
3. No mobile: o navegador mostrará um prompt de instalação
4. Após instalar, o app abrirá em uma janela própria

## 📱 Funcionalidades Disponíveis:

### ✅ Instalação
- Botão de instalação aparece automaticamente
- Instalação em um clique
- Ícone na tela inicial

### ✅ Funcionalidade Offline
- Páginas visitadas funcionam offline
- Dados em cache disponíveis
- Indicador visual quando offline
- Sincronização automática ao voltar online

### ✅ Performance
- Cache inteligente de recursos
- Carregamento mais rápido
- Menos requisições ao servidor

## 🔧 Configurações Avançadas:

### Personalizar o Manifest

Edite `public/manifest.json` para:
- Mudar nome e descrição
- Ajustar cores do tema
- Adicionar shortcuts
- Configurar orientação

### Ajustar Cache

Edite `next.config.ts` na seção `runtimeCaching` para:
- Mudar estratégia de cache
- Ajustar tempo de expiração
- Configurar quais recursos cachear

## ⚠️ Importante:

1. **HTTPS Obrigatório**: PWA só funciona em HTTPS (exceto localhost)
2. **Ícones Obrigatórios**: Sem os ícones, o PWA não funcionará corretamente
3. **Build Necessário**: Service Worker só é gerado no build de produção

## 🐛 Troubleshooting:

### PWA não aparece para instalação:
- Verifique se está em HTTPS (ou localhost)
- Confirme que os ícones estão na pasta correta
- Verifique o console do navegador para erros
- Certifique-se de ter feito build de produção

### Service Worker não funciona:
- Limpe o cache do navegador
- Verifique se `public/sw.js` foi gerado após o build
- Confira os logs do console

### Ícones não aparecem:
- Verifique se os arquivos estão em `public/icons/`
- Confirme os nomes dos arquivos (case-sensitive)
- Verifique se os tamanhos estão corretos

## 📚 Recursos:

- [Documentação next-pwa](https://github.com/shadowwalker/next-pwa)
- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [PWA Checklist](https://web.dev/pwa-checklist/)

## 🎉 Pronto!

Após gerar os ícones e fazer o build, seu PWA estará funcionando!

