# Cortes automáticos de lives → YouTube Shorts

Pega uma live do YouTube, encontra os melhores momentos com IA, corta em formato vertical (9:16),
coloca legenda animada e posta no YouTube Shorts.

```
Live → baixar (yt-dlp) → transcrever (Whisper) → escolher cortes (Claude)
     → cortar + reenquadrar no rosto (ffmpeg/OpenCV) → legenda palavra a palavra → postar (YouTube API)
```

## Instalação

Requisitos: Python 3.11+ e `ffmpeg` instalado no sistema.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # e preencha ANTHROPIC_API_KEY
```

## Configurar o YouTube (uma vez)

1. Em <https://console.cloud.google.com>, crie um projeto e ative a **YouTube Data API v3**.
2. Em *APIs e serviços → Tela de consentimento OAuth*, configure como "Externo" e adicione o e-mail
   do canal como usuário de teste.
3. Em *Credenciais → Criar credencial → ID do cliente OAuth → App para computador*, baixe o JSON
   e salve como `secrets/client_secret.json`.
4. Rode `python -m cortes auth` e faça login com a conta do canal. O token fica salvo em `secrets/`.

> **Importante:** enquanto o projeto do Google Cloud não passar pela auditoria da API do YouTube,
> todo vídeo enviado pela API fica **privado** automaticamente. Para postar público, peça a auditoria
> no formulário "YouTube API Services – Audit and Quota Extension". A cota padrão (10.000 unidades/dia)
> limita quantos uploads dá para fazer por dia (historicamente ~1.600 unidades por upload, ou seja, ~6/dia; confira o valor atual na documentação da API).

## Uso

```bash
# Gera os cortes numa pasta para você revisar (não posta)
python -m cortes run "https://www.youtube.com/watch?v=ID_DA_LIVE"

# Revisou? Marque "approved": false no work/<id>/clips.json para os que não quer, e poste:
python -m cortes upload work/ID_DA_LIVE

# Tudo de uma vez: processa e já posta
python -m cortes run "https://www.youtube.com/watch?v=ID_DA_LIVE" --upload

# Modo automático: processa a última live encerrada do canal que ainda não foi processada
python -m cortes watch "https://www.youtube.com/@SeuCanal" --upload
```

Para rodar sozinho, coloque o `watch` no cron (exemplo: a cada hora):

```
0 * * * * cd /caminho/Operacao && .venv/bin/python -m cortes watch "https://www.youtube.com/@SeuCanal" --upload >> work/cron.log 2>&1
```

Na primeira execução, o `watch` processa só a live mais recente e marca as antigas como vistas,
para não postar o histórico inteiro.

### Opções úteis

| Variável (.env) | O que faz |
|---|---|
| `WHISPER_MODEL` | `small` roda bem em CPU; `large-v3` é bem mais preciso, mas precisa de GPU |
| `MAX_CLIPS` | Quantos cortes por live |
| `CHANNEL_CONTEXT` | Descreva nicho e público: melhora muito a escolha dos cortes |
| `REFRAME_MODE` | `face` segue o rosto; `blur` mostra o quadro inteiro com fundo desfocado (bom para tela compartilhada ou várias pessoas) |
| `YOUTUBE_PRIVACY` | Comece com `private` e mude para `public` quando confiar nos cortes |
| `HOURS_BETWEEN_POSTS` | Agenda os Shorts espaçados (por exemplo, `4` = um a cada 4h) |

## Estrutura de uma execução

```
work/<id_da_live>/
  source.mp4        vídeo original
  transcript.json   transcrição com tempo de cada palavra
  clips.json        cortes escolhidos (título, descrição, hashtags, score, approved)
  clips/01.mp4      Shorts prontos (1080x1920, legenda queimada, áudio normalizado)
  clips/uploads.json  o que já foi postado (evita post duplicado)
```

Cada etapa é pulada se o arquivo já existe. Para refazer só a escolha dos cortes, apague
`clips.json` e a pasta `clips/`.

## Direitos

Use apenas em lives do próprio canal ou de clientes que autorizaram por escrito. Repostar conteúdo
de terceiros sem permissão gera strike de direitos autorais.
