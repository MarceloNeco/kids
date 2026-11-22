#!/usr/bin/env python3
"""Abertura do Bolinho FM: composição original da SolverONE / Bolinho de Chuva (21/Nov/2026).

Fantasia orquestral (pedido do dono, 21/Nov/2026: "música que remete à fantasia, com composições clássicas bonitas e
tradicionais, com tons fortes e mudanças bem emocionantes"). Tudo escrito aqui, nota por nota: melodia e harmonia
originais (nada copiado de música existente). Do áudio de inspiração do dono só ficaram o tom de partida (Ré maior)
e a energia; o áudio nunca entra no repositório.

Forma (cerca de 2min15):
  1. Introdução mágica (Ré maior, 96 bpm, pianíssimo): harpa, celesta, cordas suaves; acordes de Sol menor e Si bemol
     "de magia" sobre o Ré; o coro entra e tudo cresce até o rufo dos tímpanos.
  2. Tema heroico nas trompas (Ré maior, 116 bpm): cordas em ostinato, cellos e contrabaixos, trombones, tímpanos,
     fanfarras de trompete; na repetição, flauta dobrando no agudo e coro.
  3. Parte B delicada (Sol maior, 108 bpm): flauta canta, clarinete responde, oboé junta-se, cordas em pizzicato, harpa.
  4. Crescendo (Si bemol, Sol menor, Dó): escala das cordas subindo, rufo de tímpano e caixa, metais crescendo.
  5. Clímax com modulação para Fá maior: o tema na orquestra inteira (trompas, trompetes, violinos, coro, pratos).
  6. Final grandioso com ritardando: cadência IV-ii-V-I, o começo do tema uma última vez nas trompas, acorde final.

Instrumentos (banco General MIDI, FluidR3_GM): cordas (legato, pizzicato, cellos, contrabaixos, violas), trompas,
trompetes, trombones, tuba, flauta, oboé, clarinete, harpa, celesta, glockenspiel, tímpanos, kit de orquestra
(bumbo sinfônico, caixa, pratos) e coro "Ahh". Nada de som 8 bits.

Como refazer (da raiz do repositório kids):
    python3 ferramentas/musica-abertura.py            # grava musicas/bolinho-abertura.mp3
    python3 ferramentas/musica-abertura.py --trabalho /tmp/pasta   # guarda o MIDI, as faixas e o WAV final
Precisa de: python3 com mido, numpy e scipy; fluidsynth; ffmpeg; /usr/share/sounds/sf2/FluidR3_GM.sf2.
O sorteio da "mão humana" (pequenas variações de tempo e força) usa semente fixa: o resultado é sempre o mesmo.
"""
import argparse
import os
import random
import shutil
import subprocess
import sys
import tempfile

import warnings

import mido
import numpy as np
from scipy.io import wavfile

warnings.filterwarnings('ignore', category=wavfile.WavFileWarning)

SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
PPQ = 480
SR = 44100
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'musicas', 'bolinho-abertura.mp3')
ALVO_LUFS = -16.0   # igual às outras músicas da rádio (medidas entre -15,9 e -16,8 LUFS): sem pulo de volume
TETO_DB = -1.5      # pico máximo (limitador)
KBPS = 128          # cabe em até 2,5 MB com ~2min15
rnd = random.Random(21112026)

# ---------------------------------------------------------------- notas e acordes
PC = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def nota(s):
    """'F#4' -> número MIDI (C4 = 60)."""
    i, acc = 1, 0
    while s[i] in '#b':
        acc += 1 if s[i] == '#' else -1
        i += 1
    return 12 * (int(s[i:]) + 1) + PC[s[0]] + acc


def classe(s):
    i, acc = 1, 0
    while i < len(s) and s[i] in '#b':
        acc += 1 if s[i] == '#' else -1
        i += 1
    return (PC[s[0]] + acc) % 12, s[i:]


QUAL = {'': [0, 4, 7], 'm': [0, 3, 7], '7': [0, 4, 7, 10], 'm7': [0, 3, 7, 10], 'sus4': [0, 5, 7]}


def acorde(simbolo, tr=0):
    baixo = None
    if '/' in simbolo:
        simbolo, b = simbolo.split('/')
        baixo = classe(b)[0]
    r, q = classe(simbolo)
    pcs = [(r + i) % 12 for i in QUAL[q]]
    return {'pcs': [(p + tr) % 12 for p in pcs], 'baixo': ((baixo if baixo is not None else r) + tr) % 12}


def acima(pc, lo):
    """a nota mais grave >= lo com essa classe."""
    return lo + ((pc - lo) % 12)


def voz(ac, lo):
    return sorted(acima(p, lo) for p in ac['pcs'])


