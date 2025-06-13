import { PartialType } from '@nestjs/swagger';
import { CreateHomeContentDto } from './create-home-content.dto';

export class UpdateHomeContentDto extends PartialType(CreateHomeContentDto) {}