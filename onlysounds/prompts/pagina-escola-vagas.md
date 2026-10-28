Na página **Escola** (`/escola`) do site onlysounds.com.br, usando o MCP `only-sounds-elementor`, coloque o **contador de vagas restantes**. Não mexa em mais nada.

O plugin **"OnlySounds – Vagas restantes"** já está instalado e ativo. Ele cria o shortcode **`[os_vagas]`**, que mostra "Restam X de 20 vagas com bônus" com uma barra de progresso. O número vem das vendas reais da Kiwify e se atualiza sozinho a cada 30 segundos.

## Onde colocar (widget **Shortcode** do Elementor, com o conteúdo `[os_vagas]`)
1. **Card da oferta (checkout):** logo **abaixo do bloco do Bônus** ("Feedback individual + sorteio de 2 mentorias coletivas") ou logo **acima do botão "Entrar na OnlySounds"** do card, centralizado.
2. **Hero:** logo **abaixo do botão "Entrar na OnlySounds"**, centralizado, com 16px de espaço acima.

## Cuidados
- Não copie o HTML do contador: use sempre o widget **Shortcode** com `[os_vagas]` (é o que liga o número às vendas).
- Se o site tiver plugin de cache, exclua de cache a rota `/wp-json/onlysounds/v1/vagas` (o contador já busca com "no-store", mas alguns plugins/CDN cacheiam mesmo assim).
- No mobile, o contador ocupa a largura do conteúdo (máx. 460px) e não pode causar rolagem horizontal.

## Entrega
Prints do contador no card da oferta e na hero (desktop e mobile 375px), e confirme que abrir `https://onlysounds.com.br/wp-json/onlysounds/v1/vagas` mostra algo como `{"total":20,"restantes":20}`.
