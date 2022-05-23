import { BadRequestException, Injectable } from '@nestjs/common';

import { ApiService } from '../api/api.service';
import { EncryptionService } from '../encryption/encryption.service';
import { YggdrasilService } from '../yggdrasil/yggdrasil.service';
import { LocationResponse } from './types/responses';

@Injectable()
export class LocationService {
    constructor(
        private readonly _encryptionService: EncryptionService,
        private readonly _apiService: ApiService,
        private readonly _yggdrasilService: YggdrasilService
    ) {}

    /**
     * Gets locations (IPv6) of all registered Yggdrasil twins.
     * @return {LocationResponse} - The locations.
     */
    getLocations(): LocationResponse {
        return {
            data: [
                {
                    id: 1,
                    location: 'localhost',
                },
                {
                    id: 2,
                    location: 'localhost',
                },
            ],
        };
    }

    /**
     * Gets current location (IPv6) of own connection.
     * @return {string} - Own address.
     * @return {Error} - Error.
     */
    getOwnLocation(): Promise<string | Error> {
        return this._yggdrasilService.getSelf();
    }

    /**
     * Registers digital twin location to the central users backend API.
     * @param {Object} obj - Object.
     * @param {string} obj.doubleName - Username paired with .3bot.
     * @param {string} obj.derivedSeed - The derived seed.
     * @param {string} obj.yggdrasilAddress - Unsigned Yggdrasil address.
     */
    async registerDigitalTwin({
        doubleName,
        derivedSeed,
        yggdrasilAddress,
    }: {
        doubleName: string;
        derivedSeed: string;
        yggdrasilAddress: string;
    }): Promise<void> {
        const seed = this._encryptionService.decodeSeed(derivedSeed);
        const keyPair = this._encryptionService.getKeyPair(seed);
        const data = this._encryptionService.decodeAddress(yggdrasilAddress);
        const signedAddress = this._encryptionService.signAddress({ data, secretKey: keyPair.secretKey });
        try {
            await this._apiService.registerDigitalTwin({ doubleName, signedAddress });
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}