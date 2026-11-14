#!/bin/bash
# Manda um arquivo pronto da caixa do Higgsfield para cá, um por um, assim que fica pronto (uguu.se: a caixa sobe e a
# sessão do Claude baixa de d.uguu.se; tmpfiles, litterbox, catbox e filebin não funcionaram). Música: WAV → MP3 96 kbps,
# −15 LUFS, final suave de 4 s. Uso: bash ~/enviar.sh <arquivo> musicas|icones   → linha "nome sha256 url" em ~/links.txt
f="$1"; tipo="$2"; FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
if [ "$tipo" = musicas ]; then
  b=$(basename "$f" .wav); n=${b%-*}; mkdir -p ~/mp3
  d=$($FF -i "$f" 2>&1 | grep -o "Duration: [0-9:.]*" | awk -F'[: ]' '{print $3*3600+$4*60+$5}'); st=$(python3 -c "print(max(0, $d-4))")
  $FF -nostdin -loglevel error -y -i "$f" -map_metadata -1 -af "afade=t=in:d=0.05,afade=t=out:st=$st:d=4,loudnorm=I=-15:TP=-1.5:LRA=11" -ar 44100 -ac 2 -b:a 96k ~/mp3/$n.mp3
  f=~/mp3/$n.mp3
fi
for i in 1 2 3; do u=$(curl -s -m 120 -F "files[]=@$f" https://uguu.se/upload | python3 -c "import sys,json;print(json.load(sys.stdin)['files'][0]['url'])" 2>/dev/null) && [ -n "$u" ] && break; sleep 5; done
echo "$(basename "$f") $(sha256sum "$f" | cut -c1-64) ${u:-FALHOU}" >> ~/links.txt
