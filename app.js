// YouTube Photo Card Generator - Application Logic

document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('image-input');
  const dropZone = document.getElementById('drop-zone');
  const editorControls = document.getElementById('editor-controls');
  const previewCanvas = document.getElementById('preview-canvas');
  const emptyPreview = document.getElementById('empty-preview');
  const downloadBtn = document.getElementById('download-btn');

  const inputMake = document.getElementById('input-make');
  const inputModel = document.getElementById('input-model');
  const inputLens = document.getElementById('input-lens');
  const inputFocalLength = document.getElementById('input-focal-length');
  const inputFNumber = document.getElementById('input-f-number');
  const inputExposureTime = document.getElementById('input-exposure-time');
  const inputIso = document.getElementById('input-iso');
  const inputCustomText = document.getElementById('input-custom-text');

  const sliderBlur = document.getElementById('slider-blur');
  const valueBlur = document.getElementById('value-blur');
  const sliderBrightness = document.getElementById('slider-brightness');
  const valueBrightness = document.getElementById('value-brightness');
  const sliderScale = document.getElementById('slider-scale');
  const valueScale = document.getElementById('value-scale');
  const selectTextTheme = document.getElementById('select-text-theme');
  const selectFrameType = document.getElementById('select-frame-type');
  const sliderFrameSize = document.getElementById('slider-frame-size');
  const valueFrameSize = document.getElementById('value-frame-size');
  const sliderTextSize = document.getElementById('slider-text-size');
  const valueTextSize = document.getElementById('value-text-size');
  const sliderTextX = document.getElementById('slider-text-x');
  const valueTextX = document.getElementById('value-text-x');
  const sliderTextY = document.getElementById('slider-text-y');
  const valueTextY = document.getElementById('value-text-y');
  const sliderCustomTextSize = document.getElementById('slider-custom-text-size');
  const valueCustomTextSize = document.getElementById('value-custom-text-size');
  const sliderCustomTextX = document.getElementById('slider-custom-text-x');
  const valueCustomTextX = document.getElementById('value-custom-text-x');
  const sliderCustomTextY = document.getElementById('slider-custom-text-y');
  const valueCustomTextY = document.getElementById('value-custom-text-y');
  const selectAspectRatio = document.getElementById('select-aspect-ratio');
  const previewTitle = document.getElementById('preview-title');
  const previewDimensions = document.getElementById('preview-dimensions');
  const downloadTip = document.getElementById('download-tip');
  const selectImageFormat = document.getElementById('select-image-format');
  const selectFontFamily = document.getElementById('select-font-family');

  let loadedImage = null;
  let exifData = {};

  loadSettings();

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) handleImageFile(files[0]);
  });

  imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleImageFile(e.target.files[0]);
  });

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadedImage = img;
        EXIF.getData(file, function() {
          exifData = {
            make: cleanString(EXIF.getTag(this, "Make")),
            model: cleanString(EXIF.getTag(this, "Model")),
            lens: cleanString(EXIF.getTag(this, "LensModel") || EXIF.getTag(this, "LensInfo")),
            focalLength: formatFocalLength(EXIF.getTag(this, "FocalLength")),
            fNumber: formatFNumber(EXIF.getTag(this, "FNumber")),
            exposureTime: formatExposureTime(EXIF.getTag(this, "ExposureTime")),
            iso: EXIF.getTag(this, "ISOSpeedRatings") || EXIF.getTag(this, "ISO")
          };
          if (exifData.make) inputMake.value = exifData.make;
          if (exifData.model) inputModel.value = exifData.model;
          if (exifData.lens) inputLens.value = exifData.lens;
          if (exifData.focalLength) inputFocalLength.value = exifData.focalLength;
          if (exifData.fNumber) inputFNumber.value = exifData.fNumber;
          if (exifData.exposureTime) inputExposureTime.value = exifData.exposureTime;
          if (exifData.iso) inputIso.value = exifData.iso;

          editorControls.classList.remove('disabled');
          emptyPreview.style.display = 'none';
          previewCanvas.style.display = 'block';
          updateAspectRatioUI();
          drawCard();
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function cleanString(str) {
    if (!str) return '';
    return str.replace(/\0/g, '').trim();
  }

  function formatFocalLength(val) {
    if (!val) return '';
    const num = Number(val);
    return isNaN(num) ? val.toString() : `${Math.round(num)}mm`;
  }

  function formatFNumber(val) {
    if (!val) return '';
    const num = Number(val);
    return isNaN(num) ? `f/${val}` : `f/${num.toFixed(1).replace('.0', '')}`;
  }

  function formatExposureTime(val) {
    if (!val) return '';
    const num = Number(val);
    if (isNaN(num)) return val.toString();
    if (num >= 1) return `${num.toFixed(1).replace('.0', '')}s`;
    const denominator = Math.round(1 / num);
    return `1/${denominator}s`;
  }

  function drawCard() {
    if (!loadedImage) return;

    const ratioVal = selectAspectRatio.value;
    if (ratioVal === '9-16') {
      previewCanvas.width = 1080;
      previewCanvas.height = 1920;
    } else if (ratioVal === '3-4') {
      previewCanvas.width = 1080;
      previewCanvas.height = 1440;
    } else if (ratioVal === '4-3') {
      previewCanvas.width = 1440;
      previewCanvas.height = 1080;
    } else {
      previewCanvas.width = 1920;
      previewCanvas.height = 1080;
    }

    const ctx = previewCanvas.getContext('2d');
    const width = previewCanvas.width;
    const height = previewCanvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    const blurRadius = sliderBlur.value;
    const brightness = sliderBrightness.value;
    ctx.filter = `blur(${blurRadius}px) brightness(${brightness}%)`;

    const imgRatio = loadedImage.width / loadedImage.height;
    const canvasRatio = width / height;
    let bgW, bgH, bgX, bgY;

    if (imgRatio > canvasRatio) {
      bgH = height + blurRadius * 4;
      bgW = bgH * imgRatio;
    } else {
      bgW = width + blurRadius * 4;
      bgH = bgW / imgRatio;
    }
    bgX = (width - bgW) / 2;
    bgY = (height - bgH) / 2;
    ctx.drawImage(loadedImage, bgX, bgY, bgW, bgH);
    ctx.restore();

    ctx.save();
    const scale = sliderScale.value / 100;
    const maxW = width * scale;
    const maxH = height * scale;

    let fgW, fgH;
    if (imgRatio > canvasRatio) {
      fgW = maxW;
      fgH = fgW / imgRatio;
      if (fgH > maxH) { fgH = maxH; fgW = fgH * imgRatio; }
    } else {
      fgH = maxH;
      fgW = fgH * imgRatio;
      if (fgW > maxW) { fgW = maxW; fgH = fgW / imgRatio; }
    }

    const fgX = (width - fgW) / 2;
    const fgY = (height - fgH) / 2;
    const frameType = selectFrameType.value;
    const frameSize = parseInt(sliderFrameSize.value, 10);

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 15;
    if (frameType === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fgX - frameSize, fgY - frameSize, fgW + frameSize * 2, fgH + frameSize * 2);
    } else if (frameType === 'black') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(fgX - frameSize, fgY - frameSize, fgW + frameSize * 2, fgH + frameSize * 2);
    }
    ctx.restore();

    ctx.save();
    if (frameType === 'none') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15;
    }
    ctx.drawImage(loadedImage, fgX, fgY, fgW, fgH);
    ctx.restore();
    ctx.restore();

    const make = inputMake.value.trim();
    const model = inputModel.value.trim();
    const lens = inputLens.value.trim();
    const focal = inputFocalLength.value.trim();
    const fnum = inputFNumber.value.trim();
    const exp = inputExposureTime.value.trim();
    const iso = inputIso.value.trim();
    const customText = inputCustomText.value.trim();

    ctx.save();
    const theme = selectTextTheme.value;
    let textColor = '#ffffff';
    let textShadow = true;
    let textBg = false;
    let bgFillColor = 'rgba(0, 0, 0, 0.4)';

    if (theme === 'white-shadow') { textColor = '#ffffff'; textShadow = true; textBg = false; }
    else if (theme === 'white-bg') { textColor = '#ffffff'; textShadow = false; textBg = true; bgFillColor = 'rgba(0, 0, 0, 0.4)'; }
    else if (theme === 'black-shadow') { textColor = '#111111'; textShadow = true; }
    else if (theme === 'black-bg') { textColor = '#111111'; textShadow = false; textBg = true; bgFillColor = 'rgba(255, 255, 255, 0.7)'; }

    if (textShadow) {
      ctx.shadowColor = theme.startsWith('white') ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    const textSize = parseInt(sliderTextSize.value, 10);
    const textX = parseInt(sliderTextX.value, 10);
    const textY = parseInt(sliderTextY.value, 10);

    const fontFamilyOption = selectFontFamily.value;
    let fontLine1 = '"Outfit", "Inter", "Noto Sans JP", sans-serif';
    let fontLine2 = '"Outfit", "Inter", "Noto Sans JP", sans-serif';
    let fontCustom = '"Outfit", "Inter", "Noto Sans JP", sans-serif';

    if (fontFamilyOption === 'serif') {
      fontLine1 = '"Playfair Display", "Noto Serif JP", Georgia, serif';
      fontLine2 = '"Playfair Display", "Noto Serif JP", Georgia, serif';
      fontCustom = '"Playfair Display", "Noto Serif JP", Georgia, serif';
    } else if (fontFamilyOption === 'display') {
      fontLine1 = '"Anton", "Montserrat", "Noto Sans JP", sans-serif';
      fontLine2 = '"Montserrat", "Noto Sans JP", sans-serif';
      fontCustom = '"Montserrat", "Noto Sans JP", sans-serif';
    } else if (fontFamilyOption === 'rounded') {
      fontLine1 = '"Quicksand", "M PLUS Rounded 1c", sans-serif';
      fontLine2 = '"Quicksand", "M PLUS Rounded 1c", sans-serif';
      fontCustom = '"Quicksand", "M PLUS Rounded 1c", sans-serif';
    } else if (fontFamilyOption === 'mono') {
      fontLine1 = '"JetBrains Mono", "Noto Sans JP", monospace';
      fontLine2 = '"JetBrains Mono", "Noto Sans JP", monospace';
      fontCustom = '"JetBrains Mono", "Noto Sans JP", monospace';
    }

    let line1 = '';
    if (make || model) {
      const brand = make ? (model.toUpperCase().startsWith(make.toUpperCase()) ? '' : make + ' ') : '';
      line1 += `${brand}${model}`.trim();
    }
    if (lens) line1 += line1 ? `  |  ${lens}` : lens;

    let settings = [];
    if (focal) settings.push(focal);
    if (fnum) settings.push(fnum);
    if (exp) settings.push(exp);
    if (iso) settings.push(`ISO ${iso}`);
    const line2 = settings.join('   ');

    if (line1 || line2) {
      ctx.fillStyle = textColor;
      if (textBg) {
        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.font = `bold ${textSize}px ${fontLine1}`;
        const w1 = ctx.measureText(line1).width;
        ctx.font = `${Math.round(textSize * 2 / 3)}px ${fontLine2}`;
        const w2 = ctx.measureText(line2).width;
        const boxW = Math.max(w1, w2) + 60;
        const boxH = Math.round(textSize * 4.17);
        const boxX = textX - 30;
        const boxY = textY - Math.round(textSize * 2.92);
        ctx.fillStyle = bgFillColor;
        drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 16);
        ctx.restore();
        ctx.fillStyle = textColor;
      }
      ctx.font = `bold ${textSize}px ${fontLine1}`;
      ctx.fillText(line1, textX, textY - Math.round(textSize * 1.11));
      ctx.font = `${Math.round(textSize * 2 / 3)}px ${fontLine2}`;
      ctx.fillStyle = theme.startsWith('white') ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)';
      ctx.fillText(line2, textX, textY);
    }

    if (customText) {
      const cTextSize = parseInt(sliderCustomTextSize.value, 10);
      const cTextX = parseInt(sliderCustomTextX.value, 10);
      const cTextY = parseInt(sliderCustomTextY.value, 10);
      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.font = `500 ${cTextSize}px ${fontCustom}`;
      if (textBg) {
        ctx.save();
        ctx.shadowColor = 'transparent';
        const wCustom = ctx.measureText(customText).width;
        ctx.fillStyle = bgFillColor;
        const customBoxW = wCustom + 60;
        const customBoxH = Math.round(cTextSize * 1.95);
        const customBoxX = cTextX - wCustom - 30;
        const customBoxY = cTextY - Math.round(cTextSize * 1.25);
        drawRoundedRect(ctx, customBoxX, customBoxY, customBoxW, customBoxH, 12);
        ctx.restore();
        ctx.fillStyle = textColor;
      }
      ctx.fillText(customText, cTextX, cTextY);
    }

    ctx.restore();
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  function saveSettings() {
    const settings = {
      aspectRatio: selectAspectRatio.value,
      blur: sliderBlur.value,
      brightness: sliderBrightness.value,
      scale: sliderScale.value,
      frameType: selectFrameType.value,
      frameSize: sliderFrameSize.value,
      textTheme: selectTextTheme.value,
      textSize: sliderTextSize.value,
      textX: sliderTextX.value,
      textY: sliderTextY.value,
      customText: inputCustomText.value,
      imageFormat: selectImageFormat.value,
      customTextSize: sliderCustomTextSize.value,
      customTextX: sliderCustomTextX.value,
      customTextY: sliderCustomTextY.value,
      fontFamily: selectFontFamily.value
    };
    localStorage.setItem('yt_photo_settings', JSON.stringify(settings));
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem('yt_photo_settings');
      if (!saved) return;
      const settings = JSON.parse(saved);
      if (settings.aspectRatio !== undefined) selectAspectRatio.value = settings.aspectRatio;
      if (settings.blur !== undefined) { sliderBlur.value = settings.blur; valueBlur.textContent = `${settings.blur}px`; }
      if (settings.brightness !== undefined) { sliderBrightness.value = settings.brightness; valueBrightness.textContent = `${settings.brightness}%`; }
      if (settings.scale !== undefined) { sliderScale.value = settings.scale; valueScale.textContent = `${settings.scale}%`; }
      if (settings.frameType !== undefined) selectFrameType.value = settings.frameType;
      if (settings.frameSize !== undefined) { sliderFrameSize.value = settings.frameSize; valueFrameSize.textContent = `${settings.frameSize}px`; }
      if (settings.textTheme !== undefined) selectTextTheme.value = settings.textTheme;
      if (settings.textSize !== undefined) { sliderTextSize.value = settings.textSize; valueTextSize.textContent = `${settings.textSize}px`; }
      if (settings.textX !== undefined) { sliderTextX.value = settings.textX; valueTextX.textContent = `${settings.textX}px`; }
      if (settings.textY !== undefined) { sliderTextY.value = settings.textY; valueTextY.textContent = `${settings.textY}px`; }
      if (settings.customText !== undefined) inputCustomText.value = settings.customText;
      if (settings.imageFormat !== undefined) selectImageFormat.value = settings.imageFormat;
      if (settings.customTextSize !== undefined) { sliderCustomTextSize.value = settings.customTextSize; valueCustomTextSize.textContent = `${settings.customTextSize}px`; }
      if (settings.customTextX !== undefined) { sliderCustomTextX.value = settings.customTextX; valueCustomTextX.textContent = `${settings.customTextX}px`; }
      if (settings.customTextY !== undefined) { sliderCustomTextY.value = settings.customTextY; valueCustomTextY.textContent = `${settings.customTextY}px`; }
      if (settings.fontFamily !== undefined) selectFontFamily.value = settings.fontFamily;
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }

  const inputsToWatch = [
    inputMake, inputModel, inputLens, inputFocalLength,
    inputFNumber, inputExposureTime, inputIso, inputCustomText,
    selectTextTheme, selectFrameType, sliderTextSize, sliderTextX, sliderTextY,
    selectAspectRatio, selectImageFormat,
    sliderCustomTextSize, sliderCustomTextX, sliderCustomTextY,
    selectFontFamily
  ];

  inputsToWatch.forEach(input => {
    input.addEventListener('input', () => { drawCard(); saveSettings(); });
    input.addEventListener('change', () => { drawCard(); saveSettings(); });
  });

  sliderBlur.addEventListener('input', (e) => { valueBlur.textContent = `${e.target.value}px`; drawCard(); saveSettings(); });
  sliderBrightness.addEventListener('input', (e) => { valueBrightness.textContent = `${e.target.value}%`; drawCard(); saveSettings(); });
  sliderScale.addEventListener('input', (e) => { valueScale.textContent = `${e.target.value}%`; drawCard(); saveSettings(); });
  sliderFrameSize.addEventListener('input', (e) => { valueFrameSize.textContent = `${e.target.value}px`; drawCard(); saveSettings(); });
  sliderTextSize.addEventListener('input', (e) => { valueTextSize.textContent = `${e.target.value}px`; drawCard(); saveSettings(); });
  sliderTextX.addEventListener('input', (e) => { valueTextX.textContent = `${e.target.value}px`; drawCard(); saveSettings(); });
  sliderTextY.addEventListener('input', (e) => { valueTextY.textContent = `${e.target.value}px`; drawCard(); saveSettings(); });
  sliderCustomTextSize.addEventListener('input', (e) => { valueCustomTextSize.textContent = `${e.target.value}px`; drawCard(); saveSettings(); });
  sliderCustomTextX.addEventListener('input', (e) => { valueCustomTextX.textContent = `${e.target.value}px`; drawCard(); saveSettings(); });
  sliderCustomTextY.addEventListener('input', (e) => { valueCustomTextY.textContent = `${e.target.value}px`; drawCard(); saveSettings(); });

  function updateAspectRatioUI() {
    const ratioVal = selectAspectRatio.value;
    if (ratioVal === '9-16') {
      previewCanvas.style.aspectRatio = '9/16';
      previewTitle.textContent = 'プレビュー (9:16)';
      previewDimensions.textContent = '1080 × 1920 (Shorts)';
      downloadTip.textContent = '※ ダウンロードされる画像は 1080×1920 ピクセルの高画質画像になります。';
      downloadBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>画像をダウンロード (9:16)`;
    } else if (ratioVal === '3-4') {
      previewCanvas.style.aspectRatio = '3/4';
      previewTitle.textContent = 'プレビュー (3:4)';
      previewDimensions.textContent = '1080 × 1440 (Instagram)';
      downloadTip.textContent = '※ ダウンロードされる画像は 1080×1440 ピクセルの高画質画像になります。';
      downloadBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>画像をダウンロード (3:4)`;
    } else if (ratioVal === '4-3') {
      previewCanvas.style.aspectRatio = '4/3';
      previewTitle.textContent = 'プレビュー (4:3)';
      previewDimensions.textContent = '1440 × 1080 (4:3)';
      downloadTip.textContent = '※ ダウンロードされる画像は 1440×1080 ピクセルの高画質画像になります。';
      downloadBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>画像をダウンロード (4:3)`;
    } else {
      previewCanvas.style.aspectRatio = '16/9';
      previewTitle.textContent = 'プレビュー (16:9)';
      previewDimensions.textContent = '1920 × 1080 (Full HD)';
      downloadTip.textContent = '※ ダウンロードされる画像は 1920×1080 ピクセルの高画質画像になります。';
      downloadBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>画像をダウンロード (16:9)`;
    }
  }

  selectAspectRatio.addEventListener('change', () => {
    updateAspectRatioUI();
    if (loadedImage) drawCard();
    saveSettings();
  });

  downloadBtn.addEventListener('click', () => {
    if (!loadedImage) return;
    const format = selectImageFormat.value;
    let mimeType = 'image/jpeg';
    let ext = 'jpg';
    let quality = 0.95;
    if (format === 'png') { mimeType = 'image/png'; ext = 'png'; quality = undefined; }
    const dataUrl = previewCanvas.toDataURL(mimeType, quality);
    const link = document.createElement('a');
    const modelStr = inputModel.value.trim().replace(/[^a-zA-Z0-9]/g, '_');
    const filename = modelStr ? `yt_photo_${modelStr}.${ext}` : `youtube_photo_card.${ext}`;
    link.download = filename;
    link.href = dataUrl;
    link.click();
  });
});