# ---------------------------------------------------------------- partes (uma faixa por instrumento)
class Parte:
    def __init__(self, nome, prog, vol=100, pan=64, rev=70, kit=False, ligar=False, ganho=1.0):
        self.nome, self.prog, self.vol, self.pan, self.rev, self.kit = nome, prog, vol, pan, rev, kit
        self.ligar, self.ganho = ligar, ganho      # ligar: notas iguais seguidas viram uma só (voz que fica)
        self.notas, self.ccs = [], []

    def n(self, beat, dur, pitch, vel, leg=0.95):
        if isinstance(pitch, str):
            pitch = nota(pitch)
        vel = max(1, min(127, int(round(vel + rnd.uniform(-4, 4)))))
        self.notas.append([beat, dur * leg, pitch, vel])

    def cc(self, beat, num, val):
        self.ccs.append((beat, num, max(0, min(127, int(round(val))))))

    def rampa(self, b0, b1, v0, v1, num=11, passo=0.25):
        k = max(1, int(round((b1 - b0) / passo)))
        for i in range(k + 1):
            self.cc(b0 + (b1 - b0) * i / k, num, v0 + (v1 - v0) * i / k)


P = {}


def parte(nome, *a, **k):
    P[nome] = Parte(nome, *a, **k)
    return P[nome]


violinos = parte('violinos', 48, vol=100, pan=44, rev=80, ganho=1.35)        # String Ensemble (melodia e escalas)
violas = parte('violas', 48, vol=92, pan=74, rev=75)             # ostinato
cordas = parte('cordas', 49, vol=96, pan=64, rev=90, ligar=True)  # Slow Strings: a cama
cellos = parte('cellos', 42, vol=100, pan=86, rev=70)
baixos = parte('baixos', 43, vol=100, pan=94, rev=65)
pizz = parte('pizz', 45, vol=98, pan=52, rev=70)
harpa = parte('harpa', 46, vol=100, pan=30, rev=85)
celesta = parte('celesta', 8, vol=100, pan=98, rev=90, ganho=1.8)
glock = parte('glock', 9, vol=80, pan=88, rev=90, ganho=2.5)
trompas = parte('trompas', 60, vol=110, pan=50, rev=80)
trompetes = parte('trompetes', 56, vol=96, pan=76, rev=75, ganho=1.35)
trombones = parte('trombones', 57, vol=92, pan=84, rev=75, ligar=True)
tuba = parte('tuba', 58, vol=92, pan=90, rev=70, ligar=True)
flauta = parte('flauta', 73, vol=100, pan=56, rev=85)
oboe = parte('oboe', 68, vol=92, pan=70, rev=85, ganho=1.6)
clarinete = parte('clarinete', 71, vol=96, pan=60, rev=85)
timpanos = parte('timpanos', 47, vol=110, pan=64, rev=75)
kit = parte('kit', 48, vol=100, pan=64, rev=80, kit=True)       # Orchestra Kit (banco 128)
coro = parte('coro', 52, vol=90, pan=64, rev=95, ligar=True)

BUMBO, CAIXA, PRATO1, PRATO2 = 36, 38, 57, 49


def acorde_em(prog, inicio, beat, tr=0):
    b = inicio
    for s, d in prog:
        if b <= beat < b + d:
            return acorde(s, tr)
        b += d
    raise ValueError(beat)


def frase(p, inicio, lista, vel, tr=0, oit=0, leg=0.95, acento=6):
    b = inicio
    for nome, d in lista:
        if nome:
            x = nota(nome) + tr + 12 * oit
            v = vel + (acento if abs((b - inicio) % 4) < 1e-6 else 0) + (x - 67) * 0.25
            p.n(b, d, x, v, leg)
        b += d
    return b


def cama(p, prog, inicio, lo, vel, tr=0, dobra=False):
    b = inicio
    for s, d in prog:
        notas = voz(acorde(s, tr), lo)
        if dobra:
            notas.append(notas[0] + 12)
        for x in notas:
            p.n(b, d, x, vel, leg=1.0)
        b += d
    return b


def raizes(p, prog, inicio, lo, vel, ritmo=((0, 4),), tr=0, quinta=False, leg=0.9):
    """baixo: ritmo = [(onde no acorde, duração)], cortado no tamanho do acorde."""
    b = inicio
    for s, d in prog:
        ac = acorde(s, tr)
        r = acima(ac['baixo'], lo)
        for i, (o, du) in enumerate(ritmo):
            if o >= d:
                continue
            x = r + 7 if (quinta and i % 2 == 1) else r
            p.n(b + o, min(du, d - o), x, vel + (6 if o == 0 else 0), leg)
        b += d
    return b


def arpejo(p, prog, inicio, lo, vel, passo=0.5, alcance=19, tr=0, desce=True):
    b = inicio
    for s, d in prog:
        ac = acorde(s, tr)
        grave = acima(ac['baixo'], lo)
        tons = [grave] + [x for x in range(grave + 1, lo + alcance + 1) if x % 12 in ac['pcs']]
        seq = tons + (tons[-2:0:-1] if desce else [])
        k = int(round(d / passo))
        for i in range(k):
            p.n(b + i * passo, passo * 2.2, seq[i % len(seq)], vel + (8 if i == 0 else 0) - (i % 2) * 4, leg=1.0)
        b += d
    return b


