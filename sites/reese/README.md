# Reese · House of Wellness: site institucional

Site estático (HTML + CSS + JS, sem dependências). Abra `index.html` no navegador ou publique a pasta em qualquer hospedagem estática.

## Páginas
`index.html` (Início) · `sobre.html` · `servicos.html` · `como-funciona.html` · `depoimentos.html` · `contato.html` · `privacidade.html`

## Como editar
O cabeçalho, o rodapé e o menu ficam em `_src/layout.html`, e o conteúdo de cada página fica em `_src/pages/*.html`. Depois de editar, rode:

    python3 sites/reese/_src/build.py

O comando gera de novo os `.html` da raiz. Não edite os `.html` gerados direto, porque a próxima build sobrescreve.

## Tipografia
Os títulos usam **Canela Display**, que é uma fonte licenciada (Commercial Type). Coloque `CanelaDisplay-Light.woff2` e `CanelaDisplay-LightItalic.woff2` em `assets/fonts/` e ela entra sozinha. Até lá, a Fraunces (Google Fonts) ocupa o lugar dela. O texto corrido usa Jost.

## Paleta
Verde musgo `#1d2317` / `#3e4a2f` · preto `#131410` · cinza `#7f7d75` · bege `#efe7d8` / `#cfbe9f` · marrom `#4a3324` / `#b0835e`. Todas as cores estão como variáveis em `assets/css/style.css`.

## Antes de publicar
- **Fotos:** os blocos `.media` com legenda "Foto · …" são espaços reservados. Troque cada um por `<img>` dentro do mesmo elemento.
- **Formulário:** ainda não tem backend. Ao enviar, ele mostra a mensagem de sucesso e abre o WhatsApp com os dados preenchidos (ver `assets/js/main.js`).
- **Itens marcados `[a confirmar]`** (sublinhado tracejado): RQE, CNPJ, razão social, sobrenome da Luciana, horário, e-mail, DPO e depoimentos reais com autorização por escrito.
- A Política de Privacidade precisa de revisão jurídica.
