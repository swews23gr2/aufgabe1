import { Global, Module } from '@nestjs/common';
import { BannerService } from './banner.service.js';
import { ResponseTimeInterceptor } from './response-time.interceptor.js';

@Global()
@Module({
    providers: [BannerService, ResponseTimeInterceptor],
    exports: [BannerService, ResponseTimeInterceptor],
})
export class LoggerModule {}
