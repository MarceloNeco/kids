/* Batalha Naval — QR code para o "📶 Jogar pertinho": desenhar o código na tela e ler o do outro aparelho com a câmera.
   Bibliotecas na própria pasta (nada de internet), carregadas só quando alguém usa o Jogar pertinho:
     libs/qrcode.js  — qrcode-generator 2.0.4 (Kazuhiko Arase, MIT) para desenhar
     libs/jsQR.js    — jsQR 1.4.0 (Cosmo Wolfe, Apache-2.0) para ler, quando o aparelho não tem leitor próprio
   Ler: câmera de trás (getUserMedia) → quadro a quadro; usa o leitor do próprio aparelho (BarcodeDetector, Android) se
   ele ler QR; senão, o jsQR num canvas pequeno.
   BNQR.desenhar(canvas, texto) → Promise<{ versao, modulos }>   (modo alfanumérico, correção M, margem de 4 quadradinhos)
   BNQR.ler(video, aoLer(texto)) → Promise<{ parar() }>  (erro.codigo: 'negado' | 'semcamera') */
(function (raiz) {
  'use strict';
  var carregando = {};
  function carregar(src, nome) {
    if (raiz[nome]) return Promise.resolve();
    if (carregando[src]) return carregando[src];
    carregando[src] = new Promise(function (ok, falha) {
      var s = document.createElement('script'); s.src = src;
      s.onload = function () { ok(); }; s.onerror = function () { delete carregando[src]; falha(new Error('não carregou ' + src)); };
      document.head.appendChild(s);
    });
    return carregando[src];
  }
  function erro(codigo) { var e = new Error(codigo); e.codigo = codigo; return e; }

  function desenhar(canvas, texto) {
    return carregar('libs/qrcode.js', 'qrcode').then(function () {
      var q = raiz.qrcode(0, 'M'); q.addData(texto, 'Alphanumeric'); q.make();
      var n = q.getModuleCount(), total = n + 8, esc = Math.max(4, Math.floor(640 / total)), lado = total * esc;
      canvas.width = lado; canvas.height = lado;
      var c = canvas.getContext('2d');
      c.fillStyle = '#fff'; c.fillRect(0, 0, lado, lado); c.fillStyle = '#000';
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (q.isDark(y, x)) c.fillRect((x + 4) * esc, (y + 4) * esc, esc, esc);
      return { versao: (n - 17) / 4, modulos: n };
    });
  }

  function detectorNativo() {
    if (typeof raiz.BarcodeDetector !== 'function') return Promise.resolve(null);
    return Promise.resolve(raiz.BarcodeDetector.getSupportedFormats ? raiz.BarcodeDetector.getSupportedFormats() : ['qr_code'])
      .then(function (f) { return f.indexOf('qr_code') >= 0 ? new raiz.BarcodeDetector({ formats: ['qr_code'] }) : null; })
      .catch(function () { return null; });
  }

  function ler(video, aoLer) {
    var md = raiz.navigator && navigator.mediaDevices;
    if (!md || !md.getUserMedia) return Promise.reject(erro('semcamera'));
    return md.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .catch(function (e) { throw erro(e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'negado' : 'semcamera'); })
      .then(function (st) {
        var parado = false, tempo = null, canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
        video.setAttribute('playsinline', ''); video.muted = true; video.srcObject = st;
        var p = video.play(); if (p && p.catch) p.catch(function () { /* o próximo quadro tenta de novo */ });
        var controle = { parar: function () { parado = true; clearTimeout(tempo); st.getTracks().forEach(function (t) { try { t.stop(); } catch (e) { /* ok */ } }); video.srcObject = null; }, stream: st };
        return detectorNativo().then(function (det) {
          var jsqr = det ? null : carregar('libs/jsQR.js', 'jsQR');
          function proximo() { if (!parado) tempo = setTimeout(quadro, 120); }
          function achou(txt) { if (!parado && txt) aoLer(txt); }
          function comJsQR() {
            if (!jsqr) jsqr = carregar('libs/jsQR.js', 'jsQR');
            return jsqr.then(function () {
              var w = video.videoWidth, h = video.videoHeight, k = Math.min(1, 720 / Math.max(w, h));
              canvas.width = Math.round(w * k); canvas.height = Math.round(h * k);
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              var img = ctx.getImageData(0, 0, canvas.width, canvas.height), r = raiz.jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
              if (r) achou(r.data);
            });
          }
          function quadro() {
            if (parado) return;
            if (video.readyState < 2 || !video.videoWidth) { proximo(); return; }
            var feito = det ? det.detect(video).then(function (l) { if (l && l.length) achou(l[0].rawValue); }, function () { det = null; return comJsQR(); }) : comJsQR();
            feito.then(proximo, proximo);
          }
          quadro();
          return controle;
        }, function (e) { controle.parar(); throw e; });
      });
  }

  raiz.BNQR = { desenhar: desenhar, ler: ler, carregar: carregar };
})(typeof window !== 'undefined' ? window : this);