def ostinato(p, prog, inicio, lo, vel, tr=0, padrao=(0, 2, 1, 2, 0, 2, 1, 2), leg=0.55):
    b = inicio
    for s, d in prog:
        v = voz(acorde(s, tr), lo)
        k = int(round(d / 0.5))
        for i in range(k):
            p.n(b + i * 0.5, 0.5, v[padrao[i % len(padrao)] % len(v)], vel + (8 if i % 2 == 0 else 0), leg)
        b += d
    return b


def rufo(p, b0, b1, pitch, v0, v1, passo=0.125):
    k = int(round((b1 - b0) / passo))
    for i in range(k):
        p.n(b0 + i * passo, passo, pitch, v0 + (v1 - v0) * i / max(1, k - 1), leg=0.9)


def prato(b, vel, grande=False):
    kit.n(b, 4, PRATO1, vel, leg=1.0)
    if grande:
        kit.n(b, 4, PRATO2, vel - 10, leg=1.0)


# ---------------------------------------------------------------- a música
INTRO, A, B, CRESC, CLIMAX, FIM = 0, 32, 96, 128, 144, 208
FIM_NOTAS = 236

TEMPOS = [(0, 96), (A, 116), (B, 108), (CRESC, 108), (132, 110), (136, 112), (140, 114), (CLIMAX, 116),
          (FIM, 112), (212, 104), (216, 96), (218, 90), (220, 84), (224, 80), (228, 76), (231, 66), (232, 76)]

P_INTRO = [('D', 4), ('Gm/D', 4), ('D', 4), ('Bb/D', 4), ('G', 4), ('Em7', 4), ('Asus4', 4), ('A7', 4)]
P_TEMA = [('D', 4), ('Bm', 4), ('G', 4), ('A', 4), ('D', 4), ('F#m', 4), ('G', 2), ('Em', 2), ('A', 4),
          ('D', 4), ('Bm', 4), ('G', 4), ('A', 4), ('Bm', 4), ('G', 4), ('Em7', 2), ('A7', 2), ('D', 4)]
P_B = [('G', 4), ('D/F#', 4), ('Em', 4), ('Bm', 4), ('C', 4), ('G/B', 4), ('Am7', 4), ('D7', 4)]
P_CRESC = [('Bb', 4), ('Gm', 4), ('C', 4), ('C7', 4)]
P_FIM = [('Bb', 4), ('Gm7', 4), ('Csus4', 2), ('C7', 2), ('F', 4), ('F', 4), ('F', 3)]

# o tema (Ré maior): 1-5-5, sobe até o 5º grau agudo e volta; segunda frase termina na tônica
TEMA = [
    ('D4', 1.5), ('A4', .5), ('A4', 1), ('B4', .5), ('A4', .5),
    ('F#4', 1.5), ('D4', .5), ('B3', 2),
    ('G4', 1), ('B4', 1), ('D5', 1.5), ('C#5', .5),
    ('B4', 1), ('A4', 1), ('E4', 2),
    ('D4', 1.5), ('A4', .5), ('A4', 1), ('D5', 1),
    ('C#5', 1), ('B4', .5), ('A4', .5), ('F#4', 2),
    ('G4', 1), ('B4', 1), ('E5', 1), ('D5', .5), ('B4', .5),
    ('A4', 3), (None, 1),
    ('D4', 1.5), ('A4', .5), ('A4', 1), ('B4', .5), ('A4', .5),
    ('F#4', 1.5), ('D4', .5), ('B3', 2),
    ('G4', 1), ('B4', 1), ('D5', 1.5), ('C#5', .5),
    ('B4', 1), ('A4', 1), ('E4', 1), ('A4', 1),
    ('D5', 1.5), ('C#5', .5), ('B4', 1), ('F#4', 1),
    ('G4', 1), ('A4', .5), ('B4', .5), ('D5', 2),
    ('E5', 1), ('D5', .5), ('B4', .5), ('A4', 1), ('C#5', 1),
    ('D5', 4),
]
FLAUTA_B = [
    ('B5', 1), ('A5', .5), ('G5', .5), ('D5', 1), ('G5', 1),
    ('F#5', 1.5), ('E5', .5), ('D5', 2),
    ('E5', .5), ('F#5', .5), ('G5', 1), ('B5', 1), ('A5', .5), ('G5', .5),
    ('F#5', 3), ('D5', 1),
    ('E5', 1), ('G5', 1), ('C6', 1.5), ('B5', .5),
    ('B5', 1), ('A5', .5), ('G5', .5), ('D5', 2),
    ('C6', 1), ('B5', .5), ('A5', .5), ('E5', 1), ('G5', 1),
    ('F#5', 2), ('A5', 1), ('C6', 1),
]
CLARINETE_B = [('B4', 4), ('A4', 4), ('G4', 2), ('B4', 2), ('F#4', 4), ('G4', 2), ('E4', 2), ('D4', 2), ('G4', 2),
               ('E4', 2), ('C5', 2), ('A4', 2), ('F#4', 2)]
