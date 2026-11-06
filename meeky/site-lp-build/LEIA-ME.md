# Geradores das páginas novas do site-lp

As páginas novas (Home, Produto, Motion1, Sobre e o Blog) são geradas por estes scripts a partir dos layouts do Figma.
Ordem para regenerar: `build.py` (Home), `f5.py`, `motion.py`, `sobre.py`, `gen-blog-v2.py <pasta-com-blog/posts.json>` e por último **`perf.py`**
(aplica as otimizações de carregamento: fontes sem bloquear, React local em `vendor/`, pixels adiados, imagens com lazy e o topo instantâneo da Home).
Os caminhos dentro dos scripts apontam para a pasta temporária onde foram criados; ajuste `S`/`SITE` antes de rodar.
