import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isAfterStartDate', async: false })
export class IsAfterStartDateConstraint
  implements ValidatorConstraintInterface
{
  validate(endDate: string, args: ValidationArguments): boolean {
    const dto = args.object as any;

    if (!dto.startDate || !endDate) {
      return true;
    }

    return new Date(endDate) > new Date(dto.startDate);
  }

  defaultMessage(): string {
    return 'End date must be later than start date';
  }
}