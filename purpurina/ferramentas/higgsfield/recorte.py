# recorta o fundo branco dos ícones (rembg, MIT) e salva WebP 256x256
import glob, os
from rembg import remove, new_session
from PIL import Image
s = new_session('isnet-general-use'); os.makedirs('/root/icones-webp', exist_ok=True)
for f in sorted(glob.glob('/root/icones/*.png')):
    im = remove(Image.open(f).convert('RGB'), session=s)
    bb = im.getbbox(); im = im.crop(bb) if bb else im
    w, h = im.size; L = max(w, h); q = Image.new('RGBA', (L, L), (0, 0, 0, 0)); q.paste(im, ((L - w) // 2, (L - h) // 2))
    q = q.resize((256, 256), Image.LANCZOS)
    q.save('/root/icones-webp/' + os.path.basename(f)[:-4] + '.webp', 'WEBP', quality=86, method=6)
    print('OK', f, flush=True)
print('FIM', flush=True)
