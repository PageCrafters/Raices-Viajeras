<?php
// Aqui junto la logica de imagen para no repetir el mismo bloque en varios endpoints.
// Asi la reutilizo igual desde viajes, provincias, cesta y admin.

/**
 * Comprueba si el valor guardado parece una ruta o URL y no un blob real.
 *
 * @param string $value Valor guardado en base de datos.
 * @return bool
 */
function rv_image_looks_like_path(string $value): bool
{
    return (bool) (
        preg_match('/^(https?:\/\/|\.\/|\/|img\/|[A-Za-z0-9_\-]+\/)/', $value) ||
        preg_match('/\.[a-zA-Z0-9]{2,5}$/', $value)
    );
}

/**
 * Detecta el mime del blob para no devolver todo como JPEG aunque venga otro formato.
 *
 * @param string $binaryValue Contenido binario de la imagen.
 * @return string
 */
function rv_detect_image_mime(string $binaryValue): string
{
    if (function_exists('finfo_buffer')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo !== false) {
            $mime = finfo_buffer($finfo, $binaryValue);
            finfo_close($finfo);

            if (is_string($mime) && substr($mime, 0, 6) === 'image/') {
                return $mime;
            }
        }
    }

    if (substr($binaryValue, 0, 4) === "\x89PNG") {
        return 'image/png';
    }

    if (substr($binaryValue, 0, 3) === "\xFF\xD8\xFF") {
        return 'image/jpeg';
    }

    if (substr($binaryValue, 0, 6) === 'GIF87a' || substr($binaryValue, 0, 6) === 'GIF89a') {
        return 'image/gif';
    }

    if (substr($binaryValue, 0, 2) === 'BM') {
        return 'image/bmp';
    }

    if (substr($binaryValue, 0, 4) === 'RIFF' && substr($binaryValue, 8, 4) === 'WEBP') {
        return 'image/webp';
    }

    return 'image/jpeg';
}

/**
 * Convierte una ruta o un blob al formato que entiende el frontend.
 *
 * @param string|null $value Valor original guardado en base de datos.
 * @return string|null
 */
function rv_resolve_image_value(?string $value): ?string
{
    if ($value === null || $value === '') {
        return null;
    }

    if (rv_image_looks_like_path($value)) {
        return $value;
    }

    return 'data:' . rv_detect_image_mime($value) . ';base64,' . base64_encode($value);
}
?>
