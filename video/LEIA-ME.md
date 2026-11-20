# Vídeo institucional — Nexus Crédito Inteligente

Projeto Remotion (React) independente do site. Tudo roda localmente e sem custo.

## Comandos

Rode dentro da pasta `video/`:

| Comando | O que faz |
|---|---|
| `npm install` | Instala as dependências (só na primeira vez). |
| `npm run studio` | Abre o editor do Remotion para assistir e ajustar em tempo real. |
| `npm run voz` | Gera a narração e recalcula a duração das cenas. Exige internet. |
| `npm run sfx` | Gera os efeitos sonoros (síntese local). |
| `npm run musica` | Gera a trilha (síntese local), no tamanho exato do vídeo. |
| `npm run audio` | Roda os três acima, na ordem certa. |
| `npm run quadros` | Salva um quadro de cada cena em `out/quadros/` para conferência. |
| `npm run render` | Gera o MP4 em `out/` com um nome novo (`v01`, `v02`, ...). Nunca sobrescreve. |

## Estrutura

```
video/
  scripts/
    roteiro.mjs        textos da narração e tempos de cada cena
    make-voice.mjs     narração (voz neural do Microsoft Edge)
    make-sfx.mjs       efeitos sonoros
    make-music.mjs     trilha sonora
    render-stills.mjs  quadros de conferência
    render.mjs         render final + nivelamento de volume
  src/
    theme.ts           cores, site, razão social e aviso legal
    fonts.ts           fontes (as mesmas do site)
    components.tsx     peças reutilizáveis (fundo, logo, celular, textos animados)
    scenes.tsx         as sete cenas e os textos da tela
    Root.tsx           linha do tempo, volumes e efeitos de cada cena
    narration.json     gerado por `npm run voz` — não edite à mão
  public/              logotipo, narração, efeitos e trilha
  out/                 vídeos e quadros renderizados
```

## Como editar

**Texto falado** — edite `texto` em `scripts/roteiro.mjs` e rode `npm run voz` e depois `npm run musica`. As cenas se ajustam sozinhas ao novo tamanho da fala.

**Duração de uma cena** — em `scripts/roteiro.mjs`: `minimo` (duração mínima em segundos), `vozEm` (quando a fala começa) e `respiro` (pausa depois da fala). Rode `npm run voz -- --sem-rede` e `npm run musica`.

**Texto na tela** — em `src/scenes.tsx`, cada cena tem seu bloco identificado (`CENA 01`, `CENA 02`, ...). O número `at={...}` é o frame em que o elemento entra (30 frames = 1 segundo).

**Volumes** — no topo de `src/Root.tsx`: `VOLUME_VOZ`, `VOLUME_TRILHA`, `VOLUME_TRILHA_SOB_VOZ` e `VOLUME_EFEITOS`. O volume de um efeito específico é o terceiro valor de cada item em `cues`.

**Trocar a voz** — `VOZ` em `scripts/roteiro.mjs` (por exemplo `pt-BR-FranciscaNeural` para voz feminina).

**Trocar a trilha** — substitua `public/musica/trilha.wav` por outro arquivo com o mesmo nome. Se fizer isso, não rode `npm run musica`, que geraria a trilha original de novo.

**Cores, site e aviso legal** — `src/theme.ts`.

**Logotipo** — substitua `public/nexus-logo-full.png` (símbolo + nome, quadrado, fundo transparente) e `public/nexus-mark.png` (só o símbolo).

## Roteiro da narração

| Cena | Fala |
|---|---|
| 1. Abertura | Empreender exige decisão, planejamento, e capital na hora certa. |
| 2. Problema | Fornecedor para pagar, estoque para repor, uma oportunidade que não espera. Quando o caixa aperta, a empresa não pode parar. |
| 3. Solução | A Nexus Crédito Inteligente é especializada em crédito empresarial: uma solução pensada para empresas com CNPJ ativo, incluindo MEI. |
| 4. Diferencial | Nosso diferencial está na análise. Ela é interna: avaliamos o faturamento, a atividade e o histórico da sua empresa, sem consulta a Serasa ou SPC nesta modalidade. O crédito é sujeito a aprovação. |
| 5. 100% online | E tudo acontece online. Você simula valores e parcelas, envia os documentos pelo celular e acompanha cada etapa, sem sair da sua empresa. |
| 6. Público | Comércio, serviços, MEI, empresas em expansão: se o seu negócio tem CNPJ ativo, a Nexus foi pensada para você. |
| 7. Encerramento | Nexus Crédito Inteligente. Seu negócio merece avançar. Acesse o site e faça sua simulação. |

## O que depende de internet

- `npm run voz`: o texto do roteiro é enviado aos servidores da Microsoft para virar áudio.
- Render e studio: as fontes Inter, Inter Tight e Fira Mono são baixadas do Google Fonts.
- `npm install`.

Efeitos sonoros e trilha são gerados no próprio computador, sem arquivos de terceiros.
