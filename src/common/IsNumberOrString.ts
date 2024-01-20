import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint()
export class IsNumberOrString implements ValidatorConstraintInterface {
  validate(value: any) {
    return typeof value === 'string' || typeof value === 'number';
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a string or a number conforming to the specified constraints`;
  }
}
