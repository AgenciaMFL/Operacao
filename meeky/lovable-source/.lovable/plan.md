# Plano — VIP por evento e interesse no Motion 1

## Resultado
- Tornar `/vip` alimentada por uma configuração de evento no banco, escolhida por `utm_campaign`, sem novo deploy para cadastrar eventos futuros.
- Cadastrar o evento Race Valley com nome, datas, local, oferta, preço, Instagram e causa social opcional vazia.
- Adicionar compra imediata do F5 ANC Pro, levando ao checkout e preservando a campanha do evento.
- Criar uma página simples “Quero ser avisado” para o Motion 1 e apontar o card da home para ela, sem reserva ou cobrança.
- Trocar a previsão vencida por “Lançamento em breve”.

## Implementação
- Criar uma tabela pública somente para leitura com configurações de eventos e políticas restritas; gravações ficam protegidas.
- Criar uma tabela separada para interesses no Motion 1, permitindo apenas cadastro público validado e sem leitura pública.
- Usar uma configuração padrão na `/vip` caso a campanha informada não exista ou o banco esteja indisponível.
- Registrar nome, e-mail, WhatsApp, consentimento e parâmetros UTM na nova captação de interesse.
- Testar as páginas em computador e celular, validar os cadastros no banco e publicar.

## Assunções
- O preço de evento do Race Valley será **R$ 279**, igual ao Crosstraining.
- O Instagram será **@meeky.br**.
- A causa social ficará vazia e não será exibida.
