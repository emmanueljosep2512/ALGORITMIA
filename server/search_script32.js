import fs from 'fs';

const scriptContent = fs.readFileSync('script_32.js', 'utf8');

console.log("Searching script_32.js...");

// Encontrar todas las cadenas de tipo JSON o llamadas a JSON.parse en el script
// En React/Next/Relay/GraphQL de Instagram, a veces hay grandes bloques JSON en el script
// Busquemos cualquier cosa que se parezca a un JSON largo o que contenga datos del post
const keywords = [
    'like_count', 
    'edge_media_preview_like', 
    'edge_media_to_comment', 
    'comment_count', 
    'video_view_count',
    'view_count',
    'play_count',
    'display_url',
    'shortcode',
    'username',
    'full_name'
];

keywords.forEach(kw => {
    const idx = scriptContent.indexOf(kw);
    if (idx !== -1) {
        console.log(`Keyword "${kw}" found at index ${idx}. Context: ...${scriptContent.substring(idx - 50, idx + 150)}...`);
    } else {
        console.log(`Keyword "${kw}" not found.`);
    }
});

// Tratemos de buscar cualquier JSON.parse(...) en el script
// En script_32, ¿hay llamadas a JSON.parse?
const jsonParses = [...scriptContent.matchAll(/JSON\.parse\((['"`])([\s\S]+?)\1\)/g)];
console.log(`Encontrados ${jsonParses.length} JSON.parse`);
if (jsonParses.length > 0) {
    jsonParses.forEach((m, idx) => {
        const parsedText = m[2];
        console.log(`JSON.parse #${idx} length: ${parsedText.length}`);
        // Guardar para inspeccionar
        fs.writeFileSync(`json_parse_32_${idx}.txt`, parsedText);
        
        // Ver si contiene datos
        if (parsedText.includes('like_count') || parsedText.includes('edge_media_preview_like') || parsedText.includes('video_view_count')) {
            console.log(`🌟 JSON.parse #${idx} contiene datos clave!`);
            // Intentar des-escapar e interpretar
            try {
                // El string está escapado para JS. Por ejemplo, "{\"shortcode\":\"...\"}"
                // Al estar entre comillas simples/dobles, podemos interpretarlo con eval o parsear
                // Si es un string literal de JS escapado, podemos usar un truco:
                const unescaped = JSON.parse('"' + parsedText.replace(/"/g, '\\"') + '"'); // esto a veces falla
                // Mejor, guardemos el string parseado real ejecutando una función o similar, o simplemente decodificando escapes.
            } catch(e) {
                console.log(`Failed to parse/unescape JSON.parse #${idx}: ${e.message}`);
            }
        }
    });
}
