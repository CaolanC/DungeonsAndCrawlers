import crypto from 'crypto';

export function md5(input) {
    return crypto.createHash('md5').update(input).digest('hex');
}
