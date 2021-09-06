import { BadRequestException, Injectable } from '@nestjs/common';
import * as neatCsv from 'neat-csv';

@Injectable()
export class CSVParser {
  async extractDataFromCSV(buffer: Buffer, keys: string[]): Promise<any> {
    const output = await neatCsv(buffer.toString('utf-8'));

    const first = output[0];
    Object.keys(first).forEach((obj) => {
      if (!keys.includes(obj.trim())) {
        throw new BadRequestException(
          `File Headers not matched with given keys - key is ${obj}!`,
        );
      }
    });
    return output;
  }
}
