# Proposta comercial MFL Sales

Proposta em formato de site. A capa mostra o nome do cliente e o botão **Abrir proposta**, que revela a proposta completa. O visual fica fixo; **todo o conteúdo** (cliente, seções, textos, valores, condições, responsável) vem de um arquivo `.json` por proposta, editado por um formulário.

## Estrutura

```
index.html                 → a proposta (o que o cliente vê)
editor.html                → editor para o time comercial
propostas/
  padrao.json              → modelo padrão MFL Sales (ponto de partida)
assets/img                 → logo, ícone e avatares da capa
assets/video               → vídeo de fundo da capa (MP4 + WebM) e imagem de espera
assets/css, assets/js      → visual e lógica (não precisa mexer)
```

## O padrão de proposta MFL Sales

Consolidado a partir das propostas enviadas pelo comercial:

1. **Capa** (layout do Figma): vídeo de fundo, faixas animadas, prova social, nome do cliente, frase de impacto e o botão "Ver meu orçamento"
2. **Oportunidade**: o que o cliente já tem, o fluxo "da vitrine à venda" e a frase-chave
3. **Estratégia de aquisição**: Tráfego Pago (ou Inbound / Outbound), campanhas, o que está incluso, quem vamos alcançar
4. **CRM e automação**: funil, automações, sem CRM × com CRM
5. **SDR** (serviço opcional): responsabilidades, perfil, divisão de papéis
6. **Exemplo prático**: temas de campanha, jornada do cliente, mensagem de exemplo
7. **Plano de execução**: 90 dias (estruturação, otimização, escala), indicadores, responsabilidades
8. **Por que a MFL**: números, MFL × outras agências, time
9. **Investimento**: serviços ou planos, totais, condições e frase de fechamento
10. **Próximos passos**: botão de aprovação pelo WhatsApp e contato do responsável

Cada seção é montada com **blocos**, que o comercial adiciona, remove e reordena no editor:

| Bloco | Uso típico |
| --- | --- |
| Lista com ✓ | ativos do cliente, o que está incluso |
| Etapas numeradas | fluxo da vitrine à venda, funil, jornada |
| Cartões | campanhas, meses do plano, indicadores, perfil do SDR |
| Comparativo | sem CRM × com CRM, MFL × cliente, MFL × outras agências |
| Etiquetas | temas de campanha, segmentos |
| Números grandes | trajetória da MFL |
| Mensagem de exemplo | primeira mensagem para o lead |
| Frase de destaque | frase-chave no fim de cada seção |
| Observação | avisos e ressalvas |

Dois blocos seguidos com largura "Metade" ficam lado a lado.

## Como o comercial cria uma proposta

1. Abra `editor.html` e clique em **Nova (modelo)**, ou em **Abrir proposta…** para partir de uma existente.
2. Preencha **Cliente e proposta**. Nos textos, `{cliente}` vira o nome do cliente automaticamente.
3. Ajuste seções e blocos. Cada seção tem a opção **Exibir**.
4. Em **Investimento**, cadastre serviços ou planos. Sem totais cadastrados, os serviços não opcionais são somados sozinhos; desligue a soma quando forem planos alternativos (Plano 1 *ou* Plano 2).
5. Confira com **Ver capa** e **Celular**, clique em **Baixar .json** e coloque o arquivo na pasta `propostas/`.
6. Envie o link: `https://SEU-DOMINIO/index.html?p=nome-do-arquivo`

## Publicação

Site estático, sem build: GitHub Pages, Netlify ou Vercel servem. Precisa ser aberto por um servidor (não funciona com `file://`).

```bash
python3 -m http.server 8000
# http://localhost:8000/index.html?p=padrao
# http://localhost:8000/editor.html
```

> Quem tiver o link consegue abrir a proposta. Use nomes de arquivo difíceis de adivinhar se não quiser que propostas sejam encontradas por tentativa.
