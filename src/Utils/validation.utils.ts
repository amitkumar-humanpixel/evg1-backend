import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'TimeValidation', async: true })
@Injectable()
export class TimeRule implements ValidatorConstraintInterface {
  async validate(value: any) {
    try {
      let isValid = true;
      for (let index = 0; index < value.length; index++) {
        const element = value[index];
        if (element.isChecked === 'true') {
          if (
            element.startTime.includes(':') &&
            element.finishTime.includes(':')
          ) {
            const startHours = element.startTime.split(':');
            const endHours = element.finishTime.split(':');
            if (endHours[0] <= startHours[0]) {
              if (endHours[1] <= startHours[1]) {
                isValid = false;
              }
            }
          } else {
            isValid = false;
          }
        }
      }
      return isValid;
    } catch (e) {
      return false;
    }
  }
}