CELESTA_INTRO = [
    ('D5', 1.5), ('A5', .5), ('A5', 1), ('B5', .5), ('A5', .5),
    ('F#5', 2), ('D5', 2),
    ('D5', 1.5), ('A5', .5), ('A5', 1), ('D6', 1),
    ('D6', 1), ('C6', 1), ('Bb5', 2),
    ('G5', 1), ('B5', 1), ('D6', 1), ('G6', 1),
    ('E6', 1), ('D6', 1), ('B5', 1), ('G5', 1),
    ('D6', 2), (None, 2),
    ('C#6', 2), (None, 2),
]
ESCALA_CRESC = [('Bb3', 1), ('C4', 1), ('D4', 1), ('F4', 1), ('G4', 1), ('A4', 1), ('Bb4', 1), ('D5', 1),
                ('C5', .5), ('D5', .5), ('E5', .5), ('F5', .5), ('G5', .5), ('A5', .5), ('Bb5', .5), ('C6', .5),
                ('C6', 4)]
FIM_MELODIA = [('F5', 1.5), ('D5', .5), ('F5', 1), ('Bb5', 1),
               ('Bb5', 1.5), ('A5', .5), ('G5', 1), ('F5', 1),
               ('G5', 1), ('F5', 1), ('E5', 2),
               ('F5', 4)]
CABECA_FIM = [('F4', 1.5), ('C5', .5), ('C5', 1), ('F5', 1)]


def soma(l):
    return sum(d for _, d in l)


assert soma(TEMA) == 64 and soma(P_TEMA) == 64 and soma(FLAUTA_B) == 32 and soma(CLARINETE_B) == 32
assert soma(CELESTA_INTRO) == 32 and soma(ESCALA_CRESC) == 16 and soma(P_CRESC) == 16


