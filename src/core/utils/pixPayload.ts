/**
 * @file pixPayload.ts
 * Utilitário para gerar o payload (BR Code) do PIX (EMVCo).
 */

/**
 * Calcula o CRC16 (CCITT-FALSE) do payload.
 */
const crc16 = (payload: string): string => {
    const polynomial = 0x1021;
    let crc = 0xFFFF;

    for (let i = 0; i < payload.length; i++) {
        let c = payload.charCodeAt(i);
        crc ^= (c << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ polynomial;
            } else {
                crc = crc << 1;
            }
        }
    }

    // Retorna hexadecimal em maiúsculo com 4 dígitos padded
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
};

/**
 * Formata um campo TLV (Type-Length-Value).
 */
const formatTLV = (id: string, value: string): string => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
};

/**
 * Normaliza o texto removendo acentos e caracteres especiais indesejados.
 */
const normalizeText = (text: string): string => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-zA-Z0-9 ]/g, '')   // Mantém apenas alfanuméricos e espaços
        .substring(0, 25);               // Limita tamanho para evitar payloads gigantes
};

interface PixPayloadParams {
    key: string;
    name: string;
    city?: string;
    transactionId?: string;
    description?: string; // Não usado no padrão estático simples, mas pode ser adicionado
    amount?: number; // Opcional
}

/**
 * Gera o código "Copy and Paste" (Payload BR Code) do PIX.
 */
export const generatePixPayload = ({
    key,
    name,
    city = 'BRASILIA',
    transactionId = '***',
    amount
}: PixPayloadParams): string => {
    const cleanKey = key.trim();
    if (!cleanKey) return '';

    const cleanName = normalizeText(name || 'USER RACHADINHA') || 'USER RACHADINHA';
    const cleanCity = normalizeText(city || 'BRASILIA') || 'BRASILIA';
    const cleanTxId = normalizeText(transactionId) || '***';

    // 00 - Payload Format Indicator
    const pfi = formatTLV('00', '01');

    // 26 - Merchant Account Information (GUI + Key)
    const gui = formatTLV('00', 'br.gov.bcb.pix');
    const keyField = formatTLV('01', cleanKey);
    const descriptionField = ''; // Opcional, não vamos usar para manter simples
    const merchantAccount = formatTLV('26', `${gui}${keyField}${descriptionField}`);

    // 52 - Merchant Category Code (0000 = Geral/Não especificado ou 5732 = Serviços)
    // 0000 is common for personal static QRs
    const mcc = formatTLV('52', '0000');

    // 53 - Transaction Currency (986 = BRL)
    const currency = formatTLV('53', '986');

    // 54 - Transaction Amount (Optional)
    const amountField = amount ? formatTLV('54', amount.toFixed(2)) : '';

    // 58 - Country Code
    const country = formatTLV('58', 'BR');

    // 59 - Merchant Name
    const merchantName = formatTLV('59', cleanName);

    // 60 - Merchant City
    const merchantCity = formatTLV('60', cleanCity);

    // 62 - Additional Data Field Template (TxId)
    const txIdField = formatTLV('05', cleanTxId);
    const additionalData = formatTLV('62', txIdField);

    // Monta o payload parcial
    const payload = `${pfi}${merchantAccount}${mcc}${currency}${amountField}${country}${merchantName}${merchantCity}${additionalData}6304`;

    // Calcula CRC
    const crc = crc16(payload);

    // Retorna payload completo
    return `${payload}${crc}`;
};
