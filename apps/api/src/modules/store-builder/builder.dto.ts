import { IsArray, IsBoolean, IsObject, IsOptional, IsString, Length } from 'class-validator';

export class ApplyTemplateDto {
  @IsString() @Length(2, 40) templateKey: string;
}

export class UpsertPageDto {
  @IsString() @Length(1, 120) title: string;
  @IsArray() sections: unknown[];
  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpsertLandingDto {
  @IsOptional() @IsArray() sections?: unknown[];
  @IsOptional() @IsObject() theme?: Record<string, unknown>;
  @IsOptional() @IsBoolean() published?: boolean;
}