# Mídia dos projetos (preview do índice de Trabalhos)

Coloque aqui os arquivos que aparecem no preview que segue o cursor na seção
**Trabalhos**. Depois ligue cada arquivo ao seu projeto editando o `<li>`
correspondente em `index.html` (procure `👉 EDITE` na seção Trabalhos).

## Como ligar no HTML

```html
<!-- Vídeo (ideal p/ motion e 3D) -->
<li class="project"
    data-preview="/img/work/meu-video.mp4"
    data-preview-type="video"
    data-preview-poster="/img/work/meu-video.webp">
  ...
</li>

<!-- Imagem -->
<li class="project"
    data-preview="/img/work/meu-projeto.webp"
    data-preview-type="image">
  ...
</li>
```

> Os caminhos começam em `/img/work/...` (sem `public/`). Tudo que está em
> `public/` é servido a partir da raiz do site.

## Padrão dos arquivos

| Tipo   | Formato            | Largura      | Observações                                  |
| ------ | ------------------ | ------------ | -------------------------------------------- |
| Vídeo  | `.mp4` (H.264) ou `.webm` | ~640–800 px  | Curto, em loop, **sem áudio**, poucos MB     |
| Poster | `.webp`            | ~640–800 px  | Frame estático do vídeo (1º quadro)          |
| Imagem | `.webp` (ou `.jpg`)| ~640–800 px  | Proporção do preview é 4:3 (`object-fit: cover`) |

- O **poster** (`data-preview-poster`) é o que aparece enquanto o vídeo carrega e
  para quem usa `prefers-reduced-motion` (menos movimento). Tenha sempre um.
- Sem `data-preview`, o preview cai num gradiente placeholder — nada quebra.

## Comportamento

- O vídeo só baixa quando o cursor entra no projeto (`preload="none"`) e pausa
  ao sair — leve por design.
- Carregamento e pause/play são tratados em `src/ui/work-preview.ts`.
