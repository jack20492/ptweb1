import { PartialType } from '@nestjs/mapped-types';
import { CreateHomeContentDto } from './create-home-content.dto';

export class UpdateHomeContentDto extends PartialType(CreateHomeContentDto) {}