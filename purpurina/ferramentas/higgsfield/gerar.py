# Compõe as músicas da Purpurina com o ACE-Step (Apache-2.0), sem voz. Cada música em 3 versões (seeds).
import os, json, sys, time
import torchaudio, soundfile as _sf
def _salvar(path, wav, sr=None, *a, sample_rate=48000, **k):
    sr = sr or sample_rate
    x = wav.detach().float().cpu().numpy()
    if x.ndim == 2: x = x.T
    _sf.write(str(path), x, sr)
torchaudio.save = _salvar
from acestep.pipeline_ace_step import ACEStepPipeline
OUT = os.path.expanduser('~/musicas'); os.makedirs(OUT, exist_ok=True)
INST = 'instrumental, no vocals, '
MUSICAS = [
 # brincar: pop de festa em tom maior
 ('sexta-a-noite', 'brincar', 150, 'dance pop, party pop, upbeat, energetic, major key, 126 bpm, saxophone hook, four on the floor drums, claps, funky bass, bright synths, catchy, feel good, friday night'),
 ('verao-neon', 'brincar', 150, 'electropop, summer pop, upbeat, happy, major key, 124 bpm, bright synth leads, plucks, punchy kick, handclaps, sunny, catchy'),
 ('fogos-no-ceu', 'brincar', 150, 'uplifting pop anthem, empowering, major key, 124 bpm, piano chords, big synths, strings, driving drums, euphoric, stadium, catchy'),
 ('sonho-adolescente', 'brincar', 150, 'pop rock, teen pop, upbeat, major key, 120 bpm, electric guitars, live drums, bass, bright, carefree, catchy'),
 ('doce-purpurina', 'brincar', 150, 'bubblegum pop, sweet, playful, upbeat, major key, 118 bpm, glossy synths, claps, bouncy bass, sparkling bells, catchy'),
 ('disco-rosa', 'brincar', 150, 'nu disco, funk pop, groovy, upbeat, major key, 120 bpm, slap bass, disco strings, rhythm guitar, four on the floor, glamorous, dance'),
 ('brilho-total', 'brincar', 150, 'piano house, dance pop, upbeat, joyful, major key, 128 bpm, house piano chords, deep bass, claps, uplifting'),
 ('festa-no-quarto', 'brincar', 150, 'funk pop, upbeat, cheerful, major key, 115 bpm, brass section, horns, groovy bass, live drums, claps, party'),
 # desfile: passarela animada
 ('passarela-de-luz', 'desfile', 150, 'fashion runway, catwalk music, deep house, chic, glamorous, confident, 124 bpm, deep bass, crisp hi hats, elegant synths, stylish'),
 ('holofotes', 'desfile', 150, 'electropop, fashion show, runway, confident, energetic, 122 bpm, pulsing synth bass, sparkling arpeggios, big drums, glamorous'),
 ('grande-final', 'desfile', 150, 'uplifting dance pop anthem, euphoric, celebration, major key, 128 bpm, big piano chords, supersaw synths, claps, festival'),
 # desfile: emocionante, mais sóbrio
 ('seja-voce', 'desfile', 150, 'emotional synth pop, midtempo, atmospheric, heartfelt, 100 bpm, warm synth pads, piano, deep bass, steady drums, building, cinematic, empowering'),
 ('coracao-eletrico', 'desfile', 150, 'emotional electropop, dreamy, midtempo, 108 bpm, lush pads, plucked synths, punchy drums, uplifting build, bittersweet'),
 ('estrela-que-brilha', 'desfile', 150, 'cinematic pop, emotional, inspiring, midtempo, 96 bpm, piano, strings, soft synths, big drums in chorus, epic build'),
]
ESCOLHIDA = {'festa-no-quarto': 777}  # a melhor versão de cada uma (medida na 1ª rodada: sem voz, tom maior, energia)
pipe = ACEStepPipeline(checkpoint_dir=os.path.expanduser('~/ckpt'), dtype='bfloat16', torch_compile=False)
so = sys.argv[1:]  # opcional: só estas
for nome, tipo, dur, tags in MUSICAS:
    if so and nome not in so: continue
    for sd in [ESCOLHIDA.get(nome, 11)]:
        dst = f'{OUT}/{nome}-{sd}.wav'
        if os.path.exists(dst): continue
        t = time.time()
        pipe(audio_duration=dur, prompt=INST + tags, lyrics='[instrumental]', infer_step=60, guidance_scale=15,
             scheduler_type='euler', cfg_type='apg', omega_scale=10, manual_seeds=str(sd), guidance_interval=0.5,
             guidance_interval_decay=0.0, min_guidance_scale=3, use_erg_tag=True, use_erg_lyric=True, use_erg_diffusion=True,
             oss_steps='', guidance_scale_text=0.0, guidance_scale_lyric=0.0, save_path=dst)
        print('OK', nome, sd, round(time.time() - t, 1), flush=True)
        os.system(f'bash ~/enviar.sh {dst} musicas &')   # converte e já manda (se a caixa cair, o que foi feito não se perde)
print('FIM', flush=True)
