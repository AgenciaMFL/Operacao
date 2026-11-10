# Rotina semanal: encarte Figma → WordPress

Instruções que o Claude segue quando a rotina agendada dispara (toda terça, de hora em hora).
A notificação para o celular é a mensagem final da sessão: deixe-a curta e direta.
`CLIENTE` é o nome do arquivo em `clientes/` (ex.: `rio-atacadao`).

1. Leia `clientes/CLIENTE.json`. A seção `figma` diz o arquivo e a página onde o encarte é colocado.
2. Com o MCP do Figma, rode `get_metadata` na página (`pagina_node_id`).
   - Os encartes são os elementos de primeiro nível da página (imagens/frames).
   - Ordene de cima para baixo (menor `y` primeiro; empate: menor `x`).
   - Se a página estiver vazia: pare e responda só "Sem encarte novo no Figma".
   - Se a quantidade for diferente do número de `slots` do JSON: pare e termine com
     "⚠️ Encarte <cliente>: achei N imagens no Figma, esperava M. Nada foi trocado." 
3. Para cada encarte, na ordem, rode `download_assets` com `defaultFormat` = `formato` e
   `defaultScale` = `escala` do JSON, e baixe o `export` com curl para uma pasta nova e vazia
   no scratchpad, com os nomes `1.jpg`, `2.jpg`... (na mesma ordem).
   Abra cada imagem e confira que é mesmo um encarte (folheto de ofertas). Se não for, pare e
   termine com "⚠️ Encarte <cliente>: ..." explicando o que achou.
4. Rode `python3 scripts/trocar_encarte.py PASTA --cliente CLIENTE` a partir da raiz do repositório
   (instale `requests` com `pip install -r scripts/requirements.txt` se faltar).
   - Saída com `SEM_MUDANCA`: o site já está com esse encarte. Responda só "Encarte já publicado".
   - Saída com "Página N atualizada": confira a URL publicada (o HTML deve conter os novos
     arquivos `encarte-AAAAMMDD-...`) e termine com
     "✅ Encarte <nome do cliente> atualizado no site: <url>". O próprio WordPress manda o
     e-mail de confirmação para os endereços em `notificar` do JSON; se a saída tiver
     `AVISO_EMAIL`, acrescente "(e-mail de confirmação falhou)" na mensagem final.
   - Qualquer `ERRO`: termine com "⚠️ Encarte <cliente> NÃO foi trocado: <erro resumido> —
     <o que o usuário precisa fazer>". Não tente contornar editando o site por outro caminho.
5. Não faça commit nem push de nada.
