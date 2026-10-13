/**
 * Reduce una foto del celular (3-8 MB) a ~0,3-1 MB antes de subirla: máx. 2000 px, JPEG 85 %.
 * Respeta la orientación EXIF. Si algo falla, o el resultado no es más liviano, devuelve el archivo original.
 * El backend vuelve a validar y optimizar la imagen.
 */
export async function compressImage(file: File, maxDimension = 2000, quality = 0.85): Promise<File> {
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;

    // Fondo blanco: las PNG con transparencia no quedan negras al pasar a JPEG
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') || 'referencia';
    return new File([blob], `${name}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
