import { keccak256, encodePacked, toHex } from 'viem';

/**
 * Generate a cryptographically secure random secret note
 * Format: wk-<64 hex characters>
 */
export const generateSecret = (): string => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const hexString = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    return `wk-${hexString}`;
};

/**
 * Hash the secret to create commitment
 * Must match Solidity: keccak256(abi.encodePacked(secret))
 */
export const hashSecret = (secret: string): `0x${string}` => {
    // encodePacked with 'string' type matches Solidity's abi.encodePacked(string)
    return keccak256(encodePacked(['string'], [secret]));
};

/**
 * Validate secret format
 */
export const isValidSecret = (secret: string): boolean => {
    return /^wk-[a-f0-9]{64}$/i.test(secret);
};
