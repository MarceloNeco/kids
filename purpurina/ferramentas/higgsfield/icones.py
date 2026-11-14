# Ícones 3D da Purpurina com o Qwen-Image (Apache-2.0). Um objeto por ícone, fundo branco liso (recortado depois).
import os, sys, torch, time
from diffusers import QwenImagePipeline
OUT = '/root/icones'; os.makedirs(OUT, exist_ok=True)
ESTILO = ('cute 3D render icon, Pixar style, glossy, soft studio lighting, pastel colors, pink and lilac palette, '
          'single object centered, isometric three-quarter view, clean plain pure white background, no text, no letters, no shadow on background, high detail')
ICONES = {
 # abas
 'g-eu': 'a cute smiling girl doll head with long brown hair and a pink bow',
 'g-make': 'a pink makeup set: lipstick, round blush compact and a fluffy brush',
 'g-roupa': 'a pink party dress on a small golden hanger',
 'g-joias': 'a sparkling pink diamond gem with tiny stars',
 'g-acess': 'a small golden princess crown with pink gems',
 'g-fundo': 'a tiny dreamy landscape diorama with a rainbow, clouds and a little tree',
 # eu
 'pele': 'six round paint swatches in different skin tones, from light to dark brown, on a small palette',
 'personagem': 'two cute doll faces side by side, a girl with pigtails and a boy with short hair, both smiling',
 'rosto': 'a cute doll face, oval, smiling, no hair, porcelain',
 'nariz': 'a cute small cartoon nose, soft skin color, close up',
 'testa': 'a cute doll head seen from the front with a headband showing the forehead',
 'formaOlho': 'one big sparkling cartoon eye with long eyelashes',
 'distOlhos': 'two cartoon eyes with a small pink double arrow between them',
 'formaBoca': 'cute glossy pink cartoon lips, smiling',
 'cabelo': 'a wavy long brown hair wig with a pink hair clip',
 'mechas': 'a lock of hair with rainbow colored highlights',
 'olhos': 'three cartoon eyes with blue, green and brown irises in a row',
 # maquiagem
 'base': 'a glass bottle of liquid foundation with a pink pump cap',
 'blush': 'an open round compact of pink blush with a small fluffy brush',
 'sombra': 'an open eyeshadow palette with pastel colors and glitter shades',
 'delineado': 'a black eyeliner pen with a golden cap',
 'cilios': 'a pair of long fluffy false eyelashes',
 'unhas': 'a bottle of pink nail polish with a few painted fake nails',
 'batom': 'an open glossy pink lipstick in a golden tube',
 'glitter': 'a small jar of pink and golden glitter with sparkles flying out',
 'adesivo': 'a sheet of cute face stickers: hearts, stars and a rainbow',
 # roupas
 'vestido': 'a lilac princess dress with a tulle skirt',
 'blusa': 'a pink t-shirt with a heart print, folded',
 'saia': 'a pink pleated tutu skirt',
 'calca': 'a pair of light blue jeans shorts',
 'estampa': 'a swatch of fabric with polka dots, stars and hearts patterns',
 'sapatos': 'a pair of shiny pink ballet flats with bows',
 # acessórios e joias
 'cabeca': 'a golden tiara with pink and purple gems',
 'laco': 'a big satin pink hair bow',
 'brincos': 'a pair of dangling heart shaped pink earrings',
 'colar': 'a pearl necklace with a heart pendant',
 'pulseira': 'a charm bracelet with colorful beads and a star charm',
 'anel': 'a golden ring with a big pink heart gem',
 'broche': 'a flower shaped brooch with pink petals and a pearl center',
 'oculos': 'heart shaped pink sunglasses',
 'bolsa': 'a small quilted pink handbag with a gold chain',
 'cenario': 'a tiny diorama of a pink bedroom with a bed, a window and fairy lights',
}
so = sys.argv[1:]
pipe = QwenImagePipeline.from_pretrained('/root/qwen', torch_dtype=torch.bfloat16)
pipe.enable_model_cpu_offload()
for nome, desc in ICONES.items():
    if so and nome not in so: continue
    dst = f'{OUT}/{nome}.png'
    if os.path.exists(dst): continue
    t = time.time()
    img = pipe(prompt=desc + ', ' + ESTILO, negative_prompt='text, watermark, letters, frame, border, cropped, blurry, dark background',
               width=768, height=768, num_inference_steps=24, true_cfg_scale=4.0,
               generator=torch.Generator('cpu').manual_seed(7)).images[0]
    img.save(dst); print('OK', nome, round(time.time() - t, 1), flush=True)
print('FIM', flush=True)
