# Mão na Massa (pasta cozinha/) — créditos e licenças

| O quê | De onde | Licença |
|---|---|---|
| 9 músicas gravadas do **Kevin MacLeod**, tocadas direto da pasta `../rabiscolandia/musicas/` (nenhum arquivo copiado): Fluffing a Duck (`fluffing-a-duck.mp3`), Carefree (`carefree.mp3`), Sneaky Snitch (`sneaky-snitch.mp3`), Scheming Weasel (`scheming-weasel.mp3`; gravação "Scheming Weasel (slower)"), Life of Riley (`life-of-riley.mp3`), Mariachi Snooze (`mariachi-snooze.mp3`), Carpe Diem (`carpe-diem.mp3`), Street Party (`street-party.mp3`) e Beachfront Celebration (`beachfront-celebration.mp3`) | "<nome da música>" Kevin MacLeod (incompetech.com), Licensed under Creative Commons: By Attribution. Origem de cada arquivo e conferência em `../rabiscolandia/musicas/LICENCAS.md` | **CC BY** (Creative Commons Atribuição — https://creativecommons.org/licenses/by/4.0/). O crédito aparece no tocador do canto da tela e no rodapé do menu |
| 4 músicas gravadas, tocadas direto da pasta `../baguncolandia/musicas/` (nenhum arquivo copiado): Happy Whistling Ukulele (`happy-whistling-ukulele.mp3`) e Ukulele Song (`ukulele-song.mp3`), de **Rafael Krux**; City Sunshine (`city-sunshine.mp3`) e Funshine (`funshine.mp3`), de **Kevin MacLeod** | FreePD (freepd.com), cópia github.com/0lhi/FreePD; origem em `../baguncolandia/CREDITOS.md` | domínio público, **CC0 1.0** (uso pessoal e comercial, sem obrigação de crédito; o crédito fica aqui e no tocador por cortesia) |
| Fonte Fredoka (`../rabiscolandia/fontes/fredoka.woff2`) | Google Fonts (cópia da Rabiscolândia) | SIL Open Font License 1.1 (`../rabiscolandia/fontes/OFL.txt`) |
| Emojis (frutas, legumes, bichos, utensílios) | desenhados pelo próprio aparelho (fonte de emoji do sistema) | — |

Desenhos dos utensílios (faca sem ponta, tábua, liquidificador, batedeira, espremedor, panela, fogão, forno, geladeira,
assadeira, espátula), dos ingredientes sem emoji (açúcar, óleo, fermento, manteiga, leite condensado, granulado,
polvilho), a vila, o ícone do app (`icone.svg`, `icone-192.png`, `icone-512.png`) e os sons de efeito: **originais,
feitos em código** para este jogo (`desenhos.js`, `estilo.css`, `app.js`). As receitas são receitas caseiras comuns,
escritas para criança.

Músicas escolhidas para a cozinha (v0.3.0, pedido do dono): só animadas e com instrumentos de verdade (ukulele, violão,
metais, acordeão, cordas, marimba). Saíram Spazzmatica Polka (polca de sintetizador, som de videogame antigo), Who Likes to
Party, Disco Lounge, Movement Proposition e Sunflower Dance Party (eletrônicas) e Airport Lounge e Gymnopédie nº 1 (calmas demais).

Desenhos das plantas do pomar e da horta (macieira, laranjeira, limoeiro, bananeira com o cacho e o coração, pé de morango,
parreira, pé de cenoura, pé de batata, tomateiro com estaca, alface, cheiro-verde): **originais, feitos em código** (`desenhos.js`).

## Voz gravada da Dona Cida (v0.6.1)

Pedido do dono (14/Nov/2026): no Samsung dele a vovó falava com voz de homem (a voz do aparelho). As 14 frases dela
(`voz/cida-*.mp3`) foram gravadas com a voz feminina **`pf_dora`** (português do Brasil) do **Kokoro-82M**
(hexgrad, https://huggingface.co/hexgrad/Kokoro-82M), modelo de voz livre com licença **Apache 2.0**, que permite
uso pessoal e comercial (os áudios gerados não têm restrição). Geradas com `kokoro-onnx` (MIT), velocidade 0,88,
e convertidas para MP3 mono de 48 kbps com o ffmpeg. Frase nova da vovó = gerar o mp3 com o mesmo jeito, pôr no
`sw.js` e chamar `fala(pt, en, fila, 'chave')`.

## Fotos de comida de verdade (v0.6.0)

Pedido do dono (14/Nov/2026): a foto de cada receita e de cada ingrediente (o pão de queijo aparece como pão de queijo, e
o queijo como queijo). Todas vêm da **Wikimedia Commons**, com licença livre (domínio público, CC0, CC BY ou CC BY-SA).
Cada uma foi cortada num quadrado e diminuída para 320 × 320 (JPG), e fica em `fotos/` para funcionar sem internet.
As fotos com **CC BY-SA** continuam com a mesma licença (CC BY-SA) depois do corte. Quem tirou a foto e o link estão
na tabela. A foto do *pacotinho de gelatina* é uma gelatina pronta (não havia foto livre boa do pozinho).

| Arquivo | Foto original (Wikimedia Commons) | Autor | Licença |
|---|---|---|---|
| `fotos/acucar.jpg` | [Bowl of white sugar without background.jpg](https://commons.wikimedia.org/wiki/File:Bowl_of_white_sugar_without_background.jpg) | Douglas P Perkins | CC BY 3.0 |
| `fotos/alface.jpg` | [Lettuce in a stack.jpg](https://commons.wikimedia.org/wiki/File:Lettuce_in_a_stack.jpg) | Jeffery Martin | CC0 |
| `fotos/banana.jpg` | [Single bananas in a bunch.jpg](https://commons.wikimedia.org/wiki/File:Single_bananas_in_a_bunch.jpg) | Springnuts | CC BY-SA 4.0 |
| `fotos/batata.jpg` | [Agriculture-72254.jpg](https://commons.wikimedia.org/wiki/File:Agriculture-72254.jpg) | Petr Kratochvil | CC0 |
| `fotos/bolo-cenoura.jpg` | [Bolo de cenoura com chocolate e granulado.jpg](https://commons.wikimedia.org/wiki/File:Bolo_de_cenoura_com_chocolate_e_granulado.jpg) | Sintegrity | CC BY-SA 4.0 |
| `fotos/brigadeiro.jpg` | [Brigadeiro.jpg](https://commons.wikimedia.org/wiki/File:Brigadeiro.jpg) | User Mayra (Maych) on Flickr | CC BY-SA 2.0 |
| `fotos/carne.jpg` | [Tere siga - raw beef dish, Ethiopia 2014.jpg](https://commons.wikimedia.org/wiki/File:Tere_siga_-_raw_beef_dish,_Ethiopia_2014.jpg) | Neftalem | CC BY-SA 4.0 |
| `fotos/cenoura.jpg` | [Fresh carrots from garden.jpg](https://commons.wikimedia.org/wiki/File:Fresh_carrots_from_garden.jpg) | ThereMazo | CC BY-SA 4.0 |
| `fotos/cheiro.jpg` | [Petersilie.jpg](https://commons.wikimedia.org/wiki/File:Petersilie.jpg) | Garitzko | domínio público |
| `fotos/chocolate.jpg` | [Toms Guldbarre Chocolate Bar In Pieces.jpg](https://commons.wikimedia.org/wiki/File:Toms_Guldbarre_Chocolate_Bar_In_Pieces.jpg) | Knud Winckelmann | CC BY-SA 3.0 |
| `fotos/churrasco.jpg` | [DFC 2095 Savory grilled pork skewers sizzling and caramelized to a perfect golden-brown.jpg](https://commons.wikimedia.org/wiki/File:DFC_2095_Savory_grilled_pork_skewers_sizzling_and_caramelized_to_a_perfect_golden-brown.jpg) | PattayaPatrol | CC BY-SA 4.0 |
| `fotos/cookies.jpg` | [Choc-Chip-Cookie.jpg](https://commons.wikimedia.org/wiki/File:Choc-Chip-Cookie.jpg) | Evan-Amos | domínio público |
| `fotos/farinha.jpg` | [All-Purpose Flour (4107895947).jpg](https://commons.wikimedia.org/wiki/File:All-Purpose_Flour_(4107895947).jpg) | Veganbaking.net from USA | CC BY-SA 2.0 |
| `fotos/fermento.jpg` | [Backpulver RZ.jpg](https://commons.wikimedia.org/wiki/File:Backpulver_RZ.jpg) | Rainer Z ... | CC BY-SA 3.0 |
| `fotos/gelatina.jpg` | [2019-10-10 22 15 43 Gelatin from a single opened cup of Jell-O strawberry gelatin snack being lifted by a spoon in the Franklin Farm section of Oak Hill, Fairfax County, Virginia.jpg](https://commons.wikimedia.org/wiki/File:2019-10-10_22_15_43_Gelatin_from_a_single_opened_cup_of_Jell-O_strawberry_gelatin_snack_being_lifted_by_a_spoon_in_the_Franklin_Farm_section_of_Oak_Hill,_Fairfax_County,_Virginia.jpg) | Famartin | CC BY-SA 4.0 |
| `fotos/gelatina-po.jpg` | [2019-10-10 22 13 03 A single opened cup of Jell-O strawberry gelatin snack after being mixed by a spoon in the Franklin Farm section of Oak Hill, Fairfax County, Virginia.jpg](https://commons.wikimedia.org/wiki/File:2019-10-10_22_13_03_A_single_opened_cup_of_Jell-O_strawberry_gelatin_snack_after_being_mixed_by_a_spoon_in_the_Franklin_Farm_section_of_Oak_Hill,_Fairfax_County,_Virginia.jpg) | Famartin | CC BY-SA 4.0 |
| `fotos/granulado.jpg` | [Hagelslag.jpg](https://commons.wikimedia.org/wiki/File:Hagelslag.jpg) | No machine-readable author provided. DennisM assumed (based  | domínio público |
| `fotos/laranja.jpg` | [Oranges - whole-halved-segment.jpg](https://commons.wikimedia.org/wiki/File:Oranges_-_whole-halved-segment.jpg) | Ivar Leidus | CC BY-SA 4.0 |
| `fotos/leite.jpg` | [Glass of Milk (33657535532).jpg](https://commons.wikimedia.org/wiki/File:Glass_of_Milk_(33657535532).jpg) | NIAID | CC BY 2.0 |
| `fotos/leitecond.jpg` | [Tin of condensed milk.jpg](https://commons.wikimedia.org/wiki/File:Tin_of_condensed_milk.jpg) | Robin from Rotterdam, Netherlands | CC BY-SA 2.0 |
| `fotos/limao.jpg` | [Lemon.jpg](https://commons.wikimedia.org/wiki/File:Lemon.jpg) | André Karwath aka Aka | CC BY-SA 2.5 |
| `fotos/maca.jpg` | [Red Apple.jpg](https://commons.wikimedia.org/wiki/File:Red_Apple.jpg) | Abhijit Tembhekar from Mumbai, India | CC BY 2.0 |
| `fotos/manteiga.jpg` | [Block of butter 20200928 080156.jpg](https://commons.wikimedia.org/wiki/File:Block_of_butter_20200928_080156.jpg) | Salicyna | CC BY-SA 4.0 |
| `fotos/mel.jpg` | [Jar and honey stick.jpg](https://commons.wikimedia.org/wiki/File:Jar_and_honey_stick.jpg) | Tasmanianbeekeepers | CC BY-SA 4.0 |
| `fotos/morango.jpg` | [Garden strawberry (Fragaria × ananassa) single2.jpg](https://commons.wikimedia.org/wiki/File:Garden_strawberry_(Fragaria_%C3%97_ananassa)_single2.jpg) | Ivar Leidus | CC BY-SA 4.0 |
| `fotos/oleo.jpg` | [Bottle 1 liter Sunflower refined oil.jpg](https://commons.wikimedia.org/wiki/File:Bottle_1_liter_Sunflower_refined_oil.jpg) | Exgsp Gmbh LLC BOTTLE 1 liter Sunflower refined oil | CC BY-SA 4.0 |
| `fotos/omelete.jpg` | [FoodOmelete.jpg](https://commons.wikimedia.org/wiki/File:FoodOmelete.jpg) | Renee Comet (photographer) | domínio público |
| `fotos/ovo.jpg` | [A brown chicken egg on white background.png](https://commons.wikimedia.org/wiki/File:A_brown_chicken_egg_on_white_background.png) | Leo219 | CC BY-SA 4.0 |
| `fotos/panqueca.jpg` | [Banana on pancake.jpg](https://commons.wikimedia.org/wiki/File:Banana_on_pancake.jpg) | Brandon Martin-Anderson | CC BY-SA 2.0 |
| `fotos/pao.jpg` | [Bread slices.jpg](https://commons.wikimedia.org/wiki/File:Bread_slices.jpg) | Saral Shots | CC0 |
| `fotos/pao-queijo.jpg` | [Cheesebread.jpg](https://commons.wikimedia.org/wiki/File:Cheesebread.jpg) | Murilo manzini | CC BY-SA 4.0 |
| `fotos/peixe.jpg` | [Tilapia del Nilo (Oreochromis niloticus), cenote El Pit, Yucatán, México, 2025-12-23, DD 02.jpg](https://commons.wikimedia.org/wiki/File:Tilapia_del_Nilo_(Oreochromis_niloticus),_cenote_El_Pit,_Yucat%C3%A1n,_M%C3%A9xico,_2025-12-23,_DD_02.jpg) | Diego Delso | CC BY-SA 4.0 |
| `fotos/peixe-assado.jpg` | [Backed Trout Fish from Himalayas.jpg](https://commons.wikimedia.org/wiki/File:Backed_Trout_Fish_from_Himalayas.jpg) | Kaynatkazi | CC BY-SA 4.0 |
| `fotos/pizza.jpg` | [Punch Neapolitan Pizza Margherita.jpg](https://commons.wikimedia.org/wiki/File:Punch_Neapolitan_Pizza_Margherita.jpg) | Punch Pizza | CC BY 2.0 |
| `fotos/polvilho.jpg` | [HK food 木薯粉 Pondan brand Tapioca Starch November 2022 Px3 10.jpg](https://commons.wikimedia.org/wiki/File:HK_food_%E6%9C%A8%E8%96%AF%E7%B2%89_Pondan_brand_Tapioca_Starch_November_2022_Px3_10.jpg) | MoRntashamL GOLD | CC BY-SA 4.0 |
| `fotos/queijo.jpg` | [Queijo Minas Frescal.JPG](https://commons.wikimedia.org/wiki/File:Queijo_Minas_Frescal.JPG) | The original uploader was Hellkt at German Wikipedia. (Origi | domínio público |
| `fotos/sal.jpg` | [Salt, sugar and pepper shakers.jpg](https://commons.wikimedia.org/wiki/File:Salt,_sugar_and_pepper_shakers.jpg) | Paul Goyette | CC BY-SA 2.0 |
| `fotos/salada-frutas.jpg` | [Fruit salad (1).jpg](https://commons.wikimedia.org/wiki/File:Fruit_salad_(1).jpg) | Renee Comet (Photographer) | domínio público |
| `fotos/sanduiche.jpg` | [Caprese Sandwich, Jolly Holiday Bakery Cafe 2013.jpg](https://commons.wikimedia.org/wiki/File:Caprese_Sandwich,_Jolly_Holiday_Bakery_Cafe_2013.jpg) | HarshLight from San Jose, CA, USA | CC BY 2.0 |
| `fotos/suco-laranja.jpg` | [Orange juice 1 edit1.jpg](https://commons.wikimedia.org/wiki/File:Orange_juice_1_edit1.jpg) | Agency of the United States Department of Agriculture Edited | domínio público |
| `fotos/tomate.jpg` | [Tomato je.jpg](https://commons.wikimedia.org/wiki/File:Tomato_je.jpg) | Softeis | CC BY-SA 3.0 |
| `fotos/uva.jpg` | [巨峰の房、窓辺.jpg](https://commons.wikimedia.org/wiki/File:%E5%B7%A8%E5%B3%B0%E3%81%AE%E6%88%BF%E3%80%81%E7%AA%93%E8%BE%BA.jpg) | Kanko* | CC BY 2.0 |
| `fotos/vitamina.jpg` | [Mango Banana Smoothie.jpg](https://commons.wikimedia.org/wiki/File:Mango_Banana_Smoothie.jpg) | Irma Sakul | CC BY-SA 4.0 |
