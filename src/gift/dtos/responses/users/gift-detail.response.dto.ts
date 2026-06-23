import { Exclude } from 'class-transformer';

import { UserGiftResponseDto } from './gift.response.dto';

@Exclude()
export class UserGiftDetailResponseDto extends UserGiftResponseDto {}
