"""Etapa 4a: decidir como transformar 16:9 em 9:16 (seguindo o rosto de quem fala)."""
from pathlib import Path
from statistics import median

import cv2

OUT_W, OUT_H = 1080, 1920


def probe(video: Path) -> tuple[int, int, float]:
    cap = cv2.VideoCapture(str(video))
    w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    cap.release()
    return w, h, fps


def face_center_x(video: Path, start: float, end: float, samples: int = 12) -> float | None:
    """Mediana da posição horizontal (0..1) do maior rosto em frames amostrados do trecho."""
    detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    cap = cv2.VideoCapture(str(video))
    width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    xs = []
    step = (end - start) / samples
    for i in range(samples):
        cap.set(cv2.CAP_PROP_POS_MSEC, (start + step * (i + 0.5)) * 1000)
        ok, frame = cap.read()
        if not ok:
            continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        min_size = int(frame.shape[0] * 0.08)
        faces = detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=6, minSize=(min_size, min_size))
        if len(faces):
            x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
            xs.append((x + w / 2) / width)
    cap.release()
    # Exige rosto em pelo menos 1/3 das amostras para confiar
    return median(xs) if len(xs) >= max(2, samples // 3) else None


def build_filter(video: Path, start: float, end: float, mode: str = "face") -> str:
    """Retorna a parte de vídeo do filtergraph do ffmpeg que gera 1080x1920."""
    w, h, _ = probe(video)

    if w / h <= 9 / 16 + 0.01:  # já é vertical
        return f"scale={OUT_W}:{OUT_H}:force_original_aspect_ratio=increase,crop={OUT_W}:{OUT_H}"

    if mode == "blur":
        # Vídeo inteiro no meio + fundo desfocado (bom para tela compartilhada / vários rostos)
        return (
            f"split[a][b];[a]scale={OUT_W}:{OUT_H}:force_original_aspect_ratio=increase,"
            f"crop={OUT_W}:{OUT_H},boxblur=20:2[bg];"
            f"[b]scale={OUT_W}:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2"
        )

    crop_w = int(h * 9 / 16) // 2 * 2
    cx = 0.5
    if mode == "face":
        found = face_center_x(video, start, end)
        if found is None:
            print("    rosto não encontrado; usando corte central")
        else:
            cx = found
    x = int(min(max(cx * w - crop_w / 2, 0), w - crop_w))
    return f"crop={crop_w}:{h}:{x}:0,scale={OUT_W}:{OUT_H}"
