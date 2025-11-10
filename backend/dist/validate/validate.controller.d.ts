import { ValidateService } from './validate.service';
import { ValidateDto } from './dto/validate.dto';
export declare class ValidateController {
    private readonly validateService;
    constructor(validateService: ValidateService);
    validate(dto: ValidateDto): Promise<{
        valid: boolean;
        error?: undefined;
    } | {
        error: string;
        valid: boolean;
    }>;
}