def compor():
    # todas as partes começam com volume, panorama, reverb e expressão
    for p in P.values():
        p.cc(0, 7, p.vol)
        p.cc(0, 10, p.pan)
        p.cc(0, 91, p.rev)
        p.cc(0, 93, 20)
        p.cc(0, 11, 100)

    # ---- 1. introdução mágica (pp, crescendo)
    arpejo(harpa, P_INTRO, INTRO, nota('D3'), 64, alcance=24)
    harpa.rampa(INTRO, A, 85, 110)
    cama(cordas, P_INTRO, INTRO, nota('A3'), 60)
    cordas.rampa(INTRO, A, 64, 108)
    raizes(cellos, P_INTRO, INTRO, nota('C2'), 60, leg=1.0)
    cellos.rampa(INTRO, A, 60, 105)
    raizes(baixos, P_INTRO[4:], INTRO + 16, nota('E1'), 55, leg=1.0)
    baixos.rampa(INTRO + 16, A, 60, 105)
    frase(celesta, INTRO, CELESTA_INTRO, 70)
    for c in range(0, 8, 2):
        glock.n(INTRO + c * 4 + 3.5, 0.5, ['A6', 'D7', 'B6', 'E6'][c // 2], 48)
    cama(coro, P_INTRO[4:], INTRO + 16, nota('D4'), 58)
    coro.rampa(INTRO + 16, A, 40, 100)
    trompas.n(INTRO + 24, 4, 'A3', 62, leg=1.0)
    trompas.n(INTRO + 24, 4, 'D4', 62, leg=1.0)
    trompas.n(INTRO + 28, 4, 'A3', 66, leg=1.0)
    trompas.n(INTRO + 28, 4, 'C#4', 66, leg=1.0)
    trompas.rampa(INTRO + 24, A, 40, 115)
    rufo(timpanos, INTRO + 28, A, nota('A2'), 25, 95)
    for i, x in enumerate(['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5', 'E5', 'F#5', 'G5', 'A5', 'B5', 'C#6', 'D6', 'E6']):
        harpa.n(INTRO + 30 + i * 0.125, 0.6, x, 60 + i * 2, leg=1.0)   # glissando para o tema

    # ---- 2. tema heroico (Ré maior)
    for p in (trompas, violas, cellos, baixos, trombones, cordas, coro, harpa, timpanos, trompetes, flauta):
        p.cc(A, 11, 112)
    frase(trompas, A, TEMA[:30], 92)
    frase(trompas, A + 32, TEMA[30:], 104)
    ostinato(violas, P_TEMA, A, nota('A3'), 62)
    raizes(cellos, P_TEMA, A, nota('D2'), 74, ritmo=((0, 1.5), (1.5, .5), (2, 2)), quinta=True, leg=0.85)
    raizes(baixos, P_TEMA, A, nota('E1'), 74, ritmo=((0, 2), (2, 2)), leg=0.9)
    cama(trombones, P_TEMA[:9], A, nota('A2'), 56)
    cama(trombones, P_TEMA[9:], A + 32, nota('A2'), 70)
    arpejo(harpa, P_TEMA, A, nota('D3'), 48, alcance=17)
    cama(cordas, P_TEMA[9:], A + 32, nota('D5'), 62)
    cama(coro, P_TEMA[9:], A + 32, nota('F#4'), 62)
    frase(flauta, A + 32, TEMA[30:], 66, oit=1)
    b = A
    for s, d in P_TEMA:
        r = acima(acorde(s)['baixo'], nota('A2'))
        timpanos.n(b, 1, r, 80, leg=0.9)
        if d == 4:
            timpanos.n(b + 2, 1, r, 60, leg=0.9)
        b += d
    rufo(timpanos, A + 60, A + 62, nota('A2'), 50, 90)
    prato(A, 70)
    prato(A + 32, 84, grande=True)
    # fanfarras de trompete no fim de cada frase
    frase(trompetes, A + 28, [(None, 1), ('A4', .5), ('C#5', .5), ('E5', .5), ('E5', .5), ('A5', 1)], 88)
    frase(trompetes, A + 60, [('D5', 1), ('C#5', 1)], 86)
    frase(trompetes, A + 62, [('D5', 2 / 3), ('D5', 2 / 3), ('D5', 2 / 3), ('A5', 2)], 96, leg=0.8)
    trompas.cc(A + 63.9, 11, 112)

    # ---- 3. parte B delicada (Sol maior)
    for p in (cordas, cellos, harpa, flauta, clarinete, oboe, pizz, trompas):
        p.cc(B, 11, 100)
    frase(flauta, B, FLAUTA_B, 80, leg=0.97)
    frase(clarinete, B, CLARINETE_B, 60, leg=0.98)
    frase(oboe, B + 16, FLAUTA_B[17:], 62, oit=-1, leg=0.97)
    raizes(pizz, P_B, B, nota('G2'), 70, ritmo=((0, 1),))
    bb = B
    for s, d in P_B:
        v = voz(acorde(s), nota('D4'))
        for o in (1, 3):
            for x in v:
                pizz.n(bb + o, 0.5, x, 56, leg=0.6)
        bb += d
    arpejo(harpa, P_B, B, nota('G3'), 46, alcance=17)
    cama(cordas, P_B, B, nota('D4'), 48)
    cordas.rampa(B, B + 32, 70, 95)
    for i, x in enumerate(['G3', 'F#3', 'E3', 'D3', 'C3', 'B2', 'A2', 'D3']):
        cellos.n(B + i * 4, 4, x, 56, leg=0.98)
    for c in range(1, 8, 2):
        glock.n(B + c * 4 + 3, 1, ['D7', 'F#6', 'G6', 'C7'][c // 2], 42)
    trompas.n(B + 24, 4, 'E4', 50, leg=1.0)
    trompas.n(B + 28, 4, 'F#4', 54, leg=1.0)
    trompas.rampa(B + 24, CRESC, 70, 100)

    # ---- 4. crescendo para Fá maior
    for p in (violinos, cordas, trompas, trombones, tuba, coro, cellos, baixos, timpanos):
        p.cc(CRESC, 11, 50)
    frase(violinos, CRESC, ESCALA_CRESC, 78, leg=1.0)
    violinos.rampa(CRESC, CLIMAX, 70, 120)
    cama(cordas, P_CRESC, CRESC, nota('F4'), 70)
    cordas.rampa(CRESC, CLIMAX, 55, 120)
    cama(trompas, P_CRESC, CRESC, nota('F3'), 80)
    trompas.rampa(CRESC, CLIMAX - 0.1, 40, 127)
    cama(trombones, P_CRESC, CRESC, nota('Bb2'), 80)
    trombones.rampa(CRESC, CLIMAX - 0.1, 35, 120)
    raizes(tuba, P_CRESC, CRESC, nota('Bb1'), 80, leg=1.0)
    tuba.rampa(CRESC, CLIMAX - 0.1, 35, 115)
    cama(coro, P_CRESC, CRESC, nota('F4'), 80)
    coro.rampa(CRESC, CLIMAX - 0.1, 40, 120)
    raizes(cellos, P_CRESC, CRESC, nota('C2'), 80, ritmo=((0, 1), (1, 1), (2, 1), (3, 1)), leg=0.8)
    cellos.rampa(CRESC, CLIMAX, 55, 115)
    raizes(baixos, P_CRESC, CRESC, nota('E1'), 80, leg=1.0)
    baixos.rampa(CRESC, CLIMAX, 55, 115)
    timpanos.cc(CRESC, 11, 115)
    for i in range(8):
        timpanos.n(CRESC + i, 1, 'Bb2', 45 + i * 3, leg=0.9)
    rufo(timpanos, CRESC + 8, CLIMAX, nota('C3'), 40, 122)
    rufo(kit, CRESC + 8, CLIMAX, CAIXA, 20, 95, passo=1 / 6)
    frase(trompetes, CRESC + 12, [(None, 1), ('C5', 1 / 3), ('C5', 1 / 3), ('C5', 1 / 3), ('E5', 1 / 3), ('E5', 1 / 3),
                                  ('E5', 1 / 3), ('G5', 1)], 96, leg=0.8)

    # ---- 5. clímax: o tema em Fá maior com a orquestra inteira
    TR = 3
    for p in P.values():
        if not p.kit:
            p.cc(CLIMAX, 11, 120)
    frase(trompas, CLIMAX, TEMA, 116, tr=TR)
    frase(trompetes, CLIMAX, TEMA, 96, tr=TR)
    frase(violinos, CLIMAX, TEMA, 104, tr=TR, oit=1)
    frase(flauta, CLIMAX + 32, TEMA[30:], 76, tr=TR, oit=1)
    ostinato(violas, P_TEMA, CLIMAX, nota('A3'), 80, tr=TR)
    raizes(cellos, P_TEMA, CLIMAX, nota('D2'), 94, ritmo=((0, 1.5), (1.5, .5), (2, 1.5), (3.5, .5)), quinta=True, leg=0.85, tr=TR)
    raizes(baixos, P_TEMA, CLIMAX, nota('E1'), 94, ritmo=((0, 2), (2, 2)), tr=TR)
    cama(trombones, P_TEMA, CLIMAX, nota('A2'), 92, tr=TR)
    raizes(tuba, P_TEMA, CLIMAX, nota('C2'), 90, ritmo=((0, 2), (2, 2)), tr=TR)
    cama(cordas, P_TEMA, CLIMAX, nota('A4'), 84, tr=TR)
    cama(coro, P_TEMA, CLIMAX, nota('F4'), 98, tr=TR)
    arpejo(harpa, P_TEMA, CLIMAX, nota('F3'), 66, alcance=19, tr=TR)
    b = CLIMAX
    for s, d in P_TEMA:
        r = acima(acorde(s, TR)['baixo'], nota('A2'))
        timpanos.n(b, 1, r, 104, leg=0.9)
        timpanos.n(b + d / 2, 1, r if d == 2 else acima((r + 7) % 12, nota('A2')), 84, leg=0.9)
        if d == 4:
            timpanos.n(b + 3.5, .5, r, 74, leg=0.9)
        kit.n(b, 2, BUMBO, 86 if (b - CLIMAX) % 16 == 0 else 70, leg=1.0)
        b += d
    prato(CLIMAX, 112, grande=True)
    prato(CLIMAX + 16, 90)
    prato(CLIMAX + 32, 110, grande=True)
    prato(CLIMAX + 48, 92)
    for c in range(0, 16, 2):
        glock.n(CLIMAX + c * 4 + 2, 1, voz(acorde_em(P_TEMA, CLIMAX, CLIMAX + c * 4 + 2, TR), nota('C6'))[-1], 52)
    frase(trompetes, CLIMAX + 28, [(None, 1), ('C5', .5), ('E5', .5), ('G5', .5), ('G5', .5), ('C6', 1)], 100)
    rufo(timpanos, CLIMAX + 62, FIM, nota('C3'), 70, 110)

    # ---- 6. final grandioso (ritardando)
    for p in P.values():
        if not p.kit:
            p.cc(FIM, 11, 124)
    frase(trompetes, FIM, FIM_MELODIA, 104)
    frase(violinos, FIM, FIM_MELODIA, 106, oit=1)
    frase(flauta, FIM, FIM_MELODIA, 78, oit=1)
    cama(trompas, P_FIM[:5], FIM, nota('A3'), 104)
    frase(trompas, FIM + 16, CABECA_FIM, 116)          # o começo do tema, uma última vez
    frase(trompas, FIM + 20, [('F4', 3)], 116)
    frase(trompetes, FIM + 16, [('A4', 4), ('C5', 3)], 92)
    frase(violinos, FIM + 16, [('A5', 4), ('F6', 3)], 98)
    cama(trombones, P_FIM, FIM, nota('A2'), 100)
    raizes(tuba, P_FIM, FIM, nota('C2'), 98, leg=1.0)
    raizes(baixos, P_FIM, FIM, nota('E1'), 100, leg=1.0)
    raizes(cellos, P_FIM, FIM, nota('D2'), 98, ritmo=((0, 2), (2, 2)), quinta=True)
    cama(cordas, P_FIM, FIM, nota('C4'), 92, dobra=True)
    cama(coro, P_FIM, FIM, nota('F4'), 104)
    ostinato(violas, P_FIM[:5], FIM, nota('A3'), 86)
    arpejo(harpa, P_FIM[:5], FIM, nota('F3'), 70, alcance=24)
    for i, (x, d) in enumerate([('Bb2', 4), ('G2', 4), ('C3', 2), ('C3', 2)]):
        timpanos.n(FIM + i * 4 if i < 3 else FIM + 10, d * 0.5, x, 100 + i * 4, leg=0.9)
    timpanos.n(FIM + 12, 1, 'F2', 116, leg=0.9)
    rufo(timpanos, FIM + 20, FIM + 23, nota('F2'), 70, 122)
    rufo(kit, FIM + 21, FIM + 23, CAIXA, 40, 100, passo=1 / 6)
    prato(FIM, 100)
    prato(FIM + 12, 116, grande=True)
    for p in (cordas, coro, trombones, tuba, trompas):
        p.rampa(FIM + 16, FIM + 23, 100, 127)
    # o acorde final: todos juntos, curto e forte, depois do respiro
    HIT = FIM + 24
    for p, lo in ((trompas, 'F3'), (trompetes, 'F4'), (trombones, 'F2'), (cordas, 'F4'), (coro, 'F4'), (violinos, 'F5'),
                  (violas, 'C4'), (flauta, 'F5')):
        for x in voz(acorde('F'), nota(lo)):
            p.n(HIT, 1.5, x, 124, leg=1.0)
    for p, x in ((cellos, 'F2'), (baixos, 'F1'), (tuba, 'F1'), (timpanos, 'F2')):
        p.n(HIT, 1.5, x, 124, leg=1.0)
    harpa.n(HIT, 3, 'F2', 110, leg=1.0)
    for x in ('C3', 'F3', 'A3', 'C4', 'F4', 'A4', 'C5', 'F5'):
        harpa.n(HIT, 3, x, 104, leg=1.0)
    glock.n(HIT, 2, 'F6', 80)
    kit.n(HIT, 4, BUMBO, 120, leg=1.0)
    prato(HIT, 124, grande=True)


# ---------------------------------------------------------------- MIDI
def ticks(beat):
    return int(round(beat * PPQ))


def faixa_tempo():
    t = mido.MidiTrack()
    t.append(mido.MetaMessage('time_signature', numerator=4, denominator=4, time=0))
    t.append(mido.MetaMessage('key_signature', key='D', time=0))
    ultimo = 0
    for b, bpm in TEMPOS:
        tk = ticks(b)
        t.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(bpm), time=tk - ultimo))
        ultimo = tk
    return t


def eventos(p, canal):
    ev = []
    notas = sorted(p.notas, key=lambda x: (x[2], x[0]))
    if p.ligar:   # voz que fica: nota igual que começa onde a outra acaba vira uma nota só
        juntas = []
        for x in notas:
            if juntas and juntas[-1][2] == x[2] and abs(juntas[-1][0] + juntas[-1][1] - x[0]) < 0.06:
                juntas[-1][1] = x[0] + x[1] - juntas[-1][0]
            else:
                juntas.append(list(x))
        notas = juntas
    # mesma nota sobreposta: a de antes acaba um pouco antes da próxima começar
    porpitch = {}
    for x in sorted(notas, key=lambda y: y[0]):
        porpitch.setdefault(x[2], []).append(x)
    for lst in porpitch.values():
        for a, b in zip(lst, lst[1:]):
            if a[0] + a[1] > b[0] - 0.02:
                a[1] = max(0.05, b[0] - a[0] - 0.02)
    for beat, dur, pitch, vel in notas:
        j = 0 if p.kit else rnd.randint(-6, 6)          # mão humana: até ~6 ms
        t0 = max(0, ticks(beat) + j)
        ev.append((t0, 1, mido.Message('note_on', channel=canal, note=pitch, velocity=vel)))
        ev.append((max(t0 + 1, ticks(beat + dur) + j), 0, mido.Message('note_off', channel=canal, note=pitch, velocity=0)))
    for beat, num, val in p.ccs:
        ev.append((ticks(beat), -1, mido.Message('control_change', channel=canal, control=num, value=val)))
    ev.sort(key=lambda e: (e[0], e[1]))
    t = mido.MidiTrack()
    t.append(mido.Message('program_change', channel=canal, program=p.prog, time=0))
    agora = 0
    for tk, _, m in ev:
        m.time = tk - agora
        agora = tk
        t.append(m)
    return t


def midi(partes):
    m = mido.MidiFile(ticks_per_beat=PPQ)
    m.tracks.append(faixa_tempo())
    livres = [c for c in range(16) if c != 9]
    for p in partes:
        m.tracks.append(eventos(p, 9 if p.kit else livres.pop(0)))
    return m


# ---------------------------------------------------------------- conferências da partitura
def conferir_tom():
    """cada nota tem que estar na escala da parte (com os acordes 'de magia' da introdução e do crescendo)."""
    def escala(tonica, extra=()):
        return {(tonica + i) % 12 for i in (0, 2, 4, 5, 7, 9, 11)} | set(extra)
    regioes = [(INTRO, A, escala(2, (10, 5, 0))), (A, B, escala(2)), (B, CRESC, escala(7)),
               (CRESC, CLIMAX, escala(5)), (CLIMAX, FIM_NOTAS + 8, escala(5))]
    fora = []
    for p in P.values():
        if p.kit:
            continue
        for beat, dur, pitch, vel in p.notas:
            for b0, b1, esc in regioes:
                if b0 <= beat < b1 and pitch % 12 not in esc:
                    fora.append((p.nome, beat, pitch))
    return fora


def segundos(beat):
    s, ant_b, ant_bpm = 0.0, 0, TEMPOS[0][1]
    for b, bpm in TEMPOS[1:]:
        if b >= beat:
            break
        s += (b - ant_b) * 60 / ant_bpm
        ant_b, ant_bpm = b, bpm
    return s + (beat - ant_b) * 60 / ant_bpm


# ---------------------------------------------------------------- gravar
def rodar(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stdout + r.stderr)
        raise SystemExit('falhou: ' + ' '.join(cmd[:3]))
    return r.stdout + r.stderr


def renderizar(pasta):
    faixas = {}
    for p in P.values():
        mid = os.path.join(pasta, p.nome + '.mid')
        wav = os.path.join(pasta, p.nome + '.wav')
        midi([p]).save(mid)
        rodar(['fluidsynth', '-ni', '-q', '-r', str(SR), '-g', '0.5',
               '-o', 'audio.file.format=float', '-o', 'synth.reverb.active=1',
               '-o', 'synth.reverb.room-size=0.82', '-o', 'synth.reverb.damp=0.35',
               '-o', 'synth.reverb.width=1.0', '-o', 'synth.reverb.level=0.75',
               '-o', 'synth.chorus.active=0', '-o', 'synth.polyphony=512',
               '-F', wav, SF2, mid])
        _, x = wavfile.read(wav)
        faixas[p.nome] = x.astype(np.float64) * p.ganho
    n = max(len(x) for x in faixas.values())
    mix = np.zeros((n, 2))
    for x in faixas.values():
        mix[:len(x)] += x
    return mix, faixas


def medir(arquivo):
    out = rodar(['ffmpeg', '-hide_banner', '-nostats', '-i', arquivo, '-af', 'ebur128=peak=true', '-f', 'null', '-'])
    resumo = out[out.rfind('Summary:'):]
    i = float(resumo.split('I:')[1].split('LUFS')[0])
    pk = float(resumo.split('Peak:')[1].split('dBFS')[0])
    lra = float(resumo.split('LRA:')[1].split('LU')[0])
    return i, pk, lra


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--trabalho', help='pasta para guardar MIDI, faixas e WAV (senão, uma pasta temporária)')
    ap.add_argument('--saida', default=SAIDA)
    a = ap.parse_args()
    compor()
    fora = conferir_tom()
    if fora:
        raise SystemExit('notas fora do tom: %r' % fora[:20])
    pasta = a.trabalho or tempfile.mkdtemp(prefix='abertura-')
    os.makedirs(pasta, exist_ok=True)
    mix, _ = renderizar(pasta)
    # corta o silêncio depois do fim (mantém 3,5 s de cauda do reverb), com um "fade" curtinho só no rabo do reverb
    fim = int((segundos(FIM_NOTAS) + 3.5) * SR)
    mix = mix[:fim]
    k = int(0.8 * SR)
    mix[-k:] *= np.linspace(1, 0, k)[:, None] ** 2
    mix /= np.max(np.abs(mix)) / 0.5
    bruto = os.path.join(pasta, 'abertura-bruto.wav')
    wavfile.write(bruto, SR, mix.astype(np.float32))
    i0, _, _ = medir(bruto)
    # ganho até o alvo + compressor suave (orquestra tem muita dinâmica) + limitador; depois confere e corrige o ganho
    final = os.path.join(pasta, 'abertura-final.wav')
    ganho = ALVO_LUFS - i0 + 2.0
    for _ in range(4):
        filtro = ('acompressor=threshold=-22dB:ratio=2:attack=25:release=300:knee=6,volume=%.2fdB,'
                  'alimiter=limit=%.4f:attack=4:release=120:level=false' % (ganho, 10 ** (TETO_DB / 20)))
        rodar(['ffmpeg', '-y', '-hide_banner', '-i', bruto, '-af', filtro, '-c:a', 'pcm_f32le', final])
        i1, pk, lra = medir(final)
        if abs(i1 - ALVO_LUFS) < 0.3:
            break
        ganho += ALVO_LUFS - i1
    rodar(['ffmpeg', '-y', '-hide_banner', '-i', final, '-c:a', 'libmp3lame', '-b:a', '%dk' % KBPS, '-ar', str(SR),
           '-ac', '2', '-metadata', 'title=Abertura do Bolinho FM', '-metadata', 'artist=SolverONE / Bolinho de Chuva',
           '-metadata', 'album=Bolinho de Chuva', '-metadata', 'comment=Composição original, CC0 1.0', a.saida])
    i2, pk2, lra2 = medir(a.saida)
    dur = float(rodar(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.saida]).strip())
    print('gravado: %s' % a.saida)
    print('duração %.1f s · %.2f MB · %.1f LUFS · pico %.1f dBFS · LRA %.1f LU' % (
        dur, os.path.getsize(a.saida) / 1048576, i2, pk2, lra2))
    print('partes (segundos): intro 0 · tema %.1f · B %.1f · crescendo %.1f · clímax %.1f · final %.1f' % tuple(
        segundos(b) for b in (A, B, CRESC, CLIMAX, FIM)))
    if not a.trabalho:
        shutil.rmtree(pasta, ignore_errors=True)


if __name__ == '__main__':
    main()
