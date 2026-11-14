#!/bin/bash
# Roda na caixa L40S do Higgsfield (tudo em segundo plano: nohup bash ~/tudo.sh > ~/tudo.log 2>&1 &).
# 1) 14 músicas da Purpurina com o ACE-Step (Apache-2.0); 2) 42 ícones 3D com o Qwen-Image (Apache-2.0), fundo recortado
# (rembg, MIT). Cada arquivo pronto vai na hora para ~/links.txt (enviar.sh). Precisa de ~150 créditos (~2 h a 71/h).
pip install -q imageio-ffmpeg
cd ~ && git clone -q --depth 1 https://github.com/ace-step/ACE-Step.git && cd ACE-Step && grep -v -E "^(torch|torchaudio|torchvision)$" requirements.txt > req2.txt && pip install -q -r req2.txt && pip install -q --no-deps -e . && echo PIP_OK
( python3 -m venv --system-site-packages /root/img && /root/img/bin/pip install -q -U 'diffusers>=0.35' 'transformers>=4.51' accelerate imageio-ffmpeg 'rembg[cpu]' && echo VENV_OK && /root/img/bin/python -c "from huggingface_hub import snapshot_download as s; s('Qwen/Qwen-Image', local_dir='/root/qwen'); print('QWEN_OK')" ) > ~/qwen.log 2>&1 &
cd ~/ACE-Step && python3 ~/gerar.py > ~/gerar.log 2>&1; sleep 30; echo MUSICAS_OK
until grep -q QWEN_OK ~/qwen.log; do sleep 5; done
/root/img/bin/python ~/icones.py > ~/icones.log 2>&1
/root/img/bin/python ~/recorte.py > ~/recorte.log 2>&1
for f in ~/icones-webp/*.webp; do bash ~/enviar.sh "$f" icones; done; echo ICONES_OK
