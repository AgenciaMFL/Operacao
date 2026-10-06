# Troca automática do encarte (Elementor)

Toda terça o cliente manda as imagens do encarte e alguém entra no Elementor para trocá-las.
Este fluxo faz isso sozinho: **basta colocar as imagens na pasta `encartes/entrada/`**.

```
imagens novas ──► encartes/entrada/ ──► GitHub Action ──► sobe na Biblioteca de Mídia
                                                      └─► troca nos widgets do Elementor
                                                      └─► limpa o cache de CSS do Elementor
```

## Configuração (uma vez por site)

### 1. Instalar o plugin no WordPress
Compacte a pasta `wordpress-plugin/encarte-automatico` em `.zip` e instale em
**Plugins > Adicionar novo > Enviar plugin**. Ative.

### 2. Marcar as imagens do encarte no Elementor
Abra a página no Elementor e, em cada imagem do encarte, vá em
**Avançado > Classes CSS** e coloque:

| Imagem                    | Classe CSS         |
|---------------------------|--------------------|
| 1ª página do encarte      | `encarte-1`        |
| 2ª página do encarte      | `encarte-2`        |
| ... e assim por diante    | `encarte-N`        |

Funciona em:
- **Imagem** e **Caixa de imagem** → troca a imagem (e o link, se ele apontava para a imagem antiga);
- **Galeria de imagens** / **Carrossel de imagens** → troca todas as imagens do widget
  (use um único slot, ex. `encarte-galeria`, e mande quantas imagens quiser);
- **Seção / Container / Coluna** → troca a imagem de fundo.

Atualize a página. Pode ter qualquer nome que comece com `encarte`.

### 3. Criar a senha de aplicativo
No WordPress: **Usuários > Perfil > Senhas de aplicativo** → nome "Encarte automático" → copie a senha.
Use um usuário com permissão de editar a página (Editor ou Administrador).

### 4. Configurar o GitHub
Em **Settings > Secrets and variables > Actions** do repositório:

| Tipo     | Nome              | Valor                                   |
|----------|-------------------|-----------------------------------------|
| Secret   | `WP_URL`          | `https://www.cliente.com.br`            |
| Secret   | `WP_USER`         | usuário do WordPress                    |
| Secret   | `WP_APP_PASSWORD` | senha de aplicativo do passo 3          |
| Variable | `WP_PAGE_IDS`     | ID da página (ex. `123`; várias: `123,456`) |

O ID está na URL do editor: `post.php?post=`**`123`**`&action=elementor`.

## Uso semanal (terça)

1. Renomeie as imagens recebidas na ordem: `1.jpg`, `2.jpg`, `3.jpg`...
   (ou com o nome do slot: `encarte-1.jpg`, `encarte-2.jpg`, `encarte-galeria_01.jpg`...).
2. Envie para `encartes/entrada/` (no GitHub: **Add file > Upload files**, commit na `main`).
3. Pronto. A Action **Trocar encarte** roda, troca as imagens e limpa a pasta.
   O log da Action mostra a URL da página e o que foi trocado (antes → depois).

Regras de associação:
- Se os arquivos têm o nome do slot, vão para esse slot.
- Senão, vão pela ordem alfabética (1, 2, 10 — ordem numérica) para os slots na ordem em que aparecem na página.
- A quantidade de imagens precisa bater com a de slots (o script para com erro e não mexe em nada se não bater).

Para testar sem trocar nada: **Actions > Trocar encarte > Run workflow** marcando "Só simular".

## Rodar no computador (opcional)

```bash
pip install -r scripts/requirements.txt
cp .env.example .env            # preencha
python scripts/trocar_encarte.py --listar-slots          # confere os slots da página
python scripts/trocar_encarte.py ~/Downloads/encarte --dry-run
python scripts/trocar_encarte.py ~/Downloads/encarte
```

## Problemas comuns

- **401 / "Desculpe, você não tem permissão"**: senha de aplicativo errada, ou plugin de segurança
  (Wordfence, iThemes, etc.) bloqueando a REST API / senhas de aplicativo.
- **"Slots não encontrados"**: confira a classe CSS no widget com `--listar-slots`.
- **Imagem antiga continua aparecendo**: limpe o cache do plugin de cache/CDN (WP Rocket,
  LiteSpeed, Cloudflare). O cache do Elementor já é limpo automaticamente.
- Toda troca gera uma **revisão** no WordPress, então dá para desfazer pelo histórico do Elementor.
